import { PLATFORMS, MESSAGE_TYPES } from '../utils/constants.js';

export const normalizer = {
  /**
   * Normalizes incoming Telegram webhook update.
   */
  normalizeTelegram(body) {
    if (body.callback_query) {
      const cb = body.callback_query;
      return {
        platform: PLATFORMS.TELEGRAM,
        external_chat_id: String(cb.message?.chat?.id || cb.from?.id),
        sender_name: `${cb.from?.first_name || ''} ${cb.from?.last_name || ''}`.trim() || cb.from?.username || 'Telegram User',
        sender_phone: '',
        sender_email: '',
        message_type: MESSAGE_TYPES.BUTTON_CLICK,
        text_content: cb.data || cb.message?.text || '',
        button_payload: cb.data || '',
        media_url: '',
        media_type: '',
        timestamp: new Date(),
        raw_payload: body,
      };
    }

    const message = body.message || body.edited_message || {};
    const chat = message.chat || {};
    const from = message.from || {};

    let message_type = MESSAGE_TYPES.TEXT;
    let text_content = message.text || message.caption || '';
    let media_url = '';
    let media_type = '';

    if (message.photo && message.photo.length > 0) {
      message_type = MESSAGE_TYPES.MEDIA;
      media_type = 'image/jpeg';
      media_url = `telegram-photo-file-id://${message.photo[message.photo.length - 1].file_id}`;
    } else if (message.document) {
      message_type = MESSAGE_TYPES.MEDIA;
      media_type = message.document.mime_type || 'application/pdf';
      media_url = `telegram-doc-file-id://${message.document.file_id}`;
    } else if (message.voice) {
      message_type = MESSAGE_TYPES.VOICE;
      media_type = message.voice.mime_type || 'audio/ogg';
    }

    return {
      platform: PLATFORMS.TELEGRAM,
      external_chat_id: String(chat.id || from.id),
      sender_name: `${from.first_name || ''} ${from.last_name || ''}`.trim() || from.username || 'Telegram User',
      sender_phone: message.contact?.phone_number || '',
      sender_email: '',
      message_type,
      text_content,
      media_url,
      media_type,
      button_payload: '',
      timestamp: message.date ? new Date(message.date * 1000) : new Date(),
      raw_payload: body,
    };
  },

  /**
   * Normalizes incoming WhatsApp Cloud API webhook.
   */
  normalizeWhatsApp(body) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const contact = changes?.contacts?.[0];
    const message = changes?.messages?.[0];

    if (!message) return null;

    const sender_phone = message.from || contact?.wa_id || '';
    const sender_name = contact?.profile?.name || `+${sender_phone}`;

    let message_type = MESSAGE_TYPES.TEXT;
    let text_content = '';
    let media_url = '';
    let media_type = '';
    let button_payload = '';

    if (message.type === 'text') {
      text_content = message.text?.body || '';
    } else if (message.type === 'interactive') {
      message_type = MESSAGE_TYPES.BUTTON_CLICK;
      const interactive = message.interactive;
      if (interactive.type === 'button_reply') {
        button_payload = interactive.button_reply.id;
        text_content = interactive.button_reply.title;
      } else if (interactive.type === 'list_reply') {
        button_payload = interactive.list_reply.id;
        text_content = interactive.list_reply.title;
      }
    } else if (message.type === 'button') {
      message_type = MESSAGE_TYPES.BUTTON_CLICK;
      button_payload = message.button?.payload || '';
      text_content = message.button?.text || '';
    } else if (['image', 'document', 'video', 'audio'].includes(message.type)) {
      message_type = MESSAGE_TYPES.MEDIA;
      media_type = message[message.type]?.mime_type || message.type;
      media_url = `whatsapp-media-id://${message[message.type]?.id}`;
      text_content = message[message.type]?.caption || '';
    }

    return {
      platform: PLATFORMS.WHATSAPP,
      external_chat_id: sender_phone,
      sender_name,
      sender_phone,
      sender_email: '',
      message_type,
      text_content,
      media_url,
      media_type,
      button_payload,
      timestamp: message.timestamp ? new Date(parseInt(message.timestamp, 10) * 1000) : new Date(),
      raw_payload: body,
    };
  },

  /**
   * Normalizes incoming Discord Gateway / Webhook message.
   */
  normalizeDiscord(body) {
    const author = body.author || body.user || {};
    return {
      platform: PLATFORMS.DISCORD,
      external_chat_id: String(body.channel_id || body.chat_id || author.id),
      sender_name: author.global_name || author.username || 'Discord User',
      sender_phone: '',
      sender_email: '',
      message_type: body.data?.custom_id ? MESSAGE_TYPES.BUTTON_CLICK : MESSAGE_TYPES.TEXT,
      text_content: body.content || body.data?.custom_id || '',
      button_payload: body.data?.custom_id || '',
      media_url: body.attachments?.[0]?.url || '',
      media_type: body.attachments?.[0]?.content_type || '',
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      raw_payload: body,
    };
  },

  /**
   * Normalizes incoming Instagram Graph API webhook message.
   */
  normalizeInstagram(body) {
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];
    if (!messaging) return null;

    const sender_id = messaging.sender?.id || '';
    const message = messaging.message || {};

    let message_type = MESSAGE_TYPES.TEXT;
    let text_content = message.text || '';
    let button_payload = '';

    if (messaging.postback) {
      message_type = MESSAGE_TYPES.BUTTON_CLICK;
      button_payload = messaging.postback.payload || '';
      text_content = messaging.postback.title || button_payload;
    } else if (message.quick_reply) {
      message_type = MESSAGE_TYPES.BUTTON_CLICK;
      button_payload = message.quick_reply.payload || '';
    }

    return {
      platform: PLATFORMS.INSTAGRAM,
      external_chat_id: sender_id,
      sender_name: `Instagram User (${sender_id.slice(-4)})`,
      sender_phone: '',
      sender_email: '',
      message_type,
      text_content,
      media_url: message.attachments?.[0]?.payload?.url || '',
      media_type: message.attachments?.[0]?.type || '',
      button_payload,
      timestamp: messaging.timestamp ? new Date(messaging.timestamp) : new Date(),
      raw_payload: body,
    };
  },

  /**
   * Normalizes incoming LinkedIn message webhook.
   */
  normalizeLinkedIn(body) {
    const sender = body.sender || body.actor || {};
    return {
      platform: PLATFORMS.LINKEDIN,
      external_chat_id: String(body.conversation_id || body.chat_id || sender.id),
      sender_name: sender.name || `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || 'LinkedIn Member',
      sender_phone: '',
      sender_email: sender.email || '',
      message_type: MESSAGE_TYPES.TEXT,
      text_content: body.text || body.message?.text || '',
      media_url: body.attachment_url || '',
      media_type: body.attachment_type || '',
      button_payload: '',
      timestamp: new Date(),
      raw_payload: body,
    };
  },

  /**
   * Normalizes incoming Website Live Chat Widget message.
   */
  normalizeWebsite(body) {
    const buttonPayload = body.button_payload || body.button_id || (typeof body.button === 'string' ? body.button : body.button?.id) || '';
    return {
      platform: PLATFORMS.WEBCHAT,
      external_chat_id: String(body.chat_id || body.session_id || body.user_id),
      sender_name: body.sender_name || 'Website Visitor',
      sender_phone: body.sender_phone || '',
      sender_email: body.sender_email || '',
      message_type: buttonPayload ? MESSAGE_TYPES.BUTTON_CLICK : MESSAGE_TYPES.TEXT,
      text_content: body.text || body.message || body.button?.label || buttonPayload || '',
      media_url: body.media_url || '',
      media_type: body.media_type || '',
      button_payload: buttonPayload,
      timestamp: new Date(),
      raw_payload: body,
    };
  },
};

export default normalizer;
