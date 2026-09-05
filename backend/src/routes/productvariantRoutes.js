const express = require('express');

const router = express.Router();

const {
  getVariantsByProductId
} = require('../controllers/productvariantController');

const { protect } = require('../middleware/authMiddleware');

router.get('/:productId/variants', protect, getVariantsByProductId);

module.exports = router;