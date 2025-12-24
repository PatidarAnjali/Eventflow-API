const redis = require('redis');
const logger = require('../utils/logger');

let client;

async function initializeRedis() {
  client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });

  client.on('error', (err) => {
    logger.error('Redis error', { error: err.message });
  });

  await client.connect();
  logger.info('Redis connected successfully');
  
  return client;
}

function getRedisClient() {
  if(!client){
    throw new Error( 'Redis client not initialized');
  }
  return client;
}

module.exports = { initializeRedis, getRedisClient };
