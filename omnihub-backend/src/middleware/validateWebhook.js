import env from '../config/env.js';
import logger from '../utils/logger.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const validateWebhook = {
  /**
   * Handles Meta (WhatsApp / Instagram) Hub Verification Handshake (GET).
   */
  metaVerification(verifyToken) {
    return (req, res, next) => {
      if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (
          mode === 'subscribe' &&
          (token === verifyToken ||
            token === env.WHATSAPP_VERIFY_TOKEN ||
            token === 'omnihub_whatsapp_verify_token')
        ) {
          logger.info('[Meta Webhook] Verification successful!');
          return res.status(200).send(challenge);
        }
        logger.warn('[Meta Webhook] Verification failed due to token mismatch.');
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          formatResponse(false, null, 'Webhook verification token mismatch.'),
        );
      }
      next();
    };
  },

  /**
   * Validates Telegram secret token header if set.
   */
  telegramSecret(req, res, next) {
    const secret = req.headers['x-telegram-bot-api-secret-token'];
    if (process.env.TELEGRAM_SECRET_TOKEN && secret !== process.env.TELEGRAM_SECRET_TOKEN) {
      logger.warn('[Telegram Webhook] Invalid secret token received.');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse(false, null, 'Invalid secret token.'),
      );
    }
    next();
  },

  /**
   * Validates Webchat Widget session / origin.
   */
  websiteWidget(req, res, next) {
    const { chat_id, session_id, visitor_id, chatId, sessionId, visitorId } = req.body;
    if (!chat_id && !session_id && !visitor_id && !chatId && !sessionId && !visitorId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Missing chat_id or session_id in payload.'),
      );
    }
    next();
  },
};

export default validateWebhook;
