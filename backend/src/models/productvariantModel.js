const { pool } = require('../config/db');

const getVariantsByProductId = async (productId) => {
  const result = await pool.query(`
    SELECT
      pv.id,
      pv.product_id,
      pv.attribute_name,
      pv.attribute_value,
      pv.extra_price,
      pv.created_at,
      p.name AS product_name
    FROM product_variants pv
    JOIN products p
      ON pv.product_id = p.id
    WHERE pv.product_id = $1
    ORDER BY pv.attribute_name, pv.attribute_value
  `, [productId]);

  return result.rows;
};

module.exports = {
  getVariantsByProductId
};