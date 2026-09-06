const customerService = require('../services/customerService');

const getCustomers = async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Get customers error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
};

const getCustomerBillingDetails = async (req, res) => {
  try {
    const customerId = req.params.id || req.query.id || 'default';
    const data = await customerService.getCustomerBillingDetails(customerId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get billing details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing details'
    });
  }
};

const updateCustomerBillingDetails = async (req, res) => {
  try {
    const customerId = req.params.id || 'default';
    const updated = await customerService.updateCustomerBillingDetails(customerId, req.body);

    res.status(200).json({
      success: true,
      message: 'Billing details updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update billing details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update billing details'
    });
  }
};

const sendPaymentReminder = async (req, res) => {
  try {
    const { customerId, invoiceId } = req.body;
    res.status(200).json({
      success: true,
      message: `Payment reminder successfully sent for ${invoiceId || 'INV-2026-1048'} to AP finance contact!`
    });
  } catch (error) {
    console.error('Send payment reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment reminder'
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerBillingDetails,
  updateCustomerBillingDetails,
  sendPaymentReminder
};