import { Router } from 'express';
import leadController from '../../controllers/leadController.js';
import { protect } from '../../middleware/auth.js';
import { checkNotReadOnly } from '../../middleware/roleCheck.js';
import validateRequest from '../../middleware/validateRequest.js';
import validateLeadUpdate from '../../validators/leadValidator.js';

const router = Router();

router.use(protect);

router.get('/', leadController.listAllLeads);
router.post('/tags', checkNotReadOnly, leadController.updateTags);
router.get('/:conversationId', leadController.getLeadByConversation);
router.patch('/:conversationId', checkNotReadOnly, validateRequest(validateLeadUpdate), leadController.updateLead);

export default router;
