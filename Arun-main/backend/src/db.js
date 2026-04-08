const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'taskflow',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error', err);
  process.exit(-1);
});

/**
 * Execute a SQL query. Uses connection pooling.
 * @param {string} text  - parameterised SQL string
 * @param {Array}  params - array of bind values
 */
const query = (text, params) => pool.query(text, params);

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Database connection error:', err.message);
  } else {
    console.log('✅  PostgreSQL connected');
    release();
  }
});

module.exports = { query, pool };
