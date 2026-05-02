const scrapers = require('../scrapers');
const eventService = require('./eventService');
const logger = require('../utils/logger');
const { invalidateEventsCache } = require('../config/redis');

// orchestrates scrapers and persists rows; invalidates redis http cache after writes
class ScrapingService {

  async runAllScrapers()  {
    const results = {
      total: 0,
      bySource: {},
      errors: [],
    };

    for(const [name, scraper] of Object.entries(scrapers)) {
      try{
        const events = await scraper.run();
        
        for(const event of events) {
          await eventService.createEvent(event);
        }

        results.bySource[name] = events.length;
        results.total += events.length;

      }catch (error) {
        logger.error(`Scraper ${name} failed`, { error: error.message });
        results.errors.push({ source: name, error: error.message });
      }
    }

    // so GET /events does not keep serving empty cached bodies after a successful scrape
    await invalidateEventsCache();
    return results;
  }

  async runScraper(scraperName){
    const scraper = scrapers[scraperName];
    
    if(!scraper) {
      throw new Error(`Scraper ${scraperName} not found`);
    }

    const events = await scraper.run();
    
    for(const event of events) {
      await eventService.createEvent(event);
    }

    // same cache bust as runAllScrapers so single-source runs refresh cached lists
    await invalidateEventsCache();
    return {source: scraperName, count: events.length};
  }
}

module.exports = new ScrapingService();