import { Router } from 'express';
import { billingController } from '../../controllers/billingController.js';
import { protect } from '../../middleware/auth.js';
import { validateBilling } from '../../validators/billingValidator.js';

const router = Router();

router.use(protect);

router.get('/plans', billingController.getPlans);
router.get('/subscription', billingController.getSubscription);
router.post('/subscribe', validateBilling, billingController.updateSubscription);
router.get('/invoices', billingController.getInvoices);

export default router;
