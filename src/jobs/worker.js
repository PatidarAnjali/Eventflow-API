// separate worker process for handling background jobs
require('dotenv').config();
const logger = require('../utils/logger');
require('./scrapeEvents');

logger.info('Worker process started');

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down worker');
  process.exit(0);
});