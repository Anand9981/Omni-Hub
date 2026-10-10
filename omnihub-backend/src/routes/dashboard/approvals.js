import { Router } from 'express';
import approvalController from '../../controllers/approvalController.js';
import { protect } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/roleCheck.js';
import { validateApproval } from '../../validators/approvalValidator.js';

const router = Router();

router.use(protect);

router.get('/pending', approvalController.getPendingApprovals);
router.get('/resolved', approvalController.getResolvedApprovals);
router.post('/:id/approve', requireAdmin, validateApproval, approvalController.approveDraft);
router.post('/:id/reject', requireAdmin, validateApproval, approvalController.rejectDraft);
router.post('/:id/edit', requireAdmin, validateApproval, approvalController.editAndApproveDraft);

export default router;
