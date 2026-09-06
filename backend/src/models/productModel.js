const { pool } = require('../config/db');

// In-memory store for rich product detail metadata (variants, pricelists, subscription config)
const mockProductDetailsStore = {};

const getProductById = async (id) => {
  let product = null;

  // Check database first if valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    try {
      const res = await pool.query(`
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.cost_price,
          p.margin_percentage,
          p.unit,
          p.tax_rate,
          p.is_active,
          p.category_id,
          p.created_at,
          c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `, [id]);
      if (res.rows.length > 0) {
        product = res.rows[0];
      }
    } catch (err) {
      console.error('Error fetching DB product by ID:', err);
    }
  }

  // If in-memory custom data exists for this product ID, merge it
  if (mockProductDetailsStore[id]) {
    return mockProductDetailsStore[id];
  }

  // Base fallback structure matching the DealFlow360 Product & Pricelist screenshot design
  const defaultDetail = {
    id: id || 'PRD-2026-089',
    catalog_id: id ? (id.length > 12 ? `PRD-${id.substring(0, 8).toUpperCase()}` : id) : 'PRD-2026-089',
    name: product ? product.name : 'Enterprise Executive Ergonomic Suite',
    category_id: product ? product.category_id : '',
    category_name: product ? (product.category_name || 'Office Furniture & Ergonomics') : 'Office Furniture & Ergonomics',
    unit: product ? (product.unit || 'UNIT') : 'UNIT',
    price: product ? parseFloat(product.price) : 18500,
    cost_price: product ? parseFloat(product.cost_price || 0) : 6500,
    tax_rate: product ? parseFloat(product.tax_rate) : 18,
    description: product ? (product.description || 'High-grade ergonomic executive workspace seating engineered for 24/7 durability, featuring adjustable 4D lumbar support, breathable tension mesh, and synchronized multi-tilt mechanism.') : 'High-grade ergonomic executive workspace seating engineered for 24/7 durability, featuring adjustable 4D lumbar support, breathable tension mesh, and synchronized multi-tilt mechanism.',
    is_subscription: true,
    recurring_frequency: 'Monthly',
    quantity_on_hand: 342,
    billing_config: {
      billing_frequency: 'Monthly',
      billing_start: 'Beginning of Period',
      next_billing: 'Auto-calculated',
      lifecycle_status: 'Active'
    },
    variants: [
      { id: 'v1', attribute: 'Color', values: ['Blue', 'Black'], extra_price: '₹0 (Included in base)' },
      { id: 'v2', attribute: 'RAM', values: ['4GB', '8GB'], extra_price: '+₹3,000 (on 8GB tier)' },
      { id: 'v3', attribute: 'Manufacturer', values: ['Dell', 'HP'], extra_price: '+₹2,000 / +₹3,000' }
    ],
    pricelists: [
      { id: 'pl1', tier: 'Bronze Tier', badge: null, currency: 'INR (₹)', rule: 'Base price, no adjustment', baseline: 'Standard catalogue baseline: ₹18,500', status: 'Active', discount: 'Baseline' },
      { id: 'pl2', tier: 'Silver Tier', badge: null, currency: 'INR (₹)', rule: '5% below base price', baseline: 'Calculated price: ₹17,575', status: 'Active', discount: '-5.0%' },
      { id: 'pl3', tier: 'Gold Tier', badge: 'Premium', currency: 'INR (₹)', rule: '10% below base price', baseline: 'Calculated price: ₹16,650', status: 'Active', discount: '-10.0%' }
    ]
  };

  return defaultDetail;
};

const updateProduct = async (id, data) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    try {
      const { name, category_id, description, price, cost_price, unit, tax_rate } = data;
      await pool.query(`
        UPDATE products 
        SET name = COALESCE($1, name),
            category_id = COALESCE($2, category_id),
            description = COALESCE($3, description),
            price = COALESCE($4, price),
            cost_price = COALESCE($5, cost_price),
            unit = COALESCE($6, unit),
            tax_rate = COALESCE($7, tax_rate),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
      `, [name, category_id || null, description, price, cost_price, unit, tax_rate, id]);
    } catch (err) {
      console.error('Error updating DB product:', err);
    }
  }

  // Update in-memory store
  const existing = await getProductById(id);
  const updated = {
    ...existing,
    ...data,
    id,
    billing_config: {
      ...existing.billing_config,
      ...(data.billing_config || {}),
      billing_frequency: data.recurring_frequency || existing.recurring_frequency || 'Monthly'
    }
  };

  mockProductDetailsStore[id] = updated;
  return updated;
};

const getAllProducts = async () => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.cost_price,
      p.margin_percentage,
      p.unit,
      p.tax_rate,
      p.is_active,
      p.category_id,
      p.created_at,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);

  return result.rows;
};

const getCategories = async () => {
  const result = await pool.query(`
    SELECT id, name, description FROM categories ORDER BY name ASC
  `);
  return result.rows;
};

const createProduct = async (data) => {
  let { name, category_id, description, price, cost_price, unit, tax_rate, is_active } = data;
  
  if (!category_id) {
    const catRes = await pool.query(`SELECT id FROM categories LIMIT 1`);
    if (catRes.rows.length > 0) {
      category_id = catRes.rows[0].id;
    }
  }

  const result = await pool.query(`
    INSERT INTO products (name, category_id, description, price, cost_price, unit, tax_rate, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    name,
    category_id,
    description || '',
    price || 0,
    cost_price || 0,
    unit || 'UNIT',
    tax_rate || 18,
    is_active !== undefined ? is_active : true
  ]);

  return result.rows[0];
};

module.exports = {
  getAllProducts,
  getCategories,
  createProduct,
  getProductById,
  updateProduct
};