const { pool } = require('../config/db');

const getAllCustomers = async () => {
  const result = await pool.query(`
    SELECT
      c.id,
      c.company_name,
      c.contact_name,
      c.email,
      c.phone,
      c.currency,
      c.is_active,
      c.created_at,
      ct.name AS tier_name,
      ct.default_discount_limit
    FROM customers c
    JOIN customer_tiers ct
      ON c.tier_id = ct.id
    WHERE c.is_active = TRUE
    ORDER BY c.company_name ASC
  `);

  return result.rows;
};

module.exports = {
  getAllCustomers
};