const express = require('express');

const router = express.Router();

const {
  createQuotation,
  getQuotations,
  evaluateQuotation,
  submitQuotation
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

router.post(
  '/:id/evaluate',
  protect,
  evaluateQuotation
);

router.post(
  '/:id/submit',
  protect,
  submitQuotation
);

module.exports = router;
