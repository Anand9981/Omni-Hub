import { Router } from 'express';
import teamController from '../../controllers/teamController.js';
import { protect } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/roleCheck.js';

const router = Router();

// Public endpoint for invited users to accept invitation & register
router.post('/accept-invite', teamController.acceptInvite);

// Protected endpoints for authenticated team operations
router.use(protect);

router.get('/members', teamController.listMembers);
router.get('/invites', requireAdmin, teamController.listInvites);
router.post('/invite', requireAdmin, teamController.inviteMember);
router.delete('/invites/:id', requireAdmin, teamController.revokeInvite);
router.patch('/members/:id/role', requireAdmin, teamController.updateMemberRole);
router.delete('/members/:id', requireAdmin, teamController.removeMember);

export default router;

