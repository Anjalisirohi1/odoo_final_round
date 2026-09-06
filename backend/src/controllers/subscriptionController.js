const service = require('../services/subscriptionService');

async function getSubscriptions(req, res) {
  try {
    const data = await service.getSubscriptions(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch subscriptions'
    });
  }
}

async function getSubscriptionDetails(req, res) {
  try {
    const data = await service.getSubscriptionDetails(req.params.id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get subscription details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch subscription details'
    });
  }
}

async function createSubscription(req, res) {
  try {
    const data = await service.createSubscription(req.body);
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create subscription'
    });
  }
}

async function updateSubscriptionStatus(req, res) {
  try {
    const { status } = req.body;
    const data = await service.updateSubscriptionStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: 'Subscription status updated',
      data
    });
  } catch (error) {
    console.error('Update subscription status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update subscription status'
    });
  }
}

module.exports = {
  getSubscriptions,
  getSubscriptionDetails,
  createSubscription,
  updateSubscriptionStatus
};
