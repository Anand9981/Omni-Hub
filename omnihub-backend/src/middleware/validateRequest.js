import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateRequest(schema) {
  return (req, res, next) => {
    if (typeof schema !== 'function') return next();
    const result = schema(req.body);
    if (!result.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, result.message || 'Invalid request parameters'),
      );
    }
    next();
  };
}

export default validateRequest;
