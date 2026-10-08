import { Router } from 'express';
import noteController from '../../controllers/noteController.js';
import { protect } from '../../middleware/auth.js';
import { checkNotReadOnly } from '../../middleware/roleCheck.js';
import validateRequest from '../../middleware/validateRequest.js';
import validateCreateNote from '../../validators/noteValidator.js';

const router = Router();

router.use(protect);

router.get('/mentions', noteController.getMentionNotifications);
router.get('/:conversationId', noteController.getNotes);
router.post('/:conversationId', checkNotReadOnly, validateRequest(validateCreateNote), noteController.addNote);
router.delete('/:noteId', checkNotReadOnly, noteController.deleteNote);

export default router;
