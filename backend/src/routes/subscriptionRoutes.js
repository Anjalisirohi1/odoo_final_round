const express = require('express');
const router = express.Router();
const controller = require('../controllers/subscriptionController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.get('/', optionalProtect, controller.getSubscriptions);
router.get('/:id', optionalProtect, controller.getSubscriptionDetails);
router.post('/', optionalProtect, controller.createSubscription);
router.patch('/:id/status', optionalProtect, controller.updateSubscriptionStatus);

module.exports = router;
