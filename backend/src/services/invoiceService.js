const model = require('../models/invoiceModel');

async function getInvoices(filters) {
  const [invoices, metrics] = await Promise.all([
    model.getAllInvoices(filters),
    model.getInvoiceMetrics()
  ]);

  return {
    invoices,
    metrics: {
      totalOutstanding: Number(metrics.total_outstanding || 0),
      totalCollected: Number(metrics.total_collected || 0),
      paidCount: Number(metrics.paid_count || 0),
      unpaidCount: Number(metrics.unpaid_count || 0),
      overdueCount: Number(metrics.overdue_count || 0),
      totalCount: Number(metrics.total_count || 0)
    }
  };
}

async function getInvoiceDetails(id) {
  return await model.getInvoiceById(id);
}

async function createInvoice(data) {
  return await model.createInvoice(data);
}

async function markInvoicePaid(id, paymentMethod) {
  return await model.markInvoicePaid(id, paymentMethod);
}

module.exports = {
  getInvoices,
  getInvoiceDetails,
  createInvoice,
  markInvoicePaid
};
