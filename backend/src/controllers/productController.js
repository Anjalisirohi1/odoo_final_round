const productService = require('../services/productService');

const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await productService.getCategories();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category_id, description, price, cost_price, margin_percentage, unit, tax_rate, is_active } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const newProduct = await productService.createProduct({
      name,
      category_id,
      description,
      price: parseFloat(price) || 0,
      cost_price: parseFloat(cost_price) || 0,
      margin_percentage: parseFloat(margin_percentage) || 0,
      unit: unit || 'UNIT',
      tax_rate: parseFloat(tax_rate) || 18,
      is_active: is_active !== undefined ? Boolean(is_active) : true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details'
    });
  }
};

const updateProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await productService.updateProduct(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Product details saved successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update product details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product details'
    });
  }
};

module.exports = {
  getProducts,
  getCategories,
  createProduct,
  getProductDetails,
  updateProductDetails
};