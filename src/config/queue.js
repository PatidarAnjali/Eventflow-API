const Queue = require('bull');
const logger = require('../utils/logger');

// prefer REDIS_URL (production / TLS setups); fall back to building a URL from host/port/password
function getRedisUrl() {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD;
  const auth = password ? `:${encodeURIComponent(password)}@` : '';
  return `redis://${auth}${host}:${port}`;
}

// worker process uses this queue; bull talks to redis directly (same connection as app cache)
const scrapeQueue = new Queue('event-scraping', getRedisUrl());

scrapeQueue.on('error', (error) => {
  logger.error('Queue error', { error: error.message });
});

scrapeQueue.on('completed', (job) => {
  logger.info('Scraping job completed', { jobId: job.id });
});

scrapeQueue.on('failed', (job, err) => {
  logger.error('Scraping job failed', { jobId: job.id, error: err.message });
});

module.exports = { scrapeQueue };
