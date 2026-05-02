const BaseScraper = require('./Base/BaseScraper');
const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('../utils/logger');

class EventbriteScraper extends BaseScraper {
  constructor() {
    super('eventbrite');
    this.baseUrl = 'https://www.eventbrite.com';
  }

  async scrape() {
    const events = [];

    try {
      // listing html changes often — selectors below may return zero rows (see fallback below)
      const url = `${this.baseUrl}/d/online/tech--events/`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        timeout: 25_000,
      });

      const $ = cheerio.load(response.data);

      // card class names are brittle; update when eventbrite redesigns search results
      $('.search-event-card').each((i, element) => {
        const $el = $(element);

        events.push({
          id: $el.attr('data-event-id'),
          title: $el.find('.event-card__title').text().trim(),
          description: $el.find('.event-card__description').text().trim(),
          startDate: $el.find('[data-start-date]').attr('data-start-date'),
          location: {
            name: $el.find('.event-card__location').text().trim(),
          },
          url: $el.find('a').first().attr('href'),
          imageUrl: $el.find('img').first().attr('src'),
          isFree: $el.find('.event-card__price').text().toLowerCase().includes('free'),
          organizer: $el.find('.event-card__organizer').text().trim(),
        });
      });

      // when selectors no longer match, do not fabricate data for downstream consumers
      if (events.length === 0) {
        logger.warn(
          'Eventbrite: no cards matched current selectors; returning an empty result set'
        );
      }
    } catch (error) {
      throw new Error(`Eventbrite scraping failed: ${error.message}`);
    }

    return events;
  }
}

module.exports = EventbriteScraper;