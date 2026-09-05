import pytest
from src.deal_intelligence.adapters import (
    AnomalyAdapter, DealHealthAdapter, PredictionAdapter, RecommendationAdapter
)
from src.schemas.deal_intelligence import SignalDirection, InsightImportance, ModuleName

def test_anomaly_adapter():
    raw_anomaly = {
        "is_anomaly": True,
        "anomaly_score": 0.82,
        "risk_level": "HIGH",
        "summary": "High risk quotation detected with heavy discount.",
        "deviations": [
            {"feature": "discount_percentage", "severity": "HIGH", "description": "Discount is 45% above peer median."}
        ]
    }
    signals = AnomalyAdapter.adapt(raw_anomaly)
    assert len(signals) == 2
    
    main_sig = signals[0]
    assert main_sig.source == ModuleName.ANOMALY_DETECTION.value
    assert main_sig.direction == SignalDirection.NEGATIVE
    assert main_sig.severity == InsightImportance.HIGH
    assert main_sig.raw_score == 0.82

    dev_sig = signals[1]
    assert dev_sig.category == "RISK"
    assert dev_sig.signal_type == "FEATURE_DEVIATION"

def test_deal_health_adapter():
    raw_health = {
        "health_score": 78.5,
        "classification": "HEALTHY",
        "momentum": {"label": "POSITIVE", "score": 0.80},
        "strengths": ["High conversion affinity"],
        "concerns": ["Slight response latency"]
    }
    signals = DealHealthAdapter.adapt(raw_health)
    assert len(signals) >= 3
    
    health_sig = signals[0]
    assert health_sig.source == ModuleName.DEAL_HEALTH.value
    assert health_sig.direction == SignalDirection.POSITIVE
    assert health_sig.raw_score == 78.5

def test_prediction_adapter():
    raw_prediction = {
        "conversion_probability": 0.85,
        "predicted_outcome": "LIKELY_TO_CONVERT",
        "revenue_forecast": {"quotation_value": 150000.0, "expected_revenue": 127500.0},
        "priority": {"score": 82.0, "classification": "HIGH_PRIORITY"},
        "top_positive_factors": [{"feature": "historical_win_rate", "description": "Client closes 90% of deals"}],
        "top_negative_factors": []
    }
    signals = PredictionAdapter.adapt(raw_prediction)
    assert len(signals) >= 4
    
    pred_sig = signals[0]
    assert pred_sig.source == ModuleName.PREDICTION.value
    assert pred_sig.direction == SignalDirection.POSITIVE
    assert pred_sig.raw_score == 0.85

def test_recommendation_adapter():
    raw_recs = {
        "recommendations": [
            {"product_id": "P-101", "product_name": "Premium Warranty", "score": 0.72, "expected_margin": 0.40, "reason": "Often bought with hardware"}
        ]
    }
    signals = RecommendationAdapter.adapt(raw_recs)
    assert len(signals) == 1
    assert signals[0].source == ModuleName.RECOMMENDATION.value
    assert signals[0].direction == SignalDirection.POSITIVE
    assert signals[0].title == "Cross-sell: Premium Warranty"

def test_empty_adapters():
    assert AnomalyAdapter.adapt(None) == []
    assert DealHealthAdapter.adapt(None) == []
    assert PredictionAdapter.adapt(None) == []
    assert RecommendationAdapter.adapt(None) == []
