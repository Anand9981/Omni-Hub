import { Router } from 'express';
import { onboardingController } from '../../controllers/onboardingController.js';
import { protect } from '../../middleware/auth.js';
import { validateOnboarding } from '../../validators/onboardingValidator.js';

const router = Router();

router.use(protect);

router.get('/', onboardingController.getProgress);
router.put('/', validateOnboarding, onboardingController.updateProgress);
router.post('/checklist', validateOnboarding, onboardingController.updateChecklist);
router.post('/step', validateOnboarding, onboardingController.setStep);

export default router;
