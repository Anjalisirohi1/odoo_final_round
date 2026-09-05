import pytest
from src.deal_intelligence.action_consolidator import ActionConsolidator
from src.schemas.deal_intelligence import InsightImportance, SignalConflict, ModuleName

def test_action_consolidator_deduplication_and_ranking():
    consolidator = ActionConsolidator(max_actions=5)
    
    health_data = {
        "recommended_actions": [
            {"action_type": "FOLLOW_UP_CUSTOMER", "priority": "MEDIUM", "reason": "Low recent engagement"},
            {"action_type": "REVIEW_DISCOUNT", "priority": "HIGH", "reason": "Margin pressure"}
        ]
    }
    anomaly_data = {
        "risk_level": "CRITICAL",
        "deviations": [{"feature": "discount_percentage", "severity": "CRITICAL"}]
    }
    conflicts = [
        SignalConflict(
            type="HIGH_VALUE_CRITICAL_RISK",
            severity=InsightImportance.CRITICAL,
            description="High value deal with critical risk",
            participating_modules=[ModuleName.ANOMALY_DETECTION.value, ModuleName.PREDICTION.value]
        )
    ]

    actions = consolidator.consolidate_actions(
        health_data=health_data,
        anomaly_data=anomaly_data,
        conflicts=conflicts
    )

    assert len(actions) <= 5
    # Critical action must be top ranked
    assert actions[0].urgency == InsightImportance.CRITICAL
    
    action_names = [a.action for a in actions]
    assert "ESCALATE_TO_SALES_LEADERSHIP" in action_names
    assert "REVIEW_DISCOUNT_AND_PRICING" in action_names

def test_action_consolidator_recommendations():
    consolidator = ActionConsolidator()
    recs = {
        "recommendations": [
            {"product_name": "Pro Maintenance SLA", "score": 0.85}
        ]
    }
    actions = consolidator.consolidate_actions(recommendation_data=recs)
    assert len(actions) == 1
    assert actions[0].action == "PROPOSE_PRODUCT_EXPANSION"
    assert "Pro Maintenance SLA" in actions[0].reason
