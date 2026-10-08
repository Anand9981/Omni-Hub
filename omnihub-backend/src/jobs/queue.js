import cron from 'node-cron';
import logger from '../utils/logger.js';

/**
 * Job Queue & Scheduler
 * Lightweight cron-based job scheduler using node-cron.
 * Registers, starts, stops, and monitors all background jobs.
 */

const registeredJobs = new Map();

/**
 * Register a cron job.
 * @param {string} name - Unique job name.
 * @param {string} schedule - Cron expression (e.g., '0 0 * * *' for daily midnight).
 * @param {Function} handler - Async function to execute.
 * @param {object} [options] - Optional config { runOnInit: false, timezone: 'Asia/Kolkata' }.
 */
export function registerJob(name, schedule, handler, options = {}) {
  if (registeredJobs.has(name)) {
    logger.warn(`[JobQueue] Job "${name}" is already registered. Skipping duplicate.`);
    return;
  }

  if (!cron.validate(schedule)) {
    logger.error(`[JobQueue] Invalid cron expression for "${name}": ${schedule}`);
    return;
  }

  const job = cron.schedule(schedule, async () => {
    const startTime = Date.now();
    logger.info(`[JobQueue] ▶ Starting job: ${name}`);

    try {
      await handler();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info(`[JobQueue] ✅ Job "${name}" completed in ${duration}s`);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.error(`[JobQueue] ❌ Job "${name}" failed after ${duration}s: ${error.message}`);
    }
  }, {
    scheduled: false, // Don't auto-start; we call startAllJobs() explicitly
    timezone: options.timezone || 'Asia/Kolkata',
  });

  registeredJobs.set(name, {
    job,
    schedule,
    handler,
    options,
    status: 'registered',
    lastRun: null,
    lastError: null,
  });

  logger.info(`[JobQueue] Registered job: "${name}" (${schedule})`);

  // Run immediately on init if requested
  if (options.runOnInit) {
    logger.info(`[JobQueue] Running "${name}" on init...`);
    handler().catch((err) => {
      logger.warn(`[JobQueue] Init run for "${name}" failed: ${err.message}`);
    });
  }
}

/**
 * Start all registered jobs.
 */
export function startAllJobs() {
  for (const [name, entry] of registeredJobs) {
    entry.job.start();
    entry.status = 'running';
    logger.info(`[JobQueue] Started job: "${name}"`);
  }
  logger.info(`[JobQueue] All ${registeredJobs.size} jobs started`);
}

/**
 * Stop all registered jobs.
 */
export function stopAllJobs() {
  for (const [name, entry] of registeredJobs) {
    entry.job.stop();
    entry.status = 'stopped';
  }
  logger.info(`[JobQueue] All jobs stopped`);
}

/**
 * Stop and remove a specific job.
 */
export function removeJob(name) {
  const entry = registeredJobs.get(name);
  if (entry) {
    entry.job.stop();
    registeredJobs.delete(name);
    logger.info(`[JobQueue] Removed job: "${name}"`);
  }
}

/**
 * Get status of all registered jobs.
 */
export function getJobStatuses() {
  const statuses = {};
  for (const [name, entry] of registeredJobs) {
    statuses[name] = {
      schedule: entry.schedule,
      status: entry.status,
      lastRun: entry.lastRun,
      lastError: entry.lastError,
    };
  }
  return statuses;
}

/**
 * Run a specific job immediately (on-demand).
 */
export async function runJobNow(name) {
  const entry = registeredJobs.get(name);
  if (!entry) {
    throw new Error(`Job "${name}" not found`);
  }

  logger.info(`[JobQueue] Manual trigger: "${name}"`);
  const startTime = Date.now();

  try {
    await entry.handler();
    entry.lastRun = new Date().toISOString();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`[JobQueue] ✅ Manual run "${name}" completed in ${duration}s`);
    return { success: true, duration: `${duration}s` };
  } catch (error) {
    entry.lastError = error.message;
    throw error;
  }
}

export default {
  registerJob,
  startAllJobs,
  stopAllJobs,
  removeJob,
  getJobStatuses,
  runJobNow,
};
