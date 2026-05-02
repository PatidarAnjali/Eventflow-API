const { Pool } = require('pg');
const logger = require('../utils/logger');

// defaults match docker/docker-compose.yml so local runs work without a filled .env
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'events_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected DB error', { error: err.message });
});

// verifies connectivity before the api accepts traffic (throws if db is down)
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info('Database connected successfully');
  } finally {
    client.release();
  }
}

module.exports = { pool, initializeDatabase };
