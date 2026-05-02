# Eventflow API

Backend service that aggregates event data from multiple public sources, normalizes it, and exposes it through a REST API.

## Features
- Scrapes events from public listing pages (Eventbrite HTML + Meetup via Puppeteer)
- Normalizes source-specific rows into a shared schema
- Persists events in PostgreSQL with upsert by `external_id`
- REST API with optional Redis-backed caching and rate limiting
- Background scraping worker (Bull + Redis)

## Tech Stack
- Node.js, Express
- PostgreSQL (`pg`)
- Redis (cache, rate limits, Bull queue)
- Axios, Cheerio, Puppeteer

## Project layout
```
src/
├── app.js                 # Express app factory & HTTP server
├── config/                # database, redis, Bull queue
├── jobs/                  # worker job definitions (scrape queue)
├── middleware/            # auth, cache, errors, rate limit
├── routes/                # events, health
├── scrapers/              # per-source scrapers + BaseScraper
├── services/              # event + scraping orchestration
├── utils/
migrations/                # SQL migrations
docker/docker-compose.yml  # Postgres + Redis for local dev
```

## Setup

1. **Dependencies**
   ```bash
   npm install
   ```

2. **Infrastructure** (PostgreSQL + Redis)
   ```bash
   npm run docker:up
   ```

3. **Environment**
   ```bash
   cp .env.example .env
   # Edit secrets (especially API_KEY) for non-local use.
   ```

4. **Database schema**
   ```bash
   npm run migrate
   ```

5. **Run API**
   ```bash
   npm start
   ```
   Server: http://localhost:3000  

6. **Optional: background worker** (scheduled / queued scrapes; requires Redis)
   ```bash
   npm run worker
   ```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service metadata |
| GET | `/api/v1/health` | DB + Redis status |
| GET | `/api/v1/events` | List events (`start_date`, `end_date`, `category`, `source`, `is_free`, `limit`, `offset`) |
| GET | `/api/v1/events/:id` | Single event |
| GET | `/api/v1/events/stats/summary` | Counts / aggregates |
| POST | `/api/v1/events/scrape` | Run scrapers (`X-API-Key` header; optional JSON `{ "source": "eventbrite" \| "meetup" }`) |

Example:
```bash
curl -s http://localhost:3000/api/v1/events | jq
```

Trigger scrape (set `API_KEY` in `.env`):
```bash
curl -s -X POST http://localhost:3000/api/v1/events/scrape \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-change-me" \
  -d '{}'
```

## Design notes
- Scrapers are isolated per source; `BaseScraper` normalizes rows and generates stable `external_id` when a source omits ids.
- Without Redis, the API still runs using in-memory rate limits and skips HTTP caching.
- Eventbrite markup changes often; if live selectors find no cards, a single placeholder event is returned so the ingestion path can still be tested end-to-end.

## Roadmap ideas
- Additional sources and richer normalization
- Structured logging / metrics
- Contract tests against recorded HTML fixtures
