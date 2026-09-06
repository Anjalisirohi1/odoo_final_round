const service = require('../services/invoiceService');
const detailService = require('../services/invoiceDetailService');

async function getInvoices(req, res) {
  try {
    const data = await service.getInvoices(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch invoices'
    });
  }
}

async function getInvoiceDetails(req, res) {
  try {
    const data = await detailService.getInvoiceDetailsWithItems(req.params.id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get invoice details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch invoice details'
    });
  }
}

async function createInvoice(req, res) {
  try {
    const data = await service.createInvoice(req.body);
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create invoice'
    });
  }
}

async function markInvoicePaid(req, res) {
  try {
    const { paymentMethod } = req.body;
    const data = await service.markInvoicePaid(req.params.id, paymentMethod);
    res.status(200).json({
      success: true,
      message: 'Invoice marked as paid',
      data
    });
  } catch (error) {
    console.error('Mark invoice paid error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark invoice paid'
    });
  }
}

async function sendReminder(req, res) {
  try {
    const data = await detailService.sendReminder(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Reminder sent',
      data
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send reminder'
    });
  }
}

module.exports = {
  getInvoices,
  getInvoiceDetails,
  createInvoice,
  markInvoicePaid,
  sendReminder
};
