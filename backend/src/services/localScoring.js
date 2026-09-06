/**
 * localScoring.js
 * 
 * Computes deal health scores locally using real deal data
 * when the ML API doesn't recognize the quotation.
 * 
 * Uses: discount %, margin %, deal age, approval status,
 *       deal events count, and inventory availability.
 */

/**
 * Score a deal using its context data.
 * Returns the same shape as the ML API responses.
 */
function scoreDealLocally(context) {
  if (!context) {
    return null;
  }

  const q = context.quotation || {};
  const items = context.quotation_items || [];
  const approvals = context.approval_history || [];
  const events = context.deal_events || [];
  const inventory = context.inventory || [];

  // ─── Financial Health (0-100) ─────────────────────────────────
  // Based on discount and margin
  const totalAmount = Number(q.total_amount || 0);
  const totalDiscount = Number(q.total_discount || 0);
  const discountPct = totalAmount > 0 ? (totalDiscount / totalAmount) * 100 : 0;

  // Avg margin across items
  const margins = items.map(i => Number(i.margin_percentage || 0)).filter(m => m > 0);
  const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 30;

  let financialHealth = 80;
  if (discountPct > 30) financialHealth -= 30;
  else if (discountPct > 20) financialHealth -= 20;
  else if (discountPct > 10) financialHealth -= 10;

  if (avgMargin < 10) financialHealth -= 20;
  else if (avgMargin < 20) financialHealth -= 10;
  else if (avgMargin > 40) financialHealth += 10;

  financialHealth = Math.max(10, Math.min(100, financialHealth));

  // ─── Deal Momentum (0-100) ────────────────────────────────────
  // Based on deal age and event frequency
  const daysOpen = Number(q.days_open || 0);
  let dealMomentum = 70;
  if (daysOpen > 30) dealMomentum -= 25;
  else if (daysOpen > 14) dealMomentum -= 15;
  else if (daysOpen > 7) dealMomentum -= 5;
  else dealMomentum += 10;

  // Events boost momentum
  if (events.length > 5) dealMomentum += 15;
  else if (events.length > 2) dealMomentum += 10;
  else if (events.length === 0) dealMomentum -= 10;

  dealMomentum = Math.max(10, Math.min(100, dealMomentum));

  // ─── Engagement Health (0-100) ────────────────────────────────
  // Based on event types
  const hasCustomerView = events.some(e => e.event_type === 'CUSTOMER_VIEWED');
  const hasCounterOffer = events.some(e => e.event_type === 'COUNTER_OFFER');
  const hasSent = events.some(e => e.event_type === 'QUOTE_SENT');

  let engagementHealth = 40;
  if (hasSent) engagementHealth += 20;
  if (hasCustomerView) engagementHealth += 20;
  if (hasCounterOffer) engagementHealth += 15;
  if (events.length > 3) engagementHealth += 10;

  engagementHealth = Math.max(10, Math.min(100, engagementHealth));

  // ─── Risk Safety Index (0-100) ────────────────────────────────
  // Based on approval trail and inventory
  let riskSafety = 60;
  const hasRejection = approvals.some(a => a.action === 'REJECTED');
  const hasApproval = approvals.some(a => a.action === 'APPROVED');
  if (hasRejection) riskSafety -= 25;
  if (hasApproval) riskSafety += 15;

  // Inventory check
  const lowStockItems = inventory.filter(i => Number(i.available_quantity || 0) < 10);
  if (lowStockItems.length > 0) riskSafety -= 15;

  riskSafety = Math.max(10, Math.min(100, riskSafety));

  // ─── Conversion Potential (0-100) ─────────────────────────────
  const customerTier = (context.customer?.customer_tier || '').toUpperCase();
  let conversionPotential = 50;
  if (customerTier === 'GOLD' || customerTier === 'PLATINUM') conversionPotential += 20;
  else if (customerTier === 'SILVER') conversionPotential += 10;
  if (totalAmount > 100000) conversionPotential += 10;
  if (discountPct > 20) conversionPotential -= 10;
  if (hasApproval) conversionPotential += 10;

  conversionPotential = Math.max(10, Math.min(100, conversionPotential));

  // ─── Overall Health Score ─────────────────────────────────────
  const healthScore = Math.round(
    financialHealth * 0.30 +
    dealMomentum * 0.20 +
    engagementHealth * 0.20 +
    riskSafety * 0.15 +
    conversionPotential * 0.15
  );

  // ─── Classification ───────────────────────────────────────────
  let classification;
  if (healthScore >= 80) classification = 'EXCELLENT';
  else if (healthScore >= 65) classification = 'HEALTHY';
  else if (healthScore >= 45) classification = 'AT_RISK';
  else classification = 'CRITICAL';

  // ─── Anomaly Detection ────────────────────────────────────────
  const concerns = [];
  let anomalyScore = 0;

  if (discountPct > 25) {
    concerns.push({ type: 'HIGH_DISCOUNT', description: `Excessive discount of ${discountPct.toFixed(1)}% applied` });
    anomalyScore += 30;
  }
  if (avgMargin < 15 && margins.length > 0) {
    concerns.push({ type: 'LOW_MARGIN', description: `Average margin is only ${avgMargin.toFixed(1)}%` });
    anomalyScore += 25;
  }
  if (daysOpen > 21) {
    concerns.push({ type: 'STALE_DEAL', description: `Deal has been open for ${daysOpen} days without progress` });
    anomalyScore += 20;
  }
  if (hasRejection) {
    concerns.push({ type: 'REJECTED_APPROVAL', description: 'Previous approval request was rejected' });
    anomalyScore += 20;
  }
  if (lowStockItems.length > 0) {
    concerns.push({ type: 'LOW_INVENTORY', description: `${lowStockItems.length} product(s) have low stock` });
    anomalyScore += 15;
  }

  anomalyScore = Math.min(100, anomalyScore);
  let anomalyRisk = 'LOW';
  if (anomalyScore >= 70) anomalyRisk = 'CRITICAL';
  else if (anomalyScore >= 50) anomalyRisk = 'HIGH';
  else if (anomalyScore >= 30) anomalyRisk = 'MEDIUM';

  // ─── Win Probability ──────────────────────────────────────────
  const winProbability = Math.max(0.05, Math.min(0.95, healthScore / 100));

  // ─── Recommended Actions ──────────────────────────────────────
  const recommendedActions = [];
  if (discountPct > 20) recommendedActions.push({ action_type: 'RESTRUCTURE_DISCOUNT', reasoning: 'Review discount structure — consider volume-based pricing instead' });
  if (daysOpen > 14) recommendedActions.push({ action_type: 'CUSTOMER_FOLLOWUP', reasoning: 'Follow up with customer to maintain deal momentum' });
  if (avgMargin < 20 && margins.length > 0) recommendedActions.push({ action_type: 'UPSELL', reasoning: 'Explore upsell opportunities to improve margins' });
  if (!hasSent) recommendedActions.push({ action_type: 'SEND_QUOTE', reasoning: 'Send quotation to customer to initiate engagement' });
  if (events.length < 2) recommendedActions.push({ action_type: 'INCREASE_TOUCHPOINTS', reasoning: 'Increase customer touchpoints to improve engagement score' });
  if (recommendedActions.length === 0) recommendedActions.push({ action_type: 'MONITOR', reasoning: 'Continue monitoring — deal metrics are within normal range' });

  // ─── Return ML-compatible format ──────────────────────────────
  return {
    health: {
      health_score: healthScore,
      classification,
      dimension_scores: {
        conversion_potential: conversionPotential / 100,
        engagement: engagementHealth / 100,
        financial_health: financialHealth / 100,
        momentum: dealMomentum / 100,
        risk_safety: riskSafety / 100
      },
      concerns,
      recommended_actions: recommendedActions
    },
    prediction: {
      win_probability: winProbability,
      expected_revenue: totalAmount * winProbability,
      confidence: 0.6
    },
    anomaly: {
      is_anomaly: anomalyScore > 0,
      anomaly_score: anomalyScore / 100,
      risk_level: anomalyRisk,
      primary_reasons: concerns.map(c => c.description)
    },
    intelligence: {
      summary: `Local analysis: ${classification} deal (score: ${healthScore}/100)`,
      deal_health: {
        dimension_scores: {
          financial_health: financialHealth,
          momentum: dealMomentum,
          engagement: engagementHealth,
          risk_safety: riskSafety,
          conversion_potential: conversionPotential
        }
      },
      recommendations: recommendedActions
    }
  };
}

module.exports = { scoreDealLocally };
