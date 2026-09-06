const { pool } = require("../config/db");

async function getAllInvoices(filters = {}) {
  let query = `
    SELECT 
      i.*,
      c.company_name AS customer_name,
      c.email AS customer_email,
      s.subscription_number,
      s.plan_name,
      q.quotation_number
    FROM invoices i
    LEFT JOIN customers c ON c.id = i.customer_id
    LEFT JOIN subscriptions s ON s.id = i.subscription_id
    LEFT JOIN quotations q ON q.id = i.quotation_id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (filters.status && filters.status !== 'All') {
    query += ` AND i.status = $${paramIndex}`;
    params.push(filters.status.toUpperCase());
    paramIndex++;
  }

  if (filters.search) {
    query += ` AND (i.invoice_number ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  query += ` ORDER BY i.created_at DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
}

async function getInvoiceById(id) {
  const { rows } = await pool.query(`
    SELECT 
      i.*,
      c.company_name AS customer_name,
      c.email AS customer_email,
      c.contact_name AS customer_contact,
      s.subscription_number,
      s.plan_name,
      q.quotation_number
    FROM invoices i
    LEFT JOIN customers c ON c.id = i.customer_id
    LEFT JOIN subscriptions s ON s.id = i.subscription_id
    LEFT JOIN quotations q ON q.id = i.quotation_id
    WHERE i.id::text = $1 OR i.invoice_number = $1
  `, [id]);

  return rows[0] || null;
}

async function getInvoiceMetrics() {
  const { rows } = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN status IN ('UNPAID', 'OVERDUE', 'PARTIAL') THEN total_amount ELSE 0 END), 0) AS total_outstanding,
      COALESCE(SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END), 0) AS total_collected,
      COUNT(CASE WHEN status = 'PAID' THEN 1 END) AS paid_count,
      COUNT(CASE WHEN status = 'UNPAID' THEN 1 END) AS unpaid_count,
      COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) AS overdue_count,
      COUNT(*) AS total_count
    FROM invoices
  `);

  return rows[0];
}

async function createInvoice(data) {
  const invNum = data.invoice_number || `INV-${Date.now().toString().slice(-4)}`;
  const amount = Number(data.amount || 0);
  const taxAmount = Number(data.tax_amount || amount * 0.18);
  const totalAmount = Number(data.total_amount || amount + taxAmount);

  const { rows } = await pool.query(`
    INSERT INTO invoices (
      invoice_number,
      customer_id,
      quotation_id,
      subscription_id,
      amount,
      tax_amount,
      total_amount,
      status,
      due_date,
      payment_method
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [
    invNum,
    data.customer_id || null,
    data.quotation_id || null,
    data.subscription_id || null,
    amount,
    taxAmount,
    totalAmount,
    data.status || 'UNPAID',
    data.due_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    data.payment_method || 'BANK_TRANSFER'
  ]);

  return rows[0];
}

async function markInvoicePaid(id, paymentMethod = 'BANK_TRANSFER') {
  const { rows } = await pool.query(`
    UPDATE invoices
    SET 
      status = 'PAID',
      payment_method = $1,
      paid_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id::text = $2 OR invoice_number = $2
    RETURNING *
  `, [paymentMethod, id]);

  return rows[0] || null;
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoiceMetrics,
  createInvoice,
  markInvoicePaid
};
