import { Router } from 'express';
import normalizer from '../../services/normalizer.js';
import conversationService from '../../services/conversationService.js';
import validateWebhook from '../../middleware/validateWebhook.js';
import { formatResponse } from '../../utils/helpers.js';

const router = Router();

router.post('/', validateWebhook.telegramSecret, async (req, res) => {
  const normalized = normalizer.normalizeTelegram(req.body);
  if (normalized) {
    conversationService.processInboundMessage(normalized).catch(() => {});
  }
  return res.status(200).json(formatResponse(true, null, 'Telegram update processed.'));
});

export default router;
