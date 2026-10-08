import { Router } from 'express';
import normalizer from '../../services/normalizer.js';
import conversationService from '../../services/conversationService.js';
import { formatResponse } from '../../utils/helpers.js';

const router = Router();

router.post('/', async (req, res) => {
  // Handle Discord ping handshake
  if (req.body?.type === 1) {
    return res.status(200).json({ type: 1 });
  }

  const normalized = normalizer.normalizeDiscord(req.body);
  if (normalized) {
    conversationService.processInboundMessage(normalized).catch(() => {});
  }
  return res.status(200).json(formatResponse(true, null, 'Discord update processed.'));
});

export default router;
