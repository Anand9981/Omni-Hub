import { Router } from 'express';
import conversationController from '../../controllers/conversationController.js';
import { protect } from '../../middleware/auth.js';
import { checkNotReadOnly } from '../../middleware/roleCheck.js';
import validateRequest from '../../middleware/validateRequest.js';
import {
  validateAutoPilotToggle,
  validateApprovalMode,
} from '../../validators/conversationValidator.js';

const router = Router();

router.use(protect);

router.get('/', conversationController.listConversations);
router.get('/:id', conversationController.getConversationById);
router.get('/:id/messages', conversationController.getConversationById);
router.post('/:id/takeover', checkNotReadOnly, conversationController.takeover);
router.post('/:id/autopilot', checkNotReadOnly, validateRequest(validateAutoPilotToggle), conversationController.toggleAutoPilot);
router.post('/:id/approval-mode', checkNotReadOnly, validateRequest(validateApprovalMode), conversationController.updateApprovalMode);
router.post('/:id/read', conversationController.markAsRead);

export default router;
