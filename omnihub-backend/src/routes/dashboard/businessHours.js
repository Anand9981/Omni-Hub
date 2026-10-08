import { Router } from 'express';
import { businessHoursController } from '../../controllers/businessHoursController.js';
import { protect } from '../../middleware/auth.js';
import { validateBusinessHours } from '../../validators/businessHoursValidator.js';

const router = Router();

router.use(protect);

router.get('/', businessHoursController.get);
router.put('/', validateBusinessHours, businessHoursController.update);

export default router;
