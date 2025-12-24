const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

const limiter = rateLimit({
  store: new RedisStore({
    client: getRedisClient(),
    prefix: 'rl:',
  }),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests, pls try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;