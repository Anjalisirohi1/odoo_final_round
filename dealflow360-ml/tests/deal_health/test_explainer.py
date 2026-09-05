import pytest
from src.schemas.deal_health import HealthClassification, MomentumLabel
from src.deal_health.explainer import DealHealthExplainer

def test_deal_health_explainer_deduplication():
    explainer = DealHealthExplainer()
    strengths, concerns = explainer.compile_explanation(
        health_score=75.0,
        classification=HealthClassification.HEALTHY,
        momentum_label=MomentumLabel.POSITIVE,
        all_strengths=["High conversion rate", "High conversion rate", "Good margin"],
        all_concerns=["Recent inactivity", "Recent inactivity"]
    )
    assert len(strengths) == 2
    assert len(concerns) == 1
    assert "High conversion rate" in strengths
    assert "Recent inactivity" in concerns

def test_deal_health_explainer_fallback_for_empty():
    explainer = DealHealthExplainer()
    strengths, concerns = explainer.compile_explanation(
        health_score=85.0,
        classification=HealthClassification.EXCELLENT,
        momentum_label=MomentumLabel.STRONG_POSITIVE,
        all_strengths=[],
        all_concerns=[]
    )
    assert len(strengths) > 0
    assert len(concerns) > 0
