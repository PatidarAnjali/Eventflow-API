const axios = require('axios');
const cheerio = require('cheerio');

class EventbriteScraper {
  constructor() {
    this.name = 'eventbrite';
  }

  async scrape() {
    console.log(`Starting ${this.name} scraper...`);
    const events = [];

    try{
      // mock event for demo
      events.push({
        external_id: 'demo-evt-1',
        source: this.name,
        title: 'Tech Meetup 2024',
        description: 'A gathering of tech enthusiasts',
        start_date: new Date('2024-03-15T18:00:00Z'),
        end_date: new Date('2024-03-15T20:00:00Z'),
        location: { name: 'Online', city: 'Virtual' },
        category: 'Technology',
        url: 'https://example.com/event1',
        is_free: true,
        organizer: 'Tech Community',
      });

      console.log(`${this.name} found ${events.length} events`);
    } catch (error) {
      console.error(`${this.name} scraping failed:`, error.message);
    }

    return events;
  }
}

module.exports = new EventbriteScraper();
