import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateAnalytics(req, res, next) {
  const { date, platform } = req.query;

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Date must be in YYYY-MM-DD format.'),
    );
  }

  next();
}

export default validateAnalytics;
