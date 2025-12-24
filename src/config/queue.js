const Queue = require('bull');
const logger = require('../utils/logger');

const scrapeQueue = new Queue('event-scraping', {
   redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
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
