import { Router } from 'express';
import { analyticsController } from '../../controllers/analyticsController.js';
import { protect } from '../../middleware/auth.js';
import { validateAnalytics } from '../../validators/analyticsValidator.js';

const router = Router();

router.use(protect);

router.get('/', validateAnalytics, analyticsController.getSummary);
router.get('/daily', validateAnalytics, analyticsController.getDaily);
router.get('/hourly', validateAnalytics, analyticsController.getHourly);
router.get('/export', analyticsController.exportReport);
router.get('/kpi', analyticsController.getKPI);

export default router;
