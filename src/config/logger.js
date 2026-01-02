import pino from 'pino';
import { env, isProduction } from './env.js';

/**
 * Logger configuration
 */
const loggerConfig = {
  level: env.LOG_LEVEL,
  base: {
    app: env.APP_NAME,
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
};

// Pretty print in development
if (!isProduction) {
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

/**
 * Create the logger instance
 */
export const logger = pino(loggerConfig);

/**
 * Create a child logger with tenant context
 */
export const createTenantLogger = (tenantId) => {
  return logger.child({ tenantId });
};

/**
 * Create a child logger with request context
 */
export const createRequestLogger = (req) => {
  const context = {
    requestId: req.id,
    method: req.method,
    url: req.url,
  };

  if (req.tenant) {
    context.tenantId = req.tenant.id;
  }

  if (req.user) {
    context.userId = req.user.id;
  }

  return logger.child(context);
};

export default logger;
