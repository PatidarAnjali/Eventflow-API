const BaseScraper = require('./Base/BaseScraper');
const cheerio = require('cheerio');
const axios = require('axios');

class EventbriteScraper extends BaseScraper {
  constructor() {
    super('eventbrite');
    this.baseUrl = 'https://www.eventbrite.com';
  }

  async scrape() {
    const events = [];
    
    try {
      // ex: sraping eventbrite search page for tech events
      const url = `${this.baseUrl}/d/online/tech--events/`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      
      // actual selectors will vary
      // TODO: update selectors based on eventbrites current HTML structure
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
          url: $el.find('a').attr('href'),
          imageUrl: $el.find('img').attr('src'),
          isFree: $el.find('.event-card__price').text().includes('Free'),
          organizer: $el.find('.event-card__organizer').text().trim(),
        });
      });
    } catch (error) {
      throw new Error(`Eventbrite scraping failed: ${error.message}`);
    }

    return events;
  }
}

module.exports = EventbriteScraper;