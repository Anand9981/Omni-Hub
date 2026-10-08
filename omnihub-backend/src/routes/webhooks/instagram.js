import { Router } from 'express';
import env from '../../config/env.js';
import normalizer from '../../services/normalizer.js';
import conversationService from '../../services/conversationService.js';
import validateWebhook from '../../middleware/validateWebhook.js';
import { formatResponse } from '../../utils/helpers.js';

const router = Router();

// Meta Instagram Verification Handshake
router.get('/', validateWebhook.metaVerification(env.INSTAGRAM_VERIFY_TOKEN));

// Inbound Message Handler
router.post('/', async (req, res) => {
  const normalized = normalizer.normalizeInstagram(req.body);
  if (normalized) {
    conversationService.processInboundMessage(normalized).catch(() => {});
  }
  return res.status(200).json(formatResponse(true, null, 'Instagram event received.'));
});

export default router;
