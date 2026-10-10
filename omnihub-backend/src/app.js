import express from 'express';
import * as Sentry from '@sentry/node';
import corsConfig from './config/cors.js';
import helmetConfig from './config/helmet.js';
import './config/cloudinary.js';
import initSentry from './config/sentry.js';
import requestLogger from './middleware/requestLogger.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import apiRoutes from './routes/index.js';
import { formatResponse } from './utils/helpers.js';
import serveSwaggerDocs from './config/swagger.js';
import env from './config/env.js';

import { sanitizeMiddleware } from './middleware/sanitize.js';
import { httpsEnforceMiddleware } from './middleware/httpsEnforce.js';

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

const app = express();
initSentry(app);

// Global Security & Middleware
app.use(httpsEnforceMiddleware);
app.use(corsConfig);
app.use(helmetConfig);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeMiddleware);
app.use(requestLogger);

// Health check endpoint
const healthHandler = (_req, res) => {
  res.status(200).json({
    status: 'ok',
    ...formatResponse(true, {
      status: 'UP',
      service: 'omnihub-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }, 'OmniHub API is healthy'),
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Root & API welcome routes
const apiInfoHandler = (_req, res) => {
  res.status(200).json(
    formatResponse(true, {
      name: 'OmniHub Backend API Engine',
      version: '1.0.0',
      docs: '/api/docs',
      health: '/api/health',
    }, 'Welcome to OmniHub API'),
  );
};
app.get('/', apiInfoHandler);
app.get('/api', apiInfoHandler);

// API Docs — GET /api/docs (Swagger UI via CDN, no extra packages needed)
serveSwaggerDocs(app);

// Mount Central API Routes with Global Rate Limiter
app.use('/api', apiRateLimiter, apiRoutes);

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
