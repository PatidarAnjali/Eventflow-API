# Eventflow API

> **Status:** This project is actively under development.

### Event Aggregation and API Gateway

Eventflow API is a backend service that aggregates event data from multiple public sources, normalizes it into a consistent format, and exposes it through a single RESTAPI.
This project demonstrates web scraping, data normalization, and API design.

## Features
- Scrapes events from public event pages
- Normalizes messy source data into a consistent schema
- Exposes events through a REST API
- Source-agnostic scraper architecture
- Basic error handling

## Tech Stack
- Node.js
- Express
- Axios
- Cheerio
- PostgreSQL (planned)
- Redis (planned)

## Project Structure
```
src/
├── app.js
├── server.js
├── routes/
│ └── events.js
├── scrapers/
│ └── eventbrite.js
├── db/
└── utils/
```

## API Endpoints

### GET `/events`
Returns a list of normalized events.

**Example response:**
```json
[
  {
    "title": "Intro to Web Development",
    "date": "2025-01-20T18:00:00.000Z",
    "location": "Toronto, ON",
    "price": "free",
    "source": "eventbrite"
  }
]
```

## Setup & Run Locally
```
git clone https://github.com/your-username/atlas-api-gateway
cd atlas-api-gateway
npm install
node src/server.js
```
API runs at: http://localhost:3000

## Design Decisions
- Single API gateway abstracts multiple sources
- Scrapers are isolated per source
- Normalization ensures consistent API output

## Roadmap
- Add database persistence
- Add more event sources
- Implement rate limiting
- Add caching

## What I Learned
- Web scraping real-world HTML
- Designing APIs around inconsistent data
- Structuring extensible backend services

