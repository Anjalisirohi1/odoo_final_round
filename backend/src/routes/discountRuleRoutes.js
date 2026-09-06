const express = require('express');
const router = express.Router();

const {
  getDiscountRules,
  checkDiscountRule,
  getGovernanceMatrix,
  saveGovernanceMatrix
} = require('../controllers/discountRuleController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDiscountRules);
router.get('/check', protect, checkDiscountRule);
router.get('/governance', protect, getGovernanceMatrix);
router.post('/governance/save', protect, saveGovernanceMatrix);

module.exports = router;
