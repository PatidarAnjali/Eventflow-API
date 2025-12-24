const express = require('express');
const router = express.Router();
const eventService = require('../services/eventService');
const scrapingService = require('../services/scrapingService');
const authenticate = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimit');
const cacheMiddleware = require('../middleware/cache');
const logger = require('../utils/logger');

// apply rate limiting to all routes
router.use(rateLimiter);

// GET /api/v1/events - list all events
router.get('/', cacheMiddleware(300), async (req, res, next) => {
  
  try{
    const filters = {
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      category: req.query.category,
      source: req.query.source,
      isFree: req.query.is_free === 'true',
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
    };

    const events = await eventService.getEvents(filters);
    
    res.json({
      success: true,
       data: events,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: events.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/events/:id - get single event
router.get('/:id', cacheMiddleware(300), async (req, res, next) => {
  
  try{
    const event = await eventService.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch(error) {
    next(error);
  }

});

// POST /api/v1/events/scrape - Trigger scraping manually
router.post('/scrape', authenticate, async (req, res, next) => {

  try{
    const { source } = req.body;
    
    let results;
    if(source) {
      results = await scrapingService.runScraper(source);
    } else {
      results = await scrapingService.runAllScrapers();
    }

    logger.info('Manual scraping triggered', { results });

    res.json({
      success: true,
      message: 'Scraping completed',
      data: results,
    });
  } catch (error) {
    next(error);

  }
});

// GET /api/v1/events/stats - get statistics
router.get('/stats/summary', cacheMiddleware(600), async (req, res, next) => {
  try{
    const stats = await eventService.getEventStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;