require('dotenv').config();
const fs = require('fs');
const path = require('path');

// winston writes under logs/; ensure folder exists on cold start (works on all platforms)
try {
  fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
} catch (_) {
  /* logs dir exists or cwd not writable */
}

const express = require('express');
const helmet = require('helmet');

const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const createRateLimiter = require('./middleware/rateLimit');
const eventsRouter = require('./routes/events');
const healthRouter = require('./routes/health');

const PORT = process.env.PORT || 3000;

// wires postgres + optional redis, then mounts routes (rate limit is applied only under /api/v1/events)
async function createApp() {
  await initializeDatabase();
  await initializeRedis();

  const app = express();
  app.use(helmet());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      name: 'Eventflow API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/v1/health',
        events: '/api/v1/events',
        eventById: '/api/v1/events/:id',
        eventStats: '/api/v1/events/stats/summary',
        scrape: 'POST /api/v1/events/scrape (header: X-API-Key)',
      },
    });
  });

  app.use('/api/v1/health', healthRouter);
  // limiter is created after redis init so it can pick redis vs memory store
  app.use('/api/v1/events', createRateLimiter(), eventsRouter);

  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
      availableEndpoints: [
        'GET /',
        'GET /api/v1/health',
        'GET /api/v1/events',
        'GET /api/v1/events/:id',
        'GET /api/v1/events/stats/summary',
        'POST /api/v1/events/scrape',
      ],
    });
  });

  app.use(errorHandler);
  return app;
}

async function main() {
  const app = await createApp();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/v1/health`);
    console.log(`Events: http://localhost:${PORT}/api/v1/events`);
  });
}

// when imported (e.g. tests), only exports createApp — no listen until main runs
if (require.main === module) {
  main().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
}

module.exports = { createApp };
