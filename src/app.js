require('dotenv').config();
const express = require('express');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());

// groot route - shows API info
app.get('/', (req, res) => {
  res.json({
    name: 'Event Scraper API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/health',
      events: '/api/v1/events'
    }
  });
});

// health check
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// events endpoint
app.get('/api/v1/events', (req, res) => {
  res.json({ 
    success: true, 
    data: [],
    message: 'Events API endpoint - ready for implementation!' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /',
      'GET /api/v1/health',
      'GET /api/v1/events'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`Events: http://localhost:${PORT}/api/v1/events`);
});

module.exports = app;
