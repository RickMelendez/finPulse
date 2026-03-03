import knex from 'knex';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

const db = knex({
  client: 'pg',
  connection: isProd
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : process.env.DATABASE_URL,
  migrations: {
    // In production, migrations compile to dist/db/migrations/*.js
    // In development (__dirname = src/infrastructure/config), path resolves to db/migrations/*.ts
    directory: path.join(__dirname, '../../../db/migrations'),
  },
  ...(isProd && { pool: { min: 2, max: 10 } }),
});

export default db;
