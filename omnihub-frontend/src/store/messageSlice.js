import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { DIRECTION, MESSAGE_STATUS, SENDER_TYPE } from '../utils/constants.js';
import { conversationService } from '../services/conversationService.js';
import { menuService } from '../services/menuService.js';

/* ------------------------------------------------------------
   Messages - history per conversation, the composer draft, and the
   human send path.
   ------------------------------------------------------------ */

export const loadMessages = createAsyncThunk('messages/load', async (conversationId) => ({
  conversationId,
  messages: await conversationService.getMessages(conversationId),
}));

export const retryFailedMessage = createAsyncThunk(
  'messages/retryFailed',
  async ({ conversationId, messageId }) => ({
    conversationId,
    message: conversationService.queueMessageRetry(conversationId, messageId),
  }),
);

export const applyDeliveryReceipt = createAsyncThunk(
  'messages/applyDeliveryReceipt',
  async ({ conversationId, messageId, status, failureReason }) => ({
    conversationId,
    message: conversationService.updateMessageDeliveryStatus(conversationId, messageId, status, failureReason),
  }),
);

export const activateMenuButton = createAsyncThunk(
  'messages/activateMenuButton',
  async ({ conversationId, platform, button }) => {
    if (!button?.id || !button.label) throw new Error('That interactive menu option is invalid.');
    const menu = menuService.getMenu(platform);
    const asset = button.action === 'media'
      ? menu.mediaAssets.find((item) => item.id === button.media_id)
      : null;
    if (button.action === 'media' && (!asset || (!asset.dataUrl && !asset.fallbackUrl))) {
      throw new Error('The media asset for this option is missing. Update the menu before trying again.');
    }
    if (!['reply', 'input', 'handover', 'media'].includes(button.action)) {
      throw new Error('This menu action is not supported.');
    }
    const inbound = conversationService.appendMessage(conversationId, {
      sender_type: SENDER_TYPE.USER,
      direction: DIRECTION.INBOUND,
      text_content: button.label,
      status: MESSAGE_STATUS.READ.id,
      is_menu_interaction: true,
    });
    const attachment = asset
      ? (asset.dataUrl
        ? { media_url: asset.dataUrl, media_name: asset.name, media_type: asset.type }
        : { media_url: asset.fallbackUrl, media_name: asset.name, media_type: asset.type, media_is_fallback: true })
      : {};
    const messageText = button.action === 'reply'
      ? button.reply
      : button.action === 'input'
        ? 'Please type your question below and our team will help.'
        : button.action === 'handover'
          ? (button.reply || 'I’m connecting you with a human teammate. This is a local preview; no agent was actually assigned.')
          : button.action === 'media'
            ? `Here is the resource you requested: ${asset?.name || 'media resource'}`
            : '';
    const outbound = conversationService.appendMessage(conversationId, {
      sender_type: SENDER_TYPE.BOT,
      direction: DIRECTION.OUTBOUND,
      text_content: messageText,
      status: MESSAGE_STATUS.SENT.id,
      buttons: button.action === 'submenu' ? button.children : [],
      ...(button.action === 'media' ? attachment : {}),
      is_menu_interaction: true,
    });
    // Dispatch click event to backend API
    menuService.triggerButtonClick({
      conversationId,
      buttonId: button.id,
      payload: button.id,
      platform,
    }).catch(() => {});

    return { conversationId, messages: [inbound, outbound] };
  },
);

/**
 * Human agent sends a message.
 *
 * PRD 9.4: when Auto-Pilot is OFF the automated triggers are disabled for the
 * thread, so an agent reply always dispatches immediately.
 */
export const sendMessage = createAsyncThunk(
  'messages/send',
  async ({ conversationId, text, buttons = [] }, { getState }) => {
    const body = text.trim();
    if (!body) throw new Error('Type a message before sending.');
    const conversation = getState().conversations.items.find((item) => item.id === conversationId);
    const media = conversation?.platform ? menuService.findMediaForText(conversation.platform, body) : null;
    const message = await conversationService.appendMessage(conversationId, {
      sender_type: SENDER_TYPE.AGENT,
      direction: DIRECTION.OUTBOUND,
      text_content: body,
      status: MESSAGE_STATUS.SENT.id,
      author_name: getState().messages.agentName,
      auto_pilot_at_send: conversation?.auto_pilot || null,
      buttons,
      ...(media || {}),
    });
    return { conversationId, message };
  },
);

const initialState = {
  byConversation: {},
  status: 'idle',
  sending: false,
  error: null,
  menuActionError: null,
  retryingMessageId: null,
  retryError: null,
  retryErrorMessageId: null,
  /** Per-conversation composer text, so drafts survive panel switches. */
  drafts: {},
  typing: {},
  agentName: 'You',
};

const EMPTY_MESSAGES = [];

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setDraft(state, action) {
      const { conversationId, text } = action.payload;
      state.drafts[conversationId] = text;
    },
    clearDraft(state, action) {
      delete state.drafts[action.payload];
    },
    clearError(state) {
      state.error = null;
    },
    clearMenuActionError(state) {
      state.menuActionError = null;
    },
    /** Socket event: new_message. */
    receiveMessage(state, action) {
      const conversationId = action.payload?.conversationId || action.payload?.conversation_id || action.payload?.message?.conversation_id;
      const message = action.payload?.message || action.payload;
      if (!conversationId || !message) return;
      const msgId = message.id || message._id;
      const existing = state.byConversation[conversationId] || [];
      if (existing.some((item) => (item.id || item._id) === msgId)) return;
      state.byConversation[conversationId] = [...existing, { ...message, id: msgId }];
    },
    /** Socket event: typing. */
    setTyping(state, action) {
      const { conversationId, isTyping } = action.payload;
      state.typing[conversationId] = isTyping;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.byConversation[action.payload.conversationId] = action.payload.messages;
        state.status = 'ready';
      })
      .addCase(retryFailedMessage.fulfilled, (state, action) => {
        const thread = state.byConversation[action.payload.conversationId] || [];
        state.byConversation[action.payload.conversationId] = thread.map((message) => (
          message.id === action.payload.message.id ? action.payload.message : message
        ));
        state.retryingMessageId = null;
        state.retryError = null;
        state.retryErrorMessageId = null;
        state.error = null;
      })
      .addCase(retryFailedMessage.pending, (state, action) => {
        state.retryingMessageId = action.meta.arg.messageId;
        state.retryError = null;
        state.retryErrorMessageId = null;
      })
      .addCase(retryFailedMessage.rejected, (state, action) => {
        state.retryingMessageId = null;
        state.retryError = action.error.message;
        state.retryErrorMessageId = action.meta.arg.messageId;
        state.error = action.error.message;
      })
      .addCase(applyDeliveryReceipt.fulfilled, (state, action) => {
        const thread = state.byConversation[action.payload.conversationId] || [];
        state.byConversation[action.payload.conversationId] = thread.map((message) => (
          message.id === action.payload.message.id ? action.payload.message : message
        ));
      })
      .addCase(applyDeliveryReceipt.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(activateMenuButton.pending, (state) => {
        state.menuActionError = null;
      })
      .addCase(activateMenuButton.fulfilled, (state, action) => {
        state.menuActionError = null;
        const thread = state.byConversation[action.payload.conversationId] || [];
        state.byConversation[action.payload.conversationId] = [...thread, ...action.payload.messages];
      })
      .addCase(activateMenuButton.rejected, (state, action) => {
        state.menuActionError = action.error.message;
      })
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        state.byConversation[conversationId] = [...(state.byConversation[conversationId] || []), message];
        delete state.drafts[conversationId];
        state.sending = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.error.message;
      });
  },
});

export const { setDraft, clearDraft, clearError, clearMenuActionError, receiveMessage, setTyping } = messageSlice.actions;

/* -------- Selectors -------- */

export const selectMessages = (conversationId) => (state) => state.messages.byConversation[conversationId] || EMPTY_MESSAGES;
export const selectDraft = (conversationId) => (state) => state.messages.drafts[conversationId] || '';
export const selectIsTyping = (conversationId) => (state) => Boolean(state.messages.typing[conversationId]);

export default messageSlice.reducer;