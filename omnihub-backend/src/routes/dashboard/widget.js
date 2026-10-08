import { Router } from 'express';
import { widgetController } from '../../controllers/widgetController.js';
import { protect } from '../../middleware/auth.js';
import { validateWidget } from '../../validators/widgetValidator.js';

const router = Router();

router.get('/', widgetController.get);
router.put('/', protect, validateWidget, widgetController.update);

export default router;
