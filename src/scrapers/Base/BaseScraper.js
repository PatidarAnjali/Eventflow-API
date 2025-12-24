const logger = require('../../utils/logger');

class BaseScraper {
  constructor(name) {
    this.name = name;
  }

  async scrape() {
     throw new Error('scrape() must be implemented by subclass');
  }

  normalizeEvent(rawEvent) {
    return {
      external_id: rawEvent.id,
      source: this.name,
      title: rawEvent.title,
      description: rawEvent.description,
      start_date: new Date(rawEvent.startDate),
      end_date: rawEvent.endDate ? new Date(rawEvent.endDate) : null,
      location: {
        name: rawEvent.location?.name,
        address: rawEvent.location?.address,
        city: rawEvent.location?.city,
        lat: rawEvent.location?.lat,
        lng: rawEvent.location?.lng,
      },
      category: rawEvent.category,
      url: rawEvent.url,
      image_url: rawEvent.imageUrl,
      is_free: rawEvent.isFree || false,
      price: rawEvent.price || null,
      organizer: rawEvent.organizer,
      raw_data: rawEvent,
    };
  }

  async run() {
    try {
      logger.info(`Starting scraper: ${this.name}`);
      const events = await this.scrape();
      logger.info(`Scraper ${this.name} found ${events.length} events`);
      return events.map(e => this.normalizeEvent(e));
    } catch (error) {
      logger.error(`Scraper ${this.name} failed`, { error: error.message });
      throw error;
    }
  }
}

module.exports = BaseScraper;