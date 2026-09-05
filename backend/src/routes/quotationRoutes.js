const express = require('express');

const router = express.Router();

const {
  createQuotation,
  getQuotations
} = require('../controllers/quotationController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  '/',
  protect,
  getQuotations
);

router.post(
  '/',
  protect,
  authorize('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  createQuotation
);

module.exports = router;
