import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function notFound(req, res, _next) {
  return res.status(HTTP_STATUS.NOT_FOUND).json(
    formatResponse(false, null, `Route not found: ${req.method} ${req.originalUrl}`),
  );
}

export default notFound;

