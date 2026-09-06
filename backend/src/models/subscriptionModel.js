const { pool } = require("../config/db");

async function getAllSubscriptions(filters = {}) {
  let query = `
    SELECT 
      s.*,
      c.company_name AS customer_name,
      c.email AS customer_email,
      q.quotation_number
    FROM subscriptions s
    LEFT JOIN customers c ON c.id = s.customer_id
    LEFT JOIN quotations q ON q.id = s.quotation_id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (filters.status && filters.status !== 'All') {
    query += ` AND s.status = $${paramIndex}`;
    params.push(filters.status.toUpperCase());
    paramIndex++;
  }

  if (filters.plan && filters.plan !== 'All') {
    query += ` AND s.plan_name ILIKE $${paramIndex}`;
    params.push(`%${filters.plan}%`);
    paramIndex++;
  }

  if (filters.search) {
    query += ` AND (s.subscription_number ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex} OR s.plan_name ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  query += ` ORDER BY s.created_at DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
}

async function getSubscriptionById(id) {
  const { rows } = await pool.query(`
    SELECT 
      s.*,
      c.company_name AS customer_name,
      c.email AS customer_email,
      c.contact_name AS customer_contact,
      q.quotation_number
    FROM subscriptions s
    LEFT JOIN customers c ON c.id = s.customer_id
    LEFT JOIN quotations q ON q.id = s.quotation_id
    WHERE s.id::text = $1 OR s.subscription_number = $1
  `, [id]);

  return rows[0] || null;
}

async function getSubscriptionMetrics() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) AS active_count,
      COUNT(CASE WHEN status = 'PENDING_RENEWAL' THEN 1 END) AS pending_renewals,
      COUNT(CASE WHEN status = 'PAST_DUE' THEN 1 END) AS past_due_count,
      COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN mrr ELSE 0 END), 0) AS total_mrr,
      COUNT(*) AS total_count
    FROM subscriptions
  `);

  return rows[0];
}

async function createSubscription(data) {
  const subNum = data.subscription_number || `SUB-${Date.now().toString().slice(-4)}`;
  const { rows } = await pool.query(`
    INSERT INTO subscriptions (
      subscription_number,
      customer_id,
      quotation_id,
      plan_name,
      billing_cycle,
      amount,
      mrr,
      status,
      start_date,
      next_billing_date,
      auto_renew
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `, [
    subNum,
    data.customer_id || null,
    data.quotation_id || null,
    data.plan_name || 'Standard Subscription',
    data.billing_cycle || 'MONTHLY',
    data.amount || 0.00,
    data.mrr || (data.billing_cycle === 'ANNUAL' ? (data.amount || 0) / 12 : (data.amount || 0)),
    data.status || 'ACTIVE',
    data.start_date || new Date(),
    data.next_billing_date || null,
    data.auto_renew !== undefined ? data.auto_renew : true
  ]);

  return rows[0];
}

async function updateSubscriptionStatus(id, status) {
  const { rows } = await pool.query(`
    UPDATE subscriptions
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id::text = $2 OR subscription_number = $2
    RETURNING *
  `, [status, id]);

  return rows[0] || null;
}

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionMetrics,
  createSubscription,
  updateSubscriptionStatus
};
