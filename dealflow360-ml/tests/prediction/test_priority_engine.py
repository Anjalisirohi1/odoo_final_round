import pytest
from src.schemas.prediction import PriorityClassification
from src.prediction.priority_engine import PriorityEngine

def test_priority_engine_high_priority():
    engine = PriorityEngine(reference_deal_value=10000.0)
    
    # High conversion, high value, healthy, positive momentum, low risk
    res = engine.calculate_priority(
        conversion_probability=0.85,
        quotation_value=10000.0,
        health_score=85.0,
        momentum_score=0.90,
        anomaly_score=0.05
    )
    assert res.score >= 70.0
    assert res.classification in [PriorityClassification.CRITICAL_ATTENTION, PriorityClassification.HIGH_PRIORITY]
    assert "conversion_contribution" in res.components
    assert "revenue_contribution" in res.components

def test_priority_engine_low_priority():
    engine = PriorityEngine(reference_deal_value=10000.0)
    
    # Low conversion, low value, poor health, stagnant, high risk
    res = engine.calculate_priority(
        conversion_probability=0.10,
        quotation_value=500.0,
        health_score=20.0,
        momentum_score=0.15,
        anomaly_score=0.80
    )
    assert res.score < 40.0
    assert res.classification == PriorityClassification.LOW_PRIORITY
