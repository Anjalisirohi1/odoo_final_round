const productModel = require('../models/productModel');

const getAllProducts = async () => {
  return await productModel.getAllProducts();
};

const getCategories = async () => {
  return await productModel.getCategories();
};

const createProduct = async (data) => {
  return await productModel.createProduct(data);
};

const getProductById = async (id) => {
  return await productModel.getProductById(id);
};

const updateProduct = async (id, data) => {
  return await productModel.updateProduct(id, data);
};

module.exports = {
  getAllProducts,
  getCategories,
  createProduct,
  getProductById,
  updateProduct
};