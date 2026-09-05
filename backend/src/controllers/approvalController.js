const approvalService = require('../services/approvalService');

const actionApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!action || !['APPROVED', 'REJECTED', 'RETURNED'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await approvalService.handleApprovalAction(id, action, reason, userId);
    res.json({ message: 'Approval action recorded successfully', data: result });
  } catch (error) {
    console.error('Action approval error:', error);
    res.status(500).json({ message: error.message || 'Error processing approval action' });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const roleName = req.user.role; // from auth middleware
    const approvals = await approvalService.getPendingApprovals(roleName);
    res.json({ data: approvals });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Error fetching pending approvals' });
  }
};

module.exports = {
  actionApproval,
  getPendingApprovals
};
