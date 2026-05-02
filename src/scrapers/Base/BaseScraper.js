const crypto = require('crypto');
const logger = require('../../utils/logger');

class BaseScraper {
  constructor(name) {
    this.name = name;
  }

  async scrape() {
    throw new Error('scrape() must be implemented by subclass');
  }

  // postgres upserts on external_id — always prefix with source so ids from different
  // sources never collide on the global unique constraint
  stableExternalId(rawEvent) {
    if (rawEvent.id) {
      return `${this.name}-${rawEvent.id}`;
    }
    const basis = `${this.name}|${rawEvent.title || ''}|${rawEvent.startDate || ''}|${rawEvent.url || ''}`;
    const hash = crypto.createHash('sha256').update(basis).digest('hex').slice(0, 32);
    return `${this.name}-${hash}`;
  }

  // maps messy scraper output to eventService.createEvent shape; returns null to drop bad rows
  normalizeEvent(rawEvent) {
    const start = new Date(rawEvent.startDate);
    if (Number.isNaN(start.getTime())) {
      logger.warn('Skipping event with invalid start date', {
        source: this.name,
        title: rawEvent.title,
      });
      return null;
    }

    const end = rawEvent.endDate ? new Date(rawEvent.endDate) : null;
    const endDate = end && !Number.isNaN(end.getTime()) ? end : null;

    let price = rawEvent.price;
    // strip currency symbols before inserting into numeric column
    if (typeof price === 'string' && price.trim() !== '') {
      const n = parseFloat(price.replace(/[^0-9.]/g, ''));
      price = Number.isNaN(n) ? null : n;
    }

    return {
      external_id: this.stableExternalId(rawEvent),
      source: this.name,
      title: rawEvent.title || 'Untitled event',
      description: rawEvent.description || null,
      start_date: start,
      end_date: endDate,
      location: {
        name: rawEvent.location?.name,
        address: rawEvent.location?.address,
        city: rawEvent.location?.city,
        lat: rawEvent.location?.lat,
        lng: rawEvent.location?.lng,
      },
      category: rawEvent.category || null,
      url: rawEvent.url || null,
      image_url: rawEvent.imageUrl || null,
      is_free: rawEvent.isFree || false,
      price: price ?? null,
      organizer: rawEvent.organizer || null,
      raw_data: rawEvent,
    };
  }

  async run() {
    try {
      logger.info(`Starting scraper: ${this.name}`);
      const events = await this.scrape();
      logger.info(`Scraper ${this.name} parsed ${events.length} raw rows`);
      return events.map((e) => this.normalizeEvent(e)).filter(Boolean);
    } catch (error) {
      logger.error(`Scraper ${this.name} failed`, { error: error.message });
      throw error;
    }
  }
}

module.exports = BaseScraper;
