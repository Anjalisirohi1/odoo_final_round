const express = require('express');

const router = express.Router();

const {
  createQuotation,
  getQuotations,
  getQuotationById,
  evaluateQuotation,
  submitQuotation,
  confirmQuotation,
  sendQuotation
} = require('../controllers/quotationController');

const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');

router.get(
  '/',
  optionalProtect,
  getQuotations
);

router.get(
  '/:id',
  optionalProtect,
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
  optionalProtect,
  evaluateQuotation
);

router.post(
  '/:id/submit',
  optionalProtect,
  submitQuotation
);

router.post(
  '/:id/confirm',
  optionalProtect,
  confirmQuotation
);

router.post(
  '/:id/send',
  optionalProtect,
  sendQuotation
);

module.exports = router;
