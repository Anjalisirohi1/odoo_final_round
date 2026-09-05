const express = require('express');

const router = express.Router();

const {
  createQuotation,
  getQuotations,
  getQuotationById,
  evaluateQuotation,
  submitQuotation
} = require('../controllers/quotationController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  '/',
  protect,
  getQuotations
);

router.get(
  '/:id',
  protect,
  getQuotationById
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
