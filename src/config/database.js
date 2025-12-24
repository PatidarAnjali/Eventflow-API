const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected DB error', { error: err.message });
});

async function initializeDatabase() {
  try{
    const client = await pool.connect();
    logger.info('Database connected successfully');
    client.release();
  }catch (error) {
    logger.error('Database connection failed', { error: error.message });
    throw error;
  }
}

module.exports = { pool, initializeDatabase };
