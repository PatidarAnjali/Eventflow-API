const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { getRedisClient } = require('../config/redis');

router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  try {
    // check db
    await pool.query('SELECT 1');
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // check Redis
    await getRedisClient().ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status ===  'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;