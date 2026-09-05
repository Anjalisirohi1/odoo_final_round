const { pool } = require('../config/db');

/**
 * buildDealContext(quotationId)
 *
 * Assembles the complete deal context that the ML API needs.
 * Every ML endpoint receives this payload so it has real data
 * to compute health scores, predictions, and anomaly signals.
 *
 * Returns null if the quotation doesn't exist.
 */
const buildDealContext = async (quotationId) => {

  // ─── Quotation + Customer + Sales Rep ────────────────────────
  const quotationResult = await pool.query(
    `SELECT
       q.id                  AS quotation_id,
       q.quotation_number,
       q.status,
       q.subtotal,
       q.discount_amount     AS total_discount,
       q.tax_amount,
       q.total_amount,
       q.total_margin,
       q.valid_until,
       q.notes,
       q.created_at,
       q.updated_at,

       -- Customer
       c.id                  AS customer_id,
       c.company_name        AS customer_name,
       c.industry,
       c.region              AS customer_region,
       ct.name               AS customer_tier,

       -- Sales Rep
       u.id                  AS sales_rep_id,
       u.name                AS sales_rep_name,
       u.region              AS sales_rep_region,
       u.team_id
     FROM quotations q
     JOIN customers  c  ON c.id = q.customer_id
     JOIN users      u  ON u.id = q.sales_rep_id
     LEFT JOIN customer_tiers ct ON ct.id = c.tier_id
     WHERE q.id = $1`,
    [quotationId]
  );

  if (!quotationResult.rows.length) return null;
  const q = quotationResult.rows[0];

  // ─── Quotation Items + Products ───────────────────────────────
  const itemsResult = await pool.query(
    `SELECT
       qi.id               AS quote_item_id,
       qi.product_id,
       p.name              AS product_name,
       cat.name            AS category,
       p.price             AS selling_price,
       p.cost_price,
       p.margin_percentage,
       qi.quantity,
       COALESCE(qi.original_price, qi.unit_price) AS original_price,
       qi.discount_percent AS discount_percentage,
       qi.discount_amount,
       COALESCE(qi.final_price, qi.line_total)    AS final_price,
       qi.cost_price       AS item_cost_price,
       qi.margin_amount,
       qi.line_total
     FROM quotation_items qi
     JOIN products  p   ON p.id = qi.product_id
     LEFT JOIN categories cat ON cat.id = p.category_id
     WHERE qi.quotation_id = $1`,
    [quotationId]
  );

  // ─── Approval History ─────────────────────────────────────────
  const approvalResult = await pool.query(
    `SELECT
       ah.id             AS approval_id,
       ar.id             AS request_id,
       ar.quotation_id,
       ar.status,
       ar.requested_at,
       ah.action,
       ah.reason,
       ah.action_at,
       u.name            AS approver_name
     FROM approval_requests ar
     LEFT JOIN approval_history ah ON ah.approval_request_id = ar.id
     LEFT JOIN users            u  ON u.id = ah.action_by
     WHERE ar.quotation_id = $1
     ORDER BY ah.action_at ASC`,
    [quotationId]
  );

  // ─── Deal Events (Engagement Timeline) ───────────────────────
  const eventsResult = await pool.query(
    `SELECT
       de.event_type,
       de.actor_type,
       de.metadata,
       de.created_at,
       u.name AS actor_name
     FROM deal_events de
     LEFT JOIN users u ON u.id = de.actor_id
     WHERE de.quotation_id = $1
     ORDER BY de.created_at ASC`,
    [quotationId]
  );

  // ─── Event summary counts (for ML signals) ────────────────────
  const eventSummaryResult = await pool.query(
    `SELECT
       event_type,
       COUNT(*)::int        AS count,
       MIN(created_at)      AS first_occurrence,
       MAX(created_at)      AS last_occurrence
     FROM deal_events
     WHERE quotation_id = $1
     GROUP BY event_type`,
    [quotationId]
  );

  const eventSummary = {};
  eventSummaryResult.rows.forEach(row => {
    eventSummary[row.event_type] = {
      count: row.count,
      first_occurrence: row.first_occurrence,
      last_occurrence: row.last_occurrence
    };
  });

  // ─── Inventory for line item products ────────────────────────
  const productIds = itemsResult.rows.map(i => i.product_id);
  let inventoryRows = [];
  if (productIds.length > 0) {
    const invResult = await pool.query(
      `SELECT
         inv.product_id,
         p.name            AS product_name,
         w.warehouse_name,
         w.region          AS warehouse_region,
         inv.available_quantity,
         inv.reserved_quantity
       FROM inventory inv
       JOIN warehouses w ON w.id  = inv.warehouse_id
       JOIN products   p ON p.id  = inv.product_id
       WHERE inv.product_id = ANY($1::uuid[])`,
      [productIds]
    );
    inventoryRows = invResult.rows;
  }

  // ─── Orders linked to this quotation ─────────────────────────
  const ordersResult = await pool.query(
    `SELECT
       o.id        AS order_id,
       o.status,
       o.order_date,
       o.total_amount,
       f.status    AS fulfillment_status,
       f.promised_delivery_date,
       f.shipped_date,
       f.actual_delivery_date
     FROM orders o
     LEFT JOIN fulfillments f ON f.order_id = o.id
     WHERE o.quotation_id = $1`,
    [quotationId]
  );

  // ─── Assemble full context payload ───────────────────────────
  return {
    quotation_id: q.quotation_id,

    quotation: {
      quotation_number: q.quotation_number,
      status:           q.status,
      subtotal:         Number(q.subtotal || 0),
      total_discount:   Number(q.total_discount || 0),
      tax_amount:       Number(q.tax_amount || 0),
      total_amount:     Number(q.total_amount || 0),
      total_margin:     Number(q.total_margin || 0),
      valid_until:      q.valid_until,
      notes:            q.notes,
      created_at:       q.created_at,
      updated_at:       q.updated_at,
      days_open:        Math.floor(
        (new Date() - new Date(q.created_at)) / (1000 * 60 * 60 * 24)
      )
    },

    customer: {
      customer_id:   q.customer_id,
      customer_name: q.customer_name,
      customer_tier: q.customer_tier || 'STANDARD',
      industry:      q.industry,
      region:        q.customer_region
    },

    sales_representative: {
      sales_rep_id:   q.sales_rep_id,
      name:           q.sales_rep_name,
      team_id:        q.team_id,
      region:         q.sales_rep_region
    },

    quotation_items: itemsResult.rows.map(item => ({
      quote_item_id:       item.quote_item_id,
      product_id:          item.product_id,
      product_name:        item.product_name,
      category:            item.category,
      selling_price:       Number(item.selling_price || 0),
      cost_price:          Number(item.cost_price || 0),
      margin_percentage:   Number(item.margin_percentage || 0),
      quantity:            Number(item.quantity || 0),
      original_price:      Number(item.original_price || 0),
      discount_percentage: Number(item.discount_percentage || 0),
      discount_amount:     Number(item.discount_amount || 0),
      final_price:         Number(item.final_price || 0),
      line_total:          Number(item.line_total || 0),
      margin_amount:       Number(item.margin_amount || 0)
    })),

    approval_history: approvalResult.rows.map(a => ({
      approval_id:        a.approval_id,
      status:             a.status,
      requested_at:       a.requested_at,
      action:             a.action,
      reason:             a.reason,
      action_at:          a.action_at,
      approver_name:      a.approver_name
    })),

    deal_events: eventsResult.rows,

    event_summary: eventSummary,

    inventory: inventoryRows.map(i => ({
      product_id:          i.product_id,
      product_name:        i.product_name,
      warehouse_name:      i.warehouse_name,
      warehouse_region:    i.warehouse_region,
      available_quantity:  Number(i.available_quantity || 0),
      reserved_quantity:   Number(i.reserved_quantity || 0)
    })),

    orders: ordersResult.rows.map(o => ({
      order_id:                o.order_id,
      status:                  o.status,
      order_date:              o.order_date,
      total_amount:            Number(o.total_amount || 0),
      fulfillment_status:      o.fulfillment_status,
      promised_delivery_date:  o.promised_delivery_date,
      shipped_date:            o.shipped_date,
      actual_delivery_date:    o.actual_delivery_date
    }))
  };
};

module.exports = { buildDealContext };
