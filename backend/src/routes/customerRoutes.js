const express = require('express');
const router = express.Router();
const { 
  getCustomers, 
  getCustomerBillingDetails, 
  updateCustomerBillingDetails,
  sendPaymentReminder 
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCustomers);
router.get('/billing-details', protect, getCustomerBillingDetails);
router.get('/:id/billing', protect, getCustomerBillingDetails);
router.put('/:id/billing', protect, updateCustomerBillingDetails);
router.post('/send-reminder', protect, sendPaymentReminder);

module.exports = router;