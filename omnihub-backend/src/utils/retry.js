import logger from './logger.js';

/**
 * Retries an asynchronous function with exponential backoff.
 * @param {Function} fn - Async operation to execute
 * @param {Object} options - Configuration options
 * @returns {Promise<any>}
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    retries = 3,
    initialDelayMs = 500,
    factor = 2,
    operationName = 'External API Call',
  } = options;

  let attempt = 0;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt >= retries) {
        logger.error(`[Retry] ${operationName} failed after ${retries} attempts: ${error.message}`);
        throw error;
      }
      const delay = initialDelayMs * Math.pow(factor, attempt - 1);
      logger.warn(`[Retry] ${operationName} failed (Attempt ${attempt}/${retries}). Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export default retryWithBackoff;

