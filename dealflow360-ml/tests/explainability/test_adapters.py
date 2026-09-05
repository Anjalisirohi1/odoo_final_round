import pytest
from src.explainability.adapters.anomaly_adapter import AnomalyExplanationAdapter
from src.explainability.adapters.deal_health_adapter import DealHealthExplanationAdapter
from src.explainability.adapters.recommendation_adapter import RecommendationExplanationAdapter

def test_anomaly_explanation_adapter():
    adapter = AnomalyExplanationAdapter()
    anomaly_result = {
        "anomaly_score": 0.65,
        "risk_level": "HIGH",
        "deviations": [{"feature": "discount_percentage", "description": "Discount exceeds customer average"}],
        "explanation": {
            "summary": "Quotation exhibits unusual discount deviation.",
            "primary_reasons": ["Discount exceeds customer average by 15%."]
        }
    }
    summary = adapter.adapt_module_summary(anomaly_result)
    assert summary.module_name == "Anomaly Detection"
    assert summary.method == "DEVIATION_ANALYSIS"
    assert len(summary.key_drivers) > 0

def test_deal_health_explanation_adapter():
    adapter = DealHealthExplanationAdapter()
    health_result = {
        "health_score": 75.0,
        "classification": "HEALTHY",
        "strengths": ["Strong engagement recency", "Healthy commercial margin"],
        "concerns": ["Discount-to-margin balance elevated"]
    }
    summary = adapter.adapt_module_summary(health_result)
    assert summary.module_name == "Deal Health Intelligence"
    assert summary.method == "HYBRID_DECISION_SCORING"
    assert len(summary.key_drivers) > 0

def test_recommendation_explanation_adapter():
    adapter = RecommendationExplanationAdapter()
    rec_result = {
        "recommendations": [
            {
                "product_id": "prod_1",
                "product_name": "Premium License",
                "reason": "Frequently purchased together",
                "confidence": "HIGH"
            }
        ]
    }
    summary = adapter.adapt_module_summary(rec_result)
    assert summary.module_name == "Product Recommendations"
    assert "Premium License" in summary.summary
