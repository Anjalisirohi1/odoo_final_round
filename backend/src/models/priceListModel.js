const { pool } = require('../config/db');

const getAllPriceLists = async () => {
  const result = await pool.query(`
    SELECT
      pl.id,
      pl.name,
      pl.currency,
      pl.is_active,
      ct.name AS tier_name,
      ct.default_discount_limit
    FROM price_lists pl
    LEFT JOIN customer_tiers ct
      ON pl.tier_id = ct.id
    WHERE pl.is_active = TRUE
    ORDER BY pl.name ASC
  `);

  return result.rows;
};

const getPriceListItems = async (priceListId) => {
  const result = await pool.query(`
    SELECT
      pli.id,
      pli.price_list_id,
      pli.product_id,
      p.name AS product_name,
      p.category_id,
      c.name AS category_name,
      p.unit,
      p.tax_rate,
      pli.price
    FROM price_list_items pli
    JOIN products p
      ON pli.product_id = p.id
    JOIN categories c
      ON p.category_id = c.id
    WHERE pli.price_list_id = $1
    ORDER BY p.name ASC
  `, [priceListId]);

  return result.rows;
};

module.exports = {
  getAllPriceLists,
  getPriceListItems
};