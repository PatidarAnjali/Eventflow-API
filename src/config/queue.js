const Queue = require('bull');
const logger = require('../utils/logger');

// worker process uses this queue; bull talks to redis directly (same host/port as app cache)
const scrapeQueue = new Queue('event-scraping', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

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
