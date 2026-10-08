import { Router } from 'express';
import mediaController from '../../controllers/mediaController.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/library', mediaController.getLibrary);
router.post('/upload', mediaController.upload);
router.post('/dispatch', mediaController.dispatchMedia);

export default router;

