import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateBusinessHours(req, res, next) {
  const { timezone, weekly_schedule } = req.body;

  if (timezone && typeof timezone !== 'string') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Timezone must be a valid string.'),
    );
  }

  if (weekly_schedule && typeof weekly_schedule !== 'object') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Weekly schedule must be an object.'),
    );
  }

  next();
}

export default validateBusinessHours;
