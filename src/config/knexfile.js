import dotenv from 'dotenv';

dotenv.config();

/**
 * Knex configuration file
 * Used for running migrations and seeds via CLI
 */
const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'app_db',
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
  },
  migrations: {
    directory: '../migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: '../seeds',
  },
};

export default config;
