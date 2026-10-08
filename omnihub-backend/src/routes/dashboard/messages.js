import { Router } from 'express';
import messageController from '../../controllers/messageController.js';
import { protect } from '../../middleware/auth.js';
import { checkNotReadOnly } from '../../middleware/roleCheck.js';
import validateRequest from '../../middleware/validateRequest.js';
import { validateSendMessage } from '../../validators/conversationValidator.js';

const router = Router();

router.use(protect);

router.get('/:conversationId', messageController.getMessagesByConversation);
router.post('/:conversationId', checkNotReadOnly, validateRequest(validateSendMessage), messageController.sendMessage);
router.post('/:messageId/retry', checkNotReadOnly, messageController.retryMessage);

export default router;
