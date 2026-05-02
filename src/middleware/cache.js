const { isRedisAvailable, getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

// wraps res.json to store successful json bodies in redis for ttl seconds (query string in key)
function cacheMiddleware(duration = 300) {
  return async (req, res, next) => {
    if (!isRedisAvailable()) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await getRedisClient().get(key);

      if (cached) {
        logger.debug('Cache hit', { key });
        return res.json(JSON.parse(cached));
      }

      const originalSend = res.json;

      // defer setEx so we do not block the response on redis write
      res.json = function jsonWithCache(data) {
        if (this.statusCode >= 200 && this.statusCode < 300) {
          getRedisClient()
            .setEx(key, duration, JSON.stringify(data))
            .catch((err) => logger.error('Cache set failed', { error: err.message }));
          logger.debug('Cache set', { key, duration });
        } else {
          logger.debug('Skipping cache for non-success response', { key, statusCode: this.statusCode });
        }

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache error', { error: error.message });
      next();
    }
  };
}

module.exports = cacheMiddleware;
