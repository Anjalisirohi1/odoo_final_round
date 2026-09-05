const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/pending', protect, approvalController.getPendingApprovals);
router.post('/:id/action', protect, approvalController.actionApproval);

module.exports = router;
