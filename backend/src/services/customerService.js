const customerModel = require('../models/customerModel');

const getAllCustomers = async () => {
  return await customerModel.getAllCustomers();
};

module.exports = {
  getAllCustomers
};