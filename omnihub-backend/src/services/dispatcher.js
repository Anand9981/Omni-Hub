import env from '../config/env.js';
import logger from '../utils/logger.js';
import { MESSAGE_STATUS } from '../utils/constants.js';

export const dispatcher = {
  /**
   * Send live Telegram message using Bot API
   */
  async sendTelegramMessage(chatId, text) {
    if (!env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN === 'demo_telegram_token') {
      logger.info(`[Dispatcher Mock Telegram] (${chatId}): "${text?.slice(0, 30)}"`);
      return { success: true, status: MESSAGE_STATUS.DELIVERED };
    }

    try {
      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      const data = await response.json();
      if (data.ok) {
        logger.info(`[Dispatcher Telegram Live] Delivered to ${chatId}: "${text?.slice(0, 30)}"`);
        return { success: true, status: MESSAGE_STATUS.DELIVERED, raw: data };
      }
      throw new Error(data.description || 'Telegram API failure');
    } catch (err) {
      logger.error(`[Dispatcher Telegram Error] ${err.message}`);
      return { success: false, status: MESSAGE_STATUS.FAILED, error: err.message };
    }
  },

  /**
   * Send live WhatsApp message using Meta Cloud API
   */
  async sendWhatsAppMessage(recipientPhone, text) {
    if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
      logger.info(`[Dispatcher Mock WhatsApp] (${recipientPhone}): "${text?.slice(0, 30)}"`);
      return { success: true, status: MESSAGE_STATUS.DELIVERED };
    }

    try {
      const url = `https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhone,
          type: 'text',
          text: { preview_url: false, body: text },
        }),
      });
      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        logger.info(`[Dispatcher WhatsApp Live] Delivered to ${recipientPhone}: "${text?.slice(0, 30)}"`);
        return { success: true, status: MESSAGE_STATUS.DELIVERED, raw: data };
      }
      throw new Error(data.error?.message || 'WhatsApp API failure');
    } catch (err) {
      logger.error(`[Dispatcher WhatsApp Error] ${err.message}`);
      return { success: false, status: MESSAGE_STATUS.FAILED, error: err.message };
    }
  },

  /**
   * Dispatches outbound message to the target platform API.
   */
  async dispatchOutboundMessage({ platform, external_chat_id, text_content, media_url, buttons }) {
    logger.info(`[Dispatcher] Dispatching outbound message to [${platform}] (${external_chat_id}): "${text_content?.slice(0, 30)}"`);

    if (platform === 'telegram') {
      return this.sendTelegramMessage(external_chat_id, text_content);
    }

    if (platform === 'whatsapp') {
      return this.sendWhatsAppMessage(external_chat_id, text_content);
    }

    if (platform === 'discord') {
      const { sendDiscordMessage } = await import('./discordService.js');
      return sendDiscordMessage(external_chat_id, text_content);
    }

    try {
      return {
        success: true,
        status: MESSAGE_STATUS.DELIVERED,
        delivered_at: new Date(),
      };
    } catch (error) {
      logger.error(`[Dispatcher Delivery Error] Platform [${platform}]: ${error.message}`);
      return {
        success: false,
        status: MESSAGE_STATUS.FAILED,
        error: error.message,
      };
    }
  },
};

export default dispatcher;
