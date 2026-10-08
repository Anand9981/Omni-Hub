import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateOnboarding(req, res, next) {
  const { stepNumber, stepKey } = req.body;

  if (req.path.includes('/step') && (!stepNumber || typeof stepNumber !== 'number')) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Step number is required and must be a number.'),
    );
  }

  if (req.path.includes('/checklist') && (!stepKey || typeof stepKey !== 'string')) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Step key is required for checklist updates.'),
    );
  }

  next();
}

export default validateOnboarding;
