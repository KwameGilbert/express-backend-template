import knex from 'knex';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * Get database configuration
 */
const getConfig = () => ({
  client: 'pg',
  connection: env.DATABASE_URL || {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  pool: {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  acquireConnectionTimeout: 10000,
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/seeds',
  },
});

/**
 * Create database connection
 */
export const db = knex(getConfig());

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    logger.info('Database connection established successfully');
    return true;    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to connect to database');
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeConnections = async () => {
  await db.destroy();
  logger.info('Database connection closed');
};

export default db;
