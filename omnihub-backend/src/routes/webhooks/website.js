import { Router } from 'express';
import normalizer from '../../services/normalizer.js';
import conversationService from '../../services/conversationService.js';
import validateWebhook from '../../middleware/validateWebhook.js';
import { formatResponse } from '../../utils/helpers.js';

const router = Router();

router.post('/', validateWebhook.websiteWidget, async (req, res) => {
  const normalized = normalizer.normalizeWebsite(req.body);
  let result = null;
  if (normalized) {
    result = await conversationService.processInboundMessage(normalized);
  }
  return res.status(200).json(formatResponse(true, result, 'Website chat message delivered.'));
});

export default router;
