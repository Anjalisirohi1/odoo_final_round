import pytest
from src.schemas.deal_health import (
    ActionType, ActionPriority, HealthClassification,
    MomentumLabel, DimensionScores, MomentumResult
)
from src.deal_health.context_builder import DealContext
from src.deal_health.action_engine import ActionEngine

def test_action_engine_critical_escalation():
    engine = ActionEngine()
    context = DealContext(quotation_id="q1", quotation={"quotation_id": "q1", "total_amount": 12000.0})
    dim_scores = DimensionScores(
        conversion_potential=0.5,
        engagement=0.2,
        financial_health=0.2,
        momentum=0.2,
        risk_safety=0.3
    )
    momentum = MomentumResult(label=MomentumLabel.DECLINING, score=0.4, evidence={})
    
    actions = engine.generate_actions(
        health_score=28.0,
        classification=HealthClassification.CRITICAL,
        dimension_scores=dim_scores,
        momentum=momentum,
        risk_evidence={"risk_level": "CRITICAL", "is_anomaly": True},
        financial_evidence={"discount_percentage": 35.0, "margin_percentage": 5.0, "total_amount": 12000.0},
        engagement_evidence={"days_since_last_activity": 22.0},
        conversion_evidence={},
        context=context
    )
    
    action_types = [a.action_type for a in actions]
    assert ActionType.ESCALATE_TO_MANAGER in action_types
    assert ActionType.VERIFY_COMMERCIAL_TERMS in action_types
    assert ActionType.REVIEW_DISCOUNT in action_types
    assert ActionType.FOLLOW_UP_CUSTOMER in action_types
    assert actions[0].priority == ActionPriority.CRITICAL

def test_action_engine_prioritize_deal():
    engine = ActionEngine()
    context = DealContext(quotation_id="q1", quotation={"quotation_id": "q1", "total_amount": 5000.0})
    dim_scores = DimensionScores(
        conversion_potential=0.85,
        engagement=0.80,
        financial_health=0.85,
        momentum=0.90,
        risk_safety=0.95
    )
    momentum = MomentumResult(label=MomentumLabel.STRONG_POSITIVE, score=0.95, evidence={})
    
    actions = engine.generate_actions(
        health_score=88.0,
        classification=HealthClassification.EXCELLENT,
        dimension_scores=dim_scores,
        momentum=momentum,
        risk_evidence={"risk_level": "LOW", "is_anomaly": False},
        financial_evidence={"discount_percentage": 5.0, "margin_percentage": 35.0, "total_amount": 5000.0},
        engagement_evidence={"days_since_last_activity": 1.0},
        conversion_evidence={},
        context=context
    )
    
    action_types = [a.action_type for a in actions]
    assert ActionType.PRIORITIZE_DEAL in action_types
