const { pool } = require('../config/database');
const logger = require('../utils/logger');

class EventService {
  async createEvent(eventData) {
    const query = `
      INSERT INTO events (
        external_id, source, title, description, start_date, end_date,
        location, category, url, image_url, is_free, price, organizer, raw_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (external_id) 
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        location = EXCLUDED.location,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      eventData.external_id,
      eventData.source,
      eventData.title,
      eventData.description,
      eventData.start_date,
      eventData.end_date,
      JSON.stringify(eventData.location),
      eventData.category,
      eventData.url,
      eventData.image_url,
      eventData.is_free,
      eventData.price,
      eventData.organizer,
      JSON.stringify(eventData.raw_data),
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create event', { error: error.message });
      throw error;
    }
  }

  async getEvents(filters = {}) {
    let query = 'SELECT * FROM events WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.startDate) {
      query += ` AND start_date >= $${paramCount}`;
      values.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND start_date <= $${paramCount}`;
      values.push(filters.endDate);
      paramCount++;
    }

    if (filters.category) {
      query += ` AND category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    if (filters.source) {
      query += ` AND source = $${paramCount}`;
      values.push(filters.source);
      paramCount++;
    }

    if (filters.isFree !== undefined) {
      query += ` AND is_free = $${paramCount}`;
      values.push(filters.isFree);
      paramCount++;
    }

    query += ' ORDER BY start_date ASC';

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get events', { error: error.message });
      throw error;
    }
  }

  async getEventById(id) {
    const query = 'SELECT * FROM events WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get event by ID', { error: error.message });
      throw error;
    }
  }

  async getEventStats() {
    const query = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT source) as sources_count,
        COUNT(CASE WHEN is_free THEN 1 END) as free_events,
        COUNT(CASE WHEN start_date > NOW() THEN 1 END) as upcoming_events
      FROM events
    `;

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get event stats', { error: error.message });
      throw error;
    }
  }
}

module.exports = new EventService();
