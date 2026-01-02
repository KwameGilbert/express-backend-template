import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestId, requestLogger } from './middlewares/requestLogger.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';

/**
 * Create Express application
 */
const createApp = () => {
  const app = express();

  // Trust proxy (for rate limiting behind load balancers)
  app.set('trust proxy', 1);

  // Request ID middleware (should be first)
  app.use(requestId);

  // Request logging
  app.use(requestLogger);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', env.TENANT_HEADER],
  }));

  // Request compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount routes
  app.use(routes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: `Welcome to ${env.APP_NAME}`,
      version: env.API_VERSION,
      documentation: `/api/${env.API_VERSION}/docs`,
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
