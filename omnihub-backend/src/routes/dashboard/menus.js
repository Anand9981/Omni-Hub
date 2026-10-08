import { Router } from 'express';
import menuController from '../../controllers/menuController.js';
import { protect } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/roleCheck.js';

const router = Router();

// Public / Guest accessible for widget / inbound button simulation
router.post('/click', menuController.handleClick);

// Dashboard routes with authentication
router.get('/', protect, menuController.getMenu);
router.get('/:platform', protect, menuController.getMenu);
router.post('/send', protect, menuController.sendMenu);
router.post('/', protect, requireAdmin, menuController.saveMenu);
router.post('/:platform', protect, requireAdmin, menuController.saveMenu);

export default router;

