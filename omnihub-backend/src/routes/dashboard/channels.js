import { Router } from 'express';
import { channelController } from '../../controllers/channelController.js';
import { protect } from '../../middleware/auth.js';
import { validateChannel } from '../../validators/channelValidator.js';

const router = Router();

router.use(protect);

router.get('/', channelController.getAll);
router.get('/:platform', channelController.getByPlatform);
router.put('/:platform', validateChannel, channelController.update);
router.post('/:platform/test', channelController.testConnection);

export default router;
