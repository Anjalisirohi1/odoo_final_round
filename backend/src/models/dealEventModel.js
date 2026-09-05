const { pool } = require('../config/db');

/**
 * Log a deal event.
 * Called internally whenever a significant action occurs on a quotation.
 */
const logEvent = async ({
  quotationId,
  eventType,
  actorId = null,
  actorType = 'SYSTEM',
  metadata = {}
}) => {
  const result = await pool.query(
    `INSERT INTO deal_events
       (quotation_id, event_type, actor_id, actor_type, metadata)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING *`,
    [quotationId, eventType, actorId, actorType, JSON.stringify(metadata)]
  );
  return result.rows[0];
};

/**
 * Retrieve all events for a quotation, newest first.
 */
const getEventsForQuotation = async (quotationId) => {
  const result = await pool.query(
    `SELECT
       de.*,
       u.name AS actor_name
     FROM deal_events de
     LEFT JOIN users u ON u.id = de.actor_id
     WHERE de.quotation_id = $1
     ORDER BY de.created_at ASC`,
    [quotationId]
  );
  return result.rows;
};

/**
 * Count events by type for a quotation — used as ML engagement signals.
 */
const getEventSummary = async (quotationId) => {
  const result = await pool.query(
    `SELECT
       event_type,
       COUNT(*)::int AS count,
       MAX(created_at) AS last_occurrence
     FROM deal_events
     WHERE quotation_id = $1
     GROUP BY event_type
     ORDER BY last_occurrence DESC`,
    [quotationId]
  );
  return result.rows;
};

module.exports = { logEvent, getEventsForQuotation, getEventSummary };
