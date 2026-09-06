const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.get('/', optionalProtect, controller.getInvoices);
router.get('/:id', optionalProtect, controller.getInvoiceDetails);
router.post('/', optionalProtect, controller.createInvoice);
router.post('/:id/pay', optionalProtect, controller.markInvoicePaid);
router.post('/:id/reminder', optionalProtect, controller.sendReminder);

module.exports = router;
