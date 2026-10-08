import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import env from './env.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Load swagger.json from backend root ──────────────────────────────────────
const swaggerJsonPath = path.resolve(__dirname, '../../swagger.json');

let swaggerDocument = null;

try {
  const raw = fs.readFileSync(swaggerJsonPath, 'utf-8');
  swaggerDocument = JSON.parse(raw);

  // Dynamically patch server URL based on current environment
  if (swaggerDocument.servers) {
    swaggerDocument.servers = [
      {
        url: env.NODE_ENV === 'production'
          ? `https://api.omnihub.ai/api`
          : `http://localhost:${env.PORT}/api`,
        description: env.NODE_ENV === 'production'
          ? 'Production Server'
          : 'Local Development Server',
      },
    ];
  }

  logger.info(`[Swagger] Loaded swagger.json (${env.NODE_ENV} mode)`);
} catch (err) {
  logger.warn(`[Swagger] Could not load swagger.json: ${err.message}`);
}

/**
 * serveSwaggerDocs
 *
 * Attaches a lightweight Swagger UI-compatible JSON endpoint and an
 * HTML redirect page to the given Express app — without requiring
 * swagger-ui-express or swagger-jsdoc as runtime dependencies.
 *
 * Mounted in app.js at: GET /api/docs
 *
 * Usage in app.js:
 *   import { serveSwaggerDocs } from './config/swagger.js';
 *   serveSwaggerDocs(app);
 *
 * @param {import('express').Application} app - Express app instance
 */
export function serveSwaggerDocs(app) {
  if (!swaggerDocument) {
    logger.warn('[Swagger] Skipping docs route — swagger.json not available.');
    return;
  }

  // Serve raw OpenAPI JSON spec
  app.get('/api/docs/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerDocument);
  });

  // Serve a simple HTML landing page that loads Swagger UI from CDN
  app.get('/api/docs', (_req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OmniHub API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/api/docs/swagger.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: 'BaseLayout',
        deepLinking: true,
        tryItOutEnabled: true,
      });
    };
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  logger.info(`[Swagger] API docs available at /api/docs`);
}

export { swaggerDocument };
export default serveSwaggerDocs;
