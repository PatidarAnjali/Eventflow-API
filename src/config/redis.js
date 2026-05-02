const redis = require('redis');
const logger = require('../utils/logger');

let client;
let available = false;
let configured = false; // true when redis init was attempted (not explicitly disabled)

// prefer REDIS_URL in production; otherwise host/port with sane defaults
function redisUrl() {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD;
  const auth = password ? `:${encodeURIComponent(password)}@` : '';
  return `redis://${auth}${host}:${port}`;
}

function isRedisAvailable() {
  return Boolean(available && client);
}

// true when redis was intended to be used (REDIS_ENABLED != 'false'); false only when explicitly disabled
function isRedisConfigured() {
  return configured;
}

// when redis fails or REDIS_ENABLED=false, api still starts (memory rate limits, no http cache)
async function initializeRedis() {
  if (process.env.REDIS_ENABLED === 'false') {
    logger.warn('Redis disabled by REDIS_ENABLED=false');
    return;
  }

  configured = true; // redis was intended — connection failures are real errors
  try {
    client = redis.createClient({ url: redisUrl() });
    client.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });
    await client.connect();
    available = true;
    logger.info('Redis connected successfully');
  } catch (error) {
    client = undefined;
    available = false;
    logger.warn('Redis unavailable — using in-memory rate limits and no HTTP cache', {
      error: error.message,
    });
  }
}

function getRedisClient() {
  if (!isRedisAvailable()) {
    throw new Error('Redis client not initialized');
  }
  return client;
}

// clears list/detail cache keys after inserts so clients never see stale redis payloads
async function invalidateEventsCache() {
  if (!isRedisAvailable()) return;
  try {
    const redisClient = getRedisClient();
    const batch = [];

    for await (const key of redisClient.scanIterator({
      MATCH: 'cache:/api/v1/events*',
      COUNT: 100,
    })) {
      batch.push(key);
      if (batch.length >= 100) {
        await redisClient.del(batch);
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await redisClient.del(batch);
    }
  } catch (error) {
    logger.warn('Failed to invalidate events cache', { error: error.message });
  }
}

module.exports = {
  initializeRedis,
  getRedisClient,
  isRedisAvailable,
  isRedisConfigured,
  invalidateEventsCache,
};
