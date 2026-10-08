import { Router } from 'express';
import aiContextController from '../../controllers/aiContextController.js';
import { protect } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/roleCheck.js';

const router = Router();

router.use(protect);

router.get('/', aiContextController.getContext);
router.patch('/', requireAdmin, aiContextController.updateContext);
router.post('/faqs', requireAdmin, aiContextController.addFaq);
router.delete('/faqs/:index', requireAdmin, aiContextController.deleteFaq);

export default router;
