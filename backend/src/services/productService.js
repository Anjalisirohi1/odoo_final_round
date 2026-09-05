const productModel = require('../models/productModel');

const getAllProducts = async () => {
  return await productModel.getAllProducts();
};

module.exports = {
  getAllProducts
};