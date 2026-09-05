const productVariantModel = require('../models/productvariantModel');

const getVariantsByProductId = async (productId) => {
  return await productVariantModel.getVariantsByProductId(productId);
};

module.exports = {
  getVariantsByProductId
};