import { Router } from 'express';
import { onboardingController } from '../../controllers/onboardingController.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', onboardingController.getProgress);
router.post('/checklist', onboardingController.updateChecklist);
router.post('/step', onboardingController.setStep);

export default router;
