const logger = require('../utils/logger');

function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if(!apiKey || apiKey !== process.env.API_KEY) {
    logger.warn('Unauthorized API access attempt', { ip: req.ip });
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

module.exports = authenticate;