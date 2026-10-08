import { Router } from 'express';
import agentController from '../../controllers/agentController.js';
import { protect } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/roleCheck.js';

const router = Router();

router.use(protect);

router.get('/', agentController.listAgents);
router.post('/:conversationId/assign', requireAdmin, agentController.assignConversation);
router.post('/:conversationId/auto-assign', requireAdmin, agentController.autoAssign);

export default router;
