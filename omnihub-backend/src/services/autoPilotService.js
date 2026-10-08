import { Conversation, Message, PendingApproval } from '../models/index.js';
import { aiService } from './aiService.js';
import dispatcher from './dispatcher.js';
import { emitEvent } from '../sockets/index.js';
import logger from '../utils/logger.js';
import {
  AUTOPILOT_MODES,
  APPROVAL_MODES,
  MESSAGE_DIRECTIONS,
  MESSAGE_STATUS,
} from '../utils/constants.js';

export const autoPilotService = {
  /**
   * Checks if Auto-Pilot is enabled for a given conversation.
   */
  isAutoPilotEnabled(conversation) {
    if (!conversation) return false;
    return conversation.auto_pilot === AUTOPILOT_MODES.ON || conversation.auto_pilot === 'ON';
  },

  /**
   * Main Auto-Pilot evaluation & execution pipeline.
   * Flow: Message Inbound -> Auto-pilot ON? -> AI reply -> Approval Mode? -> Send or Queue
   */
  async handleInboundMessage({ conversation, incomingMessage }) {
    if (!conversation || !incomingMessage) {
      return { handled: false, reason: 'MISSING_PARAMS' };
    }

    // 1. Check if Auto-Pilot is ON
    if (!this.isAutoPilotEnabled(conversation)) {
      logger.info(`[Auto-Pilot] Paused for conversation ${conversation._id} (Auto-Pilot is OFF / Human Takeover mode)`);
      return { handled: false, reason: 'AUTOPILOT_OFF' };
    }

    // 2. Loop prevention — only respond to incoming USER messages
    if (incomingMessage.direction !== MESSAGE_DIRECTIONS.INBOUND || incomingMessage.sender_type !== 'USER') {
      logger.debug(`[Auto-Pilot] Skipping non-user/outbound message for conversation ${conversation._id}`);
      return { handled: false, reason: 'NOT_INBOUND_USER' };
    }

    const textContent = incomingMessage.text_content?.trim();
    if (!textContent) {
      logger.debug(`[Auto-Pilot] No text content to process for conversation ${conversation._id}`);
      return { handled: false, reason: 'EMPTY_TEXT' };
    }

    logger.info(`[Auto-Pilot] Triggered for conversation ${conversation._id} on [${conversation.platform}]: "${textContent.slice(0, 40)}"`);

    // 3. Emit typing indicator to live clients
    emitEvent('typing', {
      conversationId: conversation._id,
      isTyping: true,
      sender_name: 'AI Auto-Pilot',
    });

    try {
      // 4. Fetch recent conversation history for rich context
      const historyDocs = await Message.find({ conversation_id: conversation._id })
        .sort({ created_at: -1 })
        .limit(6)
        .lean();

      const conversationHistory = historyDocs.reverse().map((m) => ({
        sender: m.sender_type === 'USER' ? 'Customer' : 'Assistant',
        text: m.text_content,
      }));

      // 5. Generate contextual AI response via Gemini
      const aiReply = await aiService.generateReply({
        userMessage: textContent,
        conversationHistory,
      });

      // Clear typing indicator
      emitEvent('typing', {
        conversationId: conversation._id,
        isTyping: false,
      });

      const replyText = aiReply?.text?.trim();
      if (!replyText) {
        logger.warn(`[Auto-Pilot] AI generated an empty response for conversation ${conversation._id}`);
        return { handled: false, reason: 'AI_REPLY_EMPTY' };
      }

      const isManualApproval = conversation.approval_mode === APPROVAL_MODES.MANUAL || conversation.approval_mode === 'MANUAL';

      // 6. Check Approval Mode: MANUAL holds draft, AUTO sends immediately
      if (isManualApproval) {
        logger.info(`[Auto-Pilot] Conversation ${conversation._id} is in MANUAL approval mode. Queuing draft for review...`);

        const pending = await PendingApproval.create({
          conversation_id: conversation._id,
          message_id: incomingMessage._id,
          proposed_text: replyText,
          source: 'AI Auto-Pilot Draft',
          status: 'PENDING',
        });

        // Broadcast pending approval draft to live dashboard
        emitEvent('pending_approval', {
          id: pending._id,
          _id: pending._id,
          conversation_id: conversation._id,
          conversationId: conversation._id,
          platform: conversation.platform,
          proposed_text: replyText,
          source: pending.source,
          status: 'PENDING',
          created_at: pending.createdAt,
          lead: {
            full_name: conversation.sender_name,
            email: conversation.sender_email,
            phone: conversation.sender_phone,
          },
          conversation: {
            id: conversation._id,
            sender_name: conversation.sender_name,
            platform: conversation.platform,
            external_chat_id: conversation.external_chat_id,
          },
        });

        emitEvent('conversation_update', {
          id: conversation._id,
          platform: conversation.platform,
          sender_name: conversation.sender_name,
          heldDraft: {
            id: pending._id,
            proposed_text: replyText,
            created_at: pending.createdAt,
          },
        });

        return {
          handled: true,
          action: 'QUEUED_FOR_APPROVAL',
          approvalId: pending._id,
          draftText: replyText,
        };
      }

      // 7. AUTO Approval: Dispatch outbound message directly to customer platform
      logger.info(`[Auto-Pilot] Conversation ${conversation._id} is in AUTO mode. Dispatching to [${conversation.platform}]...`);

      const dispatchResult = await dispatcher.dispatchOutboundMessage({
        platform: conversation.platform,
        external_chat_id: conversation.external_chat_id,
        text_content: replyText,
      });

      // 8. Create outbound BOT Message record
      const botMessage = await Message.create({
        conversation_id: conversation._id,
        platform: conversation.platform,
        sender_type: 'BOT',
        direction: MESSAGE_DIRECTIONS.OUTBOUND,
        text_content: replyText,
        status: dispatchResult.status || MESSAGE_STATUS.DELIVERED,
      });

      // 9. Update conversation timestamps
      conversation.last_activity_at = new Date();
      await conversation.save();

      // 10. Emit real-time events to all connected clients
      emitEvent('new_message', {
        conversation_id: conversation._id,
        platform: conversation.platform,
        sender_name: 'AI Auto-Pilot',
        message: {
          id: botMessage._id,
          _id: botMessage._id,
          conversation_id: conversation._id,
          platform: botMessage.platform,
          sender_name: 'AI Auto-Pilot',
          sender_type: 'BOT',
          direction: MESSAGE_DIRECTIONS.OUTBOUND,
          text_content: botMessage.text_content,
          status: botMessage.status,
          created_at: botMessage.created_at,
        },
      });

      emitEvent('conversation_update', {
        id: conversation._id,
        platform: conversation.platform,
        sender_name: conversation.sender_name,
        last_activity_at: conversation.last_activity_at,
        lastMessage: {
          text_content: botMessage.text_content,
          direction: botMessage.direction,
          created_at: botMessage.created_at,
        },
      });

      logger.info(`[Auto-Pilot] Successfully replied to ${conversation.platform} (${conversation.external_chat_id}): "${replyText.slice(0, 50)}"`);

      return {
        handled: true,
        action: 'SENT_DIRECTLY',
        messageId: botMessage._id,
        text: replyText,
      };
    } catch (error) {
      // Clear typing indicator on error
      emitEvent('typing', {
        conversationId: conversation._id,
        isTyping: false,
      });
      logger.error(`[Auto-Pilot Execution Error] ${error.message}`);
      return { handled: false, error: error.message };
    }
  },
};

export default autoPilotService;
