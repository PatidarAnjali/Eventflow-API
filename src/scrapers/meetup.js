const BaseScraper = require('./Base/BaseScraper');
const puppeteer = require('puppeteer');

class MeetupScraper extends BaseScraper {
  constructor() {
    super('meetup');
    this.baseUrl = 'https://www.meetup.com';
  }

  async scrape() {
    let browser;
    const events = [];

    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // ex: tech events in specific city
      await page.goto(`${this.baseUrl}/find/?keywords=tech&source=EVENTS`, {
        waitUntil: 'networkidle2',
      });

      // wait for events to load
      await page.waitForSelector('[data-testid="event-card"]', { timeout: 5000 });

      // extract event data
      const scrapedEvents = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="event-card"]');

        return Array.from(cards).map(card => ({
          id: card.getAttribute('data-event-id'),
          title: card.querySelector('h3')?.textContent,
          startDate: card.querySelector('[datetime]')?.getAttribute('datetime'),
          location: {
            name: card.querySelector('[data-testid="location"]')?.textContent,
          },
          url: card.querySelector('a')?.href,
          organizer: card.querySelector('[data-testid="organizer"]')?.textContent,
        }));

      });

      events.push(...scrapedEvents);

    }catch (error) {
      throw new Error(`Meetup scraping failed: ${error.message}`);
    }finally {
      if (browser) await browser.close();
    }

    return events;
  }
}

module.exports = MeetupScraper;
