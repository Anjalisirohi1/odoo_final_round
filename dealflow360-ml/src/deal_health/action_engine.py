from typing import List, Dict, Any, Optional
from src.schemas.deal_health import (
    ActionType, ActionPriority, RecommendedAction,
    HealthClassification, MomentumLabel, DimensionScores, MomentumResult
)
from .context_builder import DealContext

PRIORITY_ORDER = {
    ActionPriority.CRITICAL: 0,
    ActionPriority.HIGH: 1,
    ActionPriority.MEDIUM: 2,
    ActionPriority.LOW: 3
}

class ActionEngine:
    """
    Transforms multi-dimensional health intelligence into prioritized,
    actionable next steps for sales and deal management teams.
    """
    
    def generate_actions(
        self,
        health_score: float,
        classification: HealthClassification,
        dimension_scores: DimensionScores,
        momentum: MomentumResult,
        risk_evidence: Dict[str, Any],
        financial_evidence: Dict[str, Any],
        engagement_evidence: Dict[str, Any],
        conversion_evidence: Dict[str, Any],
        context: DealContext
    ) -> List[RecommendedAction]:
        actions: List[RecommendedAction] = []
        emitted_types = set()

        def add_action(action_type: ActionType, priority: ActionPriority, reason: str, evidence: Dict[str, Any]):
            if action_type not in emitted_types:
                actions.append(RecommendedAction(
                    action_type=action_type,
                    priority=priority,
                    reason=reason,
                    evidence=evidence
                ))
                emitted_types.add(action_type)

        days_inactive = float(engagement_evidence.get("days_since_last_activity", 0.0))
        discount_pct = float(financial_evidence.get("discount_percentage", 0.0))
        margin_pct = float(financial_evidence.get("margin_percentage", 0.0))
        total_amount = float(financial_evidence.get("total_amount", 0.0))
        risk_level = str(risk_evidence.get("risk_level", "LOW"))
        is_anomaly = bool(risk_evidence.get("is_anomaly", False))
        
        # 1. Critical Escalation Trigger
        if classification == HealthClassification.CRITICAL or margin_pct < 10.0:
            add_action(
                action_type=ActionType.ESCALATE_TO_MANAGER,
                priority=ActionPriority.CRITICAL,
                reason="Deal health is in critical range or gross margin is dangerously compressed.",
                evidence={
                    "health_score": health_score,
                    "margin_percentage": margin_pct,
                    "classification": classification.value
                }
            )
        elif total_amount >= 5000.0 and classification == HealthClassification.AT_RISK and momentum.label in [MomentumLabel.DECLINING, MomentumLabel.STAGNANT]:
            add_action(
                action_type=ActionType.ESCALATE_TO_MANAGER,
                priority=ActionPriority.HIGH,
                reason="High-value deal is stalling with declining momentum.",
                evidence={
                    "total_amount": total_amount,
                    "classification": classification.value,
                    "momentum": momentum.label.value
                }
            )

        # 2. ML Anomaly / Risk Trigger
        if is_anomaly or risk_level in ["HIGH", "CRITICAL"]:
            add_action(
                action_type=ActionType.VERIFY_COMMERCIAL_TERMS,
                priority=ActionPriority.HIGH,
                reason="Commercial anomaly detected: quotation terms deviate significantly from historical baselines.",
                evidence={
                    "risk_level": risk_level,
                    "anomaly_score": risk_evidence.get("anomaly_score"),
                    "primary_reasons": risk_evidence.get("primary_reasons", [])
                }
            )

        # 3. Discount Review Trigger
        if discount_pct >= 25.0 or dimension_scores.financial_health < 0.45:
            add_action(
                action_type=ActionType.REVIEW_DISCOUNT,
                priority=ActionPriority.HIGH,
                reason=f"Significant discount concession ({discount_pct:.1f}%) is impairing deal profitability.",
                evidence={
                    "discount_percentage": discount_pct,
                    "financial_health_score": dimension_scores.financial_health,
                    "discount_to_margin_ratio": financial_evidence.get("discount_to_margin_ratio")
                }
            )

        # 4. Inactivity & Re-engagement Triggers
        if days_inactive >= 14.0 or dimension_scores.engagement < 0.35:
            add_action(
                action_type=ActionType.FOLLOW_UP_CUSTOMER,
                priority=ActionPriority.HIGH,
                reason=f"Deal has been inactive for {days_inactive:.0f} days; direct client follow-up required.",
                evidence={
                    "days_since_last_activity": days_inactive,
                    "engagement_score": dimension_scores.engagement
                }
            )
        elif momentum.label in [MomentumLabel.DECLINING, MomentumLabel.STAGNANT]:
            add_action(
                action_type=ActionType.REENGAGE_CUSTOMER,
                priority=ActionPriority.MEDIUM,
                reason="Deal velocity is losing momentum; schedule re-engagement or proposal review session.",
                evidence={
                    "momentum_label": momentum.label.value,
                    "days_since_last_activity": days_inactive
                }
            )

        # 5. Deal Prioritization Trigger
        if (
            dimension_scores.conversion_potential >= 0.65
            and momentum.label in [MomentumLabel.POSITIVE, MomentumLabel.STRONG_POSITIVE]
            and classification in [HealthClassification.HEALTHY, HealthClassification.EXCELLENT]
        ):
            add_action(
                action_type=ActionType.PRIORITIZE_DEAL,
                priority=ActionPriority.MEDIUM,
                reason="High conversion probability combined with strong momentum; expedite closing activities.",
                evidence={
                    "conversion_potential": dimension_scores.conversion_potential,
                    "momentum": momentum.label.value,
                    "health_score": health_score
                }
            )

        # 6. Default Monitoring Trigger
        if not actions or (len(actions) == 1 and actions[0].priority == ActionPriority.LOW):
            add_action(
                action_type=ActionType.MONITOR_ACTIVITY,
                priority=ActionPriority.LOW,
                reason="Deal is progressing normally; continue standard sales follow-up cadence.",
                evidence={
                    "health_score": health_score,
                    "classification": classification.value
                }
            )

        # Stable deterministic sort: Priority (CRITICAL -> HIGH -> MEDIUM -> LOW), then action_type name
        actions.sort(key=lambda a: (PRIORITY_ORDER.get(a.priority, 99), a.action_type.value))
        return actions
