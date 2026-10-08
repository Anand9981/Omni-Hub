import { Router } from 'express';
import env from '../../config/env.js';
import normalizer from '../../services/normalizer.js';
import conversationService from '../../services/conversationService.js';
import validateWebhook from '../../middleware/validateWebhook.js';
import { formatResponse } from '../../utils/helpers.js';
import logger from '../../utils/logger.js';

const router = Router();

// Meta Webhook Verification Handshake
router.get('/', validateWebhook.metaVerification(env.WHATSAPP_VERIFY_TOKEN));

// Inbound Message Handler
router.post('/', async (req, res) => {
  logger.info(`[WhatsApp Webhook] Received inbound payload: ${JSON.stringify(req.body).slice(0, 300)}`);
  const normalized = normalizer.normalizeWhatsApp(req.body);
  if (normalized) {
    logger.info(`[WhatsApp Inbound] New message from ${normalized.sender_name} (${normalized.sender_phone}): "${normalized.text_content}"`);
    conversationService.processInboundMessage(normalized).catch((err) => {
      logger.error(`[WhatsApp Inbound Process Error] ${err.message}`);
    });
  } else {
    logger.info('[WhatsApp Webhook] Event received was a status/read receipt or non-message event.');
  }
  return res.status(200).json(formatResponse(true, null, 'WhatsApp event received.'));
});

export default router;
