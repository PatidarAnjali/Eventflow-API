const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { isRedisAvailable, getRedisClient } = require('../config/redis');

// returns 200 only when db + optional redis are usable; skipped redis is not_configured, not unhealthy
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
    await pool.query('SELECT 1');
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  if (!isRedisAvailable()) {
    health.services.redis = 'not_configured';
  } else {
    try {
      await getRedisClient().ping();
      health.services.redis = 'healthy';
    } catch (error) {
      health.services.redis = 'unhealthy';
      health.status = 'degraded';
    }
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
