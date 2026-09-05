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

module.exports = {
  getCustomers
};