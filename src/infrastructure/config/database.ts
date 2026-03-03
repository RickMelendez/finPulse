import knex from 'knex';

const env = process.env.NODE_ENV || 'development';

const db = knex({
  client: 'pg',
  connection:
    env === 'production'
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : process.env.DATABASE_URL,
  ...(env === 'production' && { pool: { min: 2, max: 10 } }),
});

export default db;
