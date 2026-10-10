import logger from '../utils/logger.js';

export function initSentry(app) {
  const dsn = process.env.SENTRY_DSN;
  if (dsn) {
    logger.info(`[Sentry] Initializing error tracking with DSN.`);
    // When @sentry/node is added, Sentry.init({ dsn }) runs here
  } else {
    logger.info('[Sentry] Error monitoring initialized in graceful mock mode (No SENTRY_DSN configured).');
  }
}

export default initSentry;

