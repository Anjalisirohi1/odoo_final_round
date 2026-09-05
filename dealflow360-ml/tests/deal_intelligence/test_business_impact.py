import pytest
from src.deal_intelligence.business_impact import BusinessImpactEngine
from src.schemas.deal_intelligence import BusinessImpactLevel

def test_critical_business_impact_high_value_high_risk():
    engine = BusinessImpactEngine(critical_revenue=250000.0, high_revenue=100000.0)
    level, reason = engine.evaluate_impact(
        quotation_value=300000.0,
        expected_revenue=260000.0,
        risk_level="CRITICAL"
    )
    assert level == BusinessImpactLevel.CRITICAL
    assert "Major revenue exposure" in reason

def test_high_business_impact():
    engine = BusinessImpactEngine(critical_revenue=250000.0, high_revenue=100000.0)
    level, reason = engine.evaluate_impact(
        quotation_value=120000.0,
        expected_revenue=110000.0,
        risk_level="LOW"
    )
    assert level == BusinessImpactLevel.HIGH

def test_medium_business_impact():
    engine = BusinessImpactEngine(medium_revenue=25000.0)
    level, reason = engine.evaluate_impact(
        quotation_value=40000.0,
        expected_revenue=35000.0,
        risk_level="LOW"
    )
    assert level == BusinessImpactLevel.MEDIUM

def test_low_business_impact():
    engine = BusinessImpactEngine(medium_revenue=25000.0)
    level, reason = engine.evaluate_impact(
        quotation_value=8000.0,
        expected_revenue=5000.0,
        risk_level="LOW"
    )
    assert level == BusinessImpactLevel.LOW
