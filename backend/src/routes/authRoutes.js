const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);

// Example of a protected route requiring specific roles
router.get(
  '/sales-dashboard',
  protect,
  authorize('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  (req, res) => {
    res.json({ message: 'Welcome to the Sales Dashboard' });
  }
);

router.get(
  '/quotation-portal',
  protect,
  authorize('CUSTOMER', 'ADMIN'),
  (req, res) => {
    res.json({ message: 'Welcome to the Customer Quotation Portal' });
  }
);

module.exports = router;
