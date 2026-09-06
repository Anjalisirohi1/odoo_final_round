const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getCategories, 
  createProduct, 
  getProductDetails, 
  updateProductDetails 
} = require('../controllers/productController');

// Endpoints for product catalog
router.get('/categories', getCategories);
router.get('/', getProducts);
router.post('/', createProduct);

router.get('/:id', getProductDetails);
router.put('/:id', updateProductDetails);
router.post('/:id/save', updateProductDetails);

module.exports = router;