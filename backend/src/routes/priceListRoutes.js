const express = require('express');

const router = express.Router();

const {
  getPriceLists,
  getPriceListItems
} = require('../controllers/priceListController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPriceLists);

router.get('/:priceListId/items', protect, getPriceListItems);

module.exports = router;