import { Router } from 'express';
import { cannedResponseController } from '../../controllers/cannedResponseController.js';
import { protect } from '../../middleware/auth.js';
import { validateCannedResponse } from '../../validators/cannedResponseValidator.js';

const router = Router();

router.use(protect);

router.get('/', cannedResponseController.getAll);
router.get('/:id', cannedResponseController.getById);
router.post('/', validateCannedResponse, cannedResponseController.create);
router.put('/:id', validateCannedResponse, cannedResponseController.update);
router.delete('/:id', cannedResponseController.delete);

export default router;
