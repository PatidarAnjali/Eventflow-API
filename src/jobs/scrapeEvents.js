require('dotenv').config();
const { scrapeQueue } = require('../config/queue');
const scrapingService = require('../services/scrapingService');
const logger = require('../utils/logger');

// loaded by worker.js; keeps redis + bull running alongside scrape logic
const concurrency = Math.max(1, parseInt(process.env.SCRAPE_JOB_CONCURRENCY, 10) || 1);

scrapeQueue.process(concurrency, async (job) => {
  logger.info('Processing scrape job', {
    jobId: job.id,
    name: job.name,
    attemptsMade: job.attemptsMade,
  });
  return scrapingService.runAllScrapers();
});

// optional fixed-interval job; omit env var to only scrape when jobs are added manually
const intervalMs = parseInt(process.env.SCRAPE_INTERVAL_MS, 10);
if (!Number.isNaN(intervalMs) && intervalMs >= 60_000) {
  scrapeQueue
    .add(
      'scheduled-scrape',
      {},
      {
        repeat: { every: intervalMs },
        jobId: 'eventflow-scheduled-scrape',
        removeOnComplete: 50,
      }
    )
    .then(() => {
      logger.info('Registered recurring scrape job', { everyMs: intervalMs });
    })
    .catch((err) => {
      logger.error('Failed to register recurring scrape job', { error: err.message });
    });
}

module.exports = { scrapeQueue };
