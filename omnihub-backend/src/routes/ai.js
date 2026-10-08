import { Router } from 'express';
import aiController from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import contentFilter from '../middleware/contentFilter.js';

const router = Router();

router.use(protect);

router.post('/generate', contentFilter, aiController.generateReply);
router.post('/suggestions', contentFilter, aiController.generateSuggestions);
router.post('/summarize', contentFilter, aiController.summarizeConversation);
router.post('/analyze', contentFilter, aiController.analyzeMessage);
router.post('/polish', contentFilter, aiController.polishDraft);
router.post('/detect-language', aiController.detectLanguage);

export default router;
