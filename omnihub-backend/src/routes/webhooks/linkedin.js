import { Router } from 'express';
import normalizer from '../../services/normalizer.js';
import conversationService from '../../services/conversationService.js';
import { formatResponse } from '../../utils/helpers.js';

const router = Router();

router.get('/', (_req, res) => {
  return res.status(200).send('LinkedIn Webhook active');
});

router.post('/', async (req, res) => {
  const normalized = normalizer.normalizeLinkedIn(req.body);
  if (normalized) {
    conversationService.processInboundMessage(normalized).catch(() => {});
  }
  return res.status(200).json(formatResponse(true, null, 'LinkedIn event processed.'));
});

export default router;
