import pytest
from src.deal_intelligence.intelligence_score import IntelligenceScoreCalculator
from src.schemas.deal_intelligence import IntelligenceClassification, SignalAgreement

def test_intelligence_score_strong_opportunity():
    calc = IntelligenceScoreCalculator()
    agr = [SignalAgreement(
        type="STRONG_POSITIVE_CONSENSUS",
        confidence="HIGH",
        description="All positive",
        participating_modules=["PREDICTION", "DEAL_HEALTH"]
    )]
    res = calc.calculate_score(
        conversion_probability=0.90,
        health_score=85.0,
        anomaly_score=0.05,
        agreements=agr
    )
    assert res["intelligence_score"] >= 80.0
    assert res["classification"] == IntelligenceClassification.STRONG_OPPORTUNITY
    assert 0.0 <= res["intelligence_score"] <= 100.0

def test_intelligence_score_critical_posture():
    calc = IntelligenceScoreCalculator()
    agr = [SignalAgreement(
        type="STRONG_NEGATIVE_CONSENSUS",
        confidence="HIGH",
        description="All negative",
        participating_modules=["PREDICTION", "DEAL_HEALTH", "ANOMALY_DETECTION"]
    )]
    res = calc.calculate_score(
        conversion_probability=0.10,
        health_score=15.0,
        anomaly_score=0.90,
        agreements=agr
    )
    assert res["intelligence_score"] <= 20.0
    assert res["classification"] == IntelligenceClassification.CRITICAL
    assert 0.0 <= res["intelligence_score"] <= 100.0

def test_intelligence_score_partial_module_degradation():
    calc = IntelligenceScoreCalculator()
    # Prediction model unavailable (conv_prob = None)
    res = calc.calculate_score(
        conversion_probability=None,
        health_score=75.0,
        anomaly_score=0.10
    )
    assert 0.0 <= res["intelligence_score"] <= 100.0
    assert res["classification"] in [IntelligenceClassification.POSITIVE, IntelligenceClassification.STRONG_OPPORTUNITY]

def test_intelligence_score_bounds():
    calc = IntelligenceScoreCalculator()
    # Extreme over-bounds test
    res_high = calc.calculate_score(conversion_probability=1.0, health_score=100.0, anomaly_score=0.0)
    assert res_high["intelligence_score"] <= 100.0

    res_low = calc.calculate_score(conversion_probability=0.0, health_score=0.0, anomaly_score=1.0)
    assert res_low["intelligence_score"] >= 0.0
