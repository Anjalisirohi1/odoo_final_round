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

const getAllQuotations = async () => {
  return await quotationModel.getAllQuotations();
};

module.exports = {
  createQuotation,
  getAllQuotations
};
