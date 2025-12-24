const { scrapeQueue } = require('../config/queue');
const scrapingService = require('../services/scrapingService');
const logger = require('../utils/logger');

// define job processor
scrapeQueue.process(async (job) => {
  logger.info('Processing scraping job', { jobId: job.id });
  
  const {source} = job.data;
  
  try {
    let results;
    
    if(source){
      results = await scrapingService.runScraper(source);
    } else {
      results = await scrapingService.runAllScrapers();
    }
    
    return results;

  } catch (error) {

    logger.error('Job processing failed', { 
      jobId: job.id, 
      error: error.message 
    });

    throw error;

  }
});

// schedule recurring scraping jobs
async function scheduleScrapingJobs() {
  const intervalHours = parseInt(process.env.SCRAPE_INTERVAL_HOURS) || 6;
  
  // rmove all existing repeat jobs
  const repeatableJobs = await scrapeQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await scrapeQueue.removeRepeatableByKey(job.key);
  }
  
  // schedule new job
  await scrapeQueue.add(
    {},
    {
      repeat: {
        every: intervalHours * 60 * 60 * 1000, // cnvert hours to milliseconds
      },
    }
  );
  
  logger.info(`Scheduled scraping jobs every ${intervalHours} hours`);
}

// initialize scheduling when module is loaded
scheduleScrapingJobs().catch(err => {
  logger.error('Failed to schedule jobs', { error: err.message });
});

module.exports = { scrapeQueue, scheduleScrapingJobs };