const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

function cacheMiddleware(duration = 300) {

  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try{
      const cached = await getRedisClient().get(key);
      
      if(cached) {
        logger.debug('Cache hit', { key });
        return res.json(JSON.parse(cached));
      }
      
      // store original send function
      const originalSend = res.json;
      
      //override send to cache response
      res.json = function(data) {
        getRedisClient().setEx(key, duration, JSON.stringify(data));
        logger.debug('Cache set', { key, duration });
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache error', { error: error.message });
      next();
    }
  };
}

module.exports = cacheMiddleware;