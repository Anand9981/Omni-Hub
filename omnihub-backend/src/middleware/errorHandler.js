import * as Sentry from '@sentry/node';
import logger from '../utils/logger.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected internal error occurred.';

  logger.error(`[API Error] ${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    logger.debug(err.stack);
  }

  if (statusCode >= 500) {
    Sentry.captureException(err);
  }

  return res.status(statusCode).json(
    formatResponse(false, null, message, {
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    }),
  );
}

export default errorHandler;

