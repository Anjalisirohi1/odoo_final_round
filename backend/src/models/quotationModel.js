const { pool } = require('../config/db');

const createQuotation = async (quotation, items, client = pool) => {
  const quotationResult = await client.query(
    `
    INSERT INTO quotations (
      quotation_number,
      customer_id,
      sales_rep_id,
      price_list_id,
      status,
      subtotal,
      discount_amount,
      tax_amount,
      total_amount,
      valid_until,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
    `,
    [
      quotation.quotation_number,
      quotation.customer_id,
      quotation.sales_rep_id,
      quotation.price_list_id,
      quotation.status,
      quotation.subtotal,
      quotation.discount_amount,
      quotation.tax_amount,
      quotation.total_amount,
      quotation.valid_until,
      quotation.notes
    ]
  );

  const quotationRow = quotationResult.rows[0];

  const createdItems = [];

  for (const item of items) {
    const itemResult = await client.query(
      `
      INSERT INTO quotation_items (
        quotation_id,
        product_id,
        variant_id,
        quantity,
        unit_price,
        discount_percent,
        discount_amount,
        tax_rate,
        line_total
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        quotationRow.id,
        item.product_id,
        item.variant_id || null,
        item.quantity,
        item.unit_price,
        item.discount_percent,
        item.discount_amount,
        item.tax_rate,
        item.line_total
      ]
    );

    createdItems.push(itemResult.rows[0]);
  }

  return {
    quotation: quotationRow,
    items: createdItems
  };
};

const getAllQuotations = async () => {
  const result = await pool.query(`
    SELECT
      q.id,
      q.quotation_number,
      q.status,
      q.total_amount,
      q.created_at,
      c.company_name AS customer_name,
      u.full_name AS sales_rep_name
    FROM quotations q
    JOIN customers c ON q.customer_id = c.id
    LEFT JOIN users u ON q.sales_rep_id = u.id
    ORDER BY q.created_at DESC
  `);
  return result.rows;
};

module.exports = {
  createQuotation,
  getAllQuotations
};
