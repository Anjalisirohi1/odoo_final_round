from typing import Dict, List, Any, Optional
from src.schemas.deal_intelligence import (
    UnifiedRecommendedAction, InsightImportance, ModuleName, SignalConflict
)
from src.core.config import settings

class ActionConsolidator:
    """
    Consolidates, deduplicates, prioritizes, and aligns recommended actions
    from Deal Health, Anomaly Risk, Prediction, and Recommendation intelligence.
    """

    def __init__(self, max_actions: Optional[int] = None):
        self.max_actions = max_actions or settings.INTELLIGENCE_MAX_ACTIONS

    def consolidate_actions(
        self,
        health_data: Optional[Dict[str, Any]] = None,
        anomaly_data: Optional[Dict[str, Any]] = None,
        prediction_data: Optional[Dict[str, Any]] = None,
        recommendation_data: Optional[Any] = None,
        conflicts: Optional[List[SignalConflict]] = None
    ) -> List[UnifiedRecommendedAction]:
        actions_map: Dict[str, UnifiedRecommendedAction] = {}

        # 1. Ingest Deal Health actions
        if health_data:
            raw_actions = health_data.get("recommended_actions", [])
            for a in raw_actions:
                a_type = str(getattr(a, "action_type", "") if not isinstance(a, dict) else a.get("action_type", ""))
                a_priority = str(getattr(a, "priority", "MEDIUM") if not isinstance(a, dict) else a.get("priority", "MEDIUM")).upper()
                reason = getattr(a, "reason", "") if not isinstance(a, dict) else a.get("reason", "")
                
                urgency = self._map_urgency(a_priority)
                action_key = a_type.upper()

                actions_map[action_key] = UnifiedRecommendedAction(
                    action=action_key,
                    urgency=urgency,
                    reason=reason or f"Action triggered by deal health assessment.",
                    supporting_signals=[ModuleName.DEAL_HEALTH.value],
                    expected_impact="Improves deal velocity and conversion momentum."
                )

        # 2. Ingest Anomaly Risk actions
        if anomaly_data:
            risk_level = str(anomaly_data.get("risk_level", "LOW")).upper()
            deviations = anomaly_data.get("deviations", [])
            
            if risk_level in ["HIGH", "CRITICAL"] or len(deviations) > 0:
                action_key = "REVIEW_DISCOUNT_AND_PRICING"
                urgency = InsightImportance.CRITICAL if risk_level == "CRITICAL" else InsightImportance.HIGH
                reason = f"Abnormal pricing or discount deviations flagged ({risk_level.lower()} risk)."

                if action_key in actions_map:
                    # Upgrade urgency and combine supporting signals
                    if urgency == InsightImportance.CRITICAL:
                        actions_map[action_key].urgency = InsightImportance.CRITICAL
                    if ModuleName.ANOMALY_DETECTION.value not in actions_map[action_key].supporting_signals:
                        actions_map[action_key].supporting_signals.append(ModuleName.ANOMALY_DETECTION.value)
                else:
                    actions_map[action_key] = UnifiedRecommendedAction(
                        action=action_key,
                        urgency=urgency,
                        reason=reason,
                        supporting_signals=[ModuleName.ANOMALY_DETECTION.value],
                        expected_impact="Mitigates margin leakage and commercial policy compliance risks."
                    )

        # 3. Ingest Prediction & Escalation signals
        if conflicts:
            for c in conflicts:
                if c.severity in [InsightImportance.CRITICAL, InsightImportance.HIGH]:
                    action_key = "ESCALATE_TO_SALES_LEADERSHIP"
                    urgency = c.severity
                    reason = f"Conflicting AI signals detected: {c.description}"
                    
                    if action_key in actions_map:
                        actions_map[action_key].urgency = InsightImportance.CRITICAL
                    else:
                        actions_map[action_key] = UnifiedRecommendedAction(
                            action=action_key,
                            urgency=urgency,
                            reason=reason,
                            supporting_signals=c.participating_modules,
                            expected_impact="Ensures executive alignment on high-risk strategic transactions."
                        )

        # 4. Ingest Recommendation actions
        recs = []
        if recommendation_data:
            if isinstance(recommendation_data, dict):
                recs = recommendation_data.get("recommendations", [])
            elif hasattr(recommendation_data, "recommendations"):
                recs = recommendation_data.recommendations
            elif isinstance(recommendation_data, list):
                recs = recommendation_data

        if recs:
            action_key = "PROPOSE_PRODUCT_EXPANSION"
            if action_key not in actions_map:
                top_pname = getattr(recs[0], "product_name", None) or (recs[0].get("product_name") if isinstance(recs[0], dict) else "related products")
                actions_map[action_key] = UnifiedRecommendedAction(
                    action=action_key,
                    urgency=InsightImportance.LOW,
                    reason=f"Cross-sell opportunity identified for {top_pname}.",
                    supporting_signals=[ModuleName.RECOMMENDATION.value],
                    expected_impact="Increases average order value and margin capture."
                )

        # 5. Sort actions by urgency
        urgency_weight = {
            InsightImportance.CRITICAL: 4,
            InsightImportance.HIGH: 3,
            InsightImportance.MEDIUM: 2,
            InsightImportance.LOW: 1
        }
        
        sorted_actions = sorted(
            actions_map.values(),
            key=lambda a: urgency_weight.get(a.urgency, 0),
            reverse=True
        )

        return sorted_actions[:self.max_actions]

    def _map_urgency(self, priority: str) -> InsightImportance:
        p = priority.upper()
        if "CRITICAL" in p:
            return InsightImportance.CRITICAL
        if "HIGH" in p:
            return InsightImportance.HIGH
        if "MEDIUM" in p:
            return InsightImportance.MEDIUM
        return InsightImportance.LOW
