const EventbriteScraper = require('./eventbrite');
const MeetupScraper = require('./meetup');

const scrapers = {
  eventbrite: new EventbriteScraper(),
   meetup: new MeetupScraper(),
};

module.exports = scrapers;