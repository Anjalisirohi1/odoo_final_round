const { pool } = require('../config/db');

const getAllProducts = async () => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.unit,
      p.tax_rate,
      p.is_active,
      c.name AS category_name
    FROM products p
    JOIN categories c
      ON p.category_id = c.id
    WHERE p.is_active = TRUE
    ORDER BY p.name ASC
  `);

  return result.rows;
};

module.exports = {
  getAllProducts
};