const express = require('express');

const router = express.Router();

const {
  getDiscountRules,
  checkDiscountRule
} = require('../controllers/discountRuleController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDiscountRules);

router.get('/check', protect, checkDiscountRule);

module.exports = router;
