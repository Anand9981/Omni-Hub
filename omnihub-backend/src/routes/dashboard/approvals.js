import { Router } from 'express';
import approvalController from '../../controllers/approvalController.js';
import { protect } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/roleCheck.js';

const router = Router();

router.use(protect);

router.get('/pending', approvalController.getPendingApprovals);
router.post('/:id/approve', requireAdmin, approvalController.approveDraft);
router.post('/:id/reject', requireAdmin, approvalController.rejectDraft);
router.post('/:id/edit', requireAdmin, approvalController.editAndApproveDraft);

export default router;
