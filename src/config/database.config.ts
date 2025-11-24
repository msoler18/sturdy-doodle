import dotenv from 'dotenv';
import type { Knex } from 'knex';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'weather_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    pool: {
      min: Number(process.env.DB_POOL_MIN) || 2,
      max: Number(process.env.DB_POOL_MAX) || 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/infrastructure/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/infrastructure/database/seeds',
      extension: 'ts',
    },
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: Number(process.env.DB_POOL_MIN) || 2,
      max: Number(process.env.DB_POOL_MAX) || 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './dist/infrastructure/database/migrations',
    },
  },
};

export default config;
