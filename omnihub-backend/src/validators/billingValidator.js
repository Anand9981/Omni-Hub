import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateBilling(req, res, next) {
  const { plan_id } = req.body;

  if (req.method === 'POST' && req.path.includes('/subscribe')) {
    if (!plan_id || typeof plan_id !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Plan ID is required to update subscription.'),
      );
    }
  }

  next();
}

export default validateBilling;
