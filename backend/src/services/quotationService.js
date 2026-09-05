const { pool } = require('../config/db');
const quotationModel = require('../models/quotationModel');

const createQuotation = async (data, userId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      customer_id,
      price_list_id,
      items,
      valid_until,
      notes
    } = data;

    if (!customer_id) {
      throw new Error('customer_id is required');
    }

    if (!price_list_id) {
      throw new Error('price_list_id is required');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('At least one quotation item is required');
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const processedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);
      const discountPercent = Number(item.discount_percent || 0);
      const taxRate = Number(item.tax_rate || 0);

      if (!item.product_id) {
        throw new Error('product_id is required for every item');
      }

      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      if (unitPrice < 0) {
        throw new Error('Unit price cannot be negative');
      }

      if (discountPercent < 0 || discountPercent > 100) {
        throw new Error('Discount must be between 0 and 100');
      }

      const grossAmount = quantity * unitPrice;

      const discountAmount =
        grossAmount * (discountPercent / 100);

      const amountAfterDiscount =
        grossAmount - discountAmount;

      const taxAmount =
        amountAfterDiscount * (taxRate / 100);

      const lineTotal =
        amountAfterDiscount + taxAmount;

      subtotal += grossAmount;
      totalDiscount += discountAmount;
      totalTax += taxAmount;

      processedItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity,
        unit_price: unitPrice,
        discount_percent: discountPercent,
        discount_amount: Number(discountAmount.toFixed(2)),
        tax_rate: taxRate,
        line_total: Number(lineTotal.toFixed(2))
      });
    }

    const totalAmount =
      subtotal - totalDiscount + totalTax;

    const quotationNumber =
      `QT-${Date.now()}`;

    const result = await quotationModel.createQuotation(
      {
        quotation_number: quotationNumber,
        customer_id,
        sales_rep_id: userId,
        price_list_id,
        status: 'DRAFT',
        subtotal: Number(subtotal.toFixed(2)),
        discount_amount: Number(totalDiscount.toFixed(2)),
        tax_amount: Number(totalTax.toFixed(2)),
        total_amount: Number(totalAmount.toFixed(2)),
        valid_until: valid_until || null,
        notes: notes || null
      },
      processedItems,
      client
    );

    await client.query('COMMIT');

    return result;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const evaluateQuotation = async (quotationId) => {
  const qData = await quotationModel.getQuotationWithItems(quotationId);
  if (!qData) throw new Error('Quotation not found');

  const { quotation, items } = qData;
  const tierId = quotation.tier_id;

  // Fetch discount rules for this tier
  const rulesResult = await pool.query(
    'SELECT * FROM discount_rules WHERE tier_id = $1',
    [tierId]
  );
  const rules = rulesResult.rows;

  let riskScore = 0;
  let highestApproval = 'NONE';
  const violations = [];

  const levelPriority = {
    'NONE': 0,
    'MANAGER': 1,
    'MANAGER_AND_FINANCE': 2,
    'FINANCE': 2 // Assuming FINANCE and MANAGER_AND_FINANCE are similar top level
  };

  for (const item of items) {
    const rule = rules.find(r => r.category_id === item.category_id);
    if (!rule) continue;

    const requested = Number(item.discount_percent || 0);
    const allowed = Number(rule.max_discount || 0);

    if (requested > allowed) {
      const excess = requested - allowed;
      riskScore += excess * 5; // Arbitrary risk multiplier

      violations.push({
        product_name: item.product_name,
        requested_discount: requested,
        allowed_discount: allowed,
        excess_discount: excess,
        required_level: rule.approval_level
      });

      if (levelPriority[rule.approval_level] > levelPriority[highestApproval]) {
        highestApproval = rule.approval_level;
      }
    }
  }

  return {
    quotation_id: quotation.id,
    risk_score: riskScore,
    approval_required: highestApproval !== 'NONE',
    approval_level: highestApproval,
    violations
  };
};

const { createApprovalRequest } = require('./approvalService');

const submitQuotation = async (quotationId, userId) => {
  const evaluation = await evaluateQuotation(quotationId);
  
  if (evaluation.approval_required) {
    // Determine assignedTo logic if necessary, for now null to pick from pool
    await createApprovalRequest(
      quotationId,
      userId,
      null,
      evaluation.approval_level,
      `Discount limit exceeded. Risk score: ${evaluation.risk_score}`
    );

    await pool.query(
      "UPDATE quotations SET status = 'PENDING_APPROVAL', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [quotationId]
    );

    return { status: 'PENDING_APPROVAL', evaluation };
  } else {
    await pool.query(
      "UPDATE quotations SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [quotationId]
    );

    return { status: 'APPROVED', evaluation };
  }
};

const getAllQuotations = async () => {
  return await quotationModel.getAllQuotations();
};

module.exports = {
  createQuotation,
  getAllQuotations,
  evaluateQuotation,
  submitQuotation
};
