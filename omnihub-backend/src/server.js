import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import connectRedis from './config/redis.js';
import logger from './utils/logger.js';
import { initSocket, shutdownSocket } from './sockets/index.js';
import { registerJob, startAllJobs, stopAllJobs } from './jobs/queue.js';
import { dailyReportJob } from './jobs/dailyReport.js';
import { analyticsAggregatorJob } from './jobs/analyticsAggregator.js';
import { retryFailedMessagesJob } from './jobs/retryFailedMessages.js';
import { cleanupJob } from './jobs/cleanup.js';
import { initDiscordBot } from './services/discordService.js';
import { initTelegramPolling } from './services/telegramService.js';

const server = http.createServer(app);

// ─── Initialize Socket.io Server ─────────────────────────
export const io = new SocketIOServer(server, {
  cors: {
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Register Background Jobs ────────────────────────────
function registerAllJobs() {
  // Daily report at midnight
  registerJob('dailyReport', '0 0 * * *', dailyReportJob);

  // Analytics aggregation every hour at :05
  registerJob('analyticsAggregator', '5 * * * *', analyticsAggregatorJob);

  // Retry failed messages every 5 minutes
  registerJob('retryFailedMessages', '*/5 * * * *', retryFailedMessagesJob);

  // Database cleanup at 2:00 AM
  registerJob('cleanup', '0 2 * * *', cleanupJob);

  logger.info('[Server] All background jobs registered');
}

// ─── Start Server ─────────────────────────────────────────
async function startServer() {
  await connectDB();
  await connectRedis();

  // Initialize Socket.io with auth + handlers
  initSocket(io);

  // Register & start background jobs
  registerAllJobs();
  startAllJobs();

  const PORT = env.PORT;
  server.listen(PORT, () => {
    initDiscordBot();
    initTelegramPolling();
    logger.info(`==================================================`);
    logger.info(`🚀 OmniHub Backend Server running on port ${PORT}`);
    logger.info(`📡 Environment: ${env.NODE_ENV}`);
    logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
    logger.info(`🔌 Socket.io: Initialized with JWT auth`);
    logger.info(`⏰ Background Jobs: ${4} jobs registered & started`);
    logger.info(`==================================================`);
  });
}

// ─── Graceful Shutdown ────────────────────────────────────
function gracefulShutdown(signal) {
  logger.info(`[Server] ${signal} received. Shutting down gracefully...`);

  // Stop background jobs
  stopAllJobs();

  // Shutdown socket connections
  shutdownSocket();

  // Close HTTP server
  server.close(() => {
    logger.info('[Server] HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => {
    logger.warn('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer().catch((err) => {
  logger.error(`[Server Initialization Error] ${err.message}`);
  process.exit(1);
});
