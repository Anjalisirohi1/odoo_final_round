const { pool } = require('../config/db');

const getAllDiscountRules = async () => {
  const result = await pool.query(`
    SELECT
      dr.id,
      dr.tier_id,
      ct.name AS tier_name,
      dr.category_id,
      c.name AS category_name,
      dr.max_discount,
      dr.approval_level,
      dr.created_at,
      dr.updated_at
    FROM discount_rules dr
    JOIN customer_tiers ct
      ON dr.tier_id = ct.id
    JOIN categories c
      ON dr.category_id = c.id
    ORDER BY ct.name ASC, c.name ASC
  `);

  return result.rows;
};

const getDiscountRule = async (tierId, categoryId) => {
  const result = await pool.query(`
    SELECT
      dr.id,
      dr.tier_id,
      ct.name AS tier_name,
      dr.category_id,
      c.name AS category_name,
      dr.max_discount,
      dr.approval_level
    FROM discount_rules dr
    JOIN customer_tiers ct
      ON dr.tier_id = ct.id
    JOIN categories c
      ON dr.category_id = c.id
    WHERE dr.tier_id = $1
      AND dr.category_id = $2
  `, [tierId, categoryId]);

  return result.rows[0] || null;
};

module.exports = {
  getAllDiscountRules,
  getDiscountRule
};
