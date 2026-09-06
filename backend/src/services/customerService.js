const customerModel = require('../models/customerModel');

const getAllCustomers = async () => {
  return await customerModel.getAllCustomers();
};

const getCustomerBillingDetails = async (customerId) => {
  return await customerModel.getCustomerBillingDetails(customerId);
};

const updateCustomerBillingDetails = async (customerId, data) => {
  return await customerModel.updateCustomerBillingDetails(customerId, data);
};

module.exports = {
  getAllCustomers,
  getCustomerBillingDetails,
  updateCustomerBillingDetails
};