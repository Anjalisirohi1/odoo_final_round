const model = require('../models/subscriptionModel');

async function getSubscriptions(filters) {
  const [subscriptions, metrics] = await Promise.all([
    model.getAllSubscriptions(filters),
    model.getSubscriptionMetrics()
  ]);

  return {
    subscriptions,
    metrics: {
      activeCount: Number(metrics.active_count || 0),
      pendingRenewals: Number(metrics.pending_renewals || 0),
      pastDueCount: Number(metrics.past_due_count || 0),
      totalMrr: Number(metrics.total_mrr || 0),
      totalCount: Number(metrics.total_count || 0)
    }
  };
}

async function getSubscriptionDetails(id) {
  return await model.getSubscriptionById(id);
}

async function createSubscription(data) {
  return await model.createSubscription(data);
}

async function updateSubscriptionStatus(id, status) {
  return await model.updateSubscriptionStatus(id, status);
}

module.exports = {
  getSubscriptions,
  getSubscriptionDetails,
  createSubscription,
  updateSubscriptionStatus
};
