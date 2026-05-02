const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { isRedisAvailable, getRedisClient } = require('../config/redis');

// rate-limit-redis v4 expects sendCommand, not a raw client option
function createRateLimiter() {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
  const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;
  const base = {
    windowMs,
    max,
    message: 'Too many requests, pls try again later',
    standardHeaders: true,
    legacyHeaders: false,
  };

  // shared counters across processes when redis exists; otherwise per-process memory store
  if (isRedisAvailable()) {
    return rateLimit({
      ...base,
      store: new RedisStore({
        sendCommand: (...args) => getRedisClient().sendCommand(args),
        prefix: 'rl:',
      }),
    });
  }

  return rateLimit(base);
}

module.exports = createRateLimiter;
