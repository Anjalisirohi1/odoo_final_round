const express = require('express');

const router = express.Router();

const { getCustomers } = require('../controllers/customerController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCustomers);

module.exports = router;