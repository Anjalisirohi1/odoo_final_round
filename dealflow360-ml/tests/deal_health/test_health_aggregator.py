import pytest
from src.deal_health.health_aggregator import HealthAggregator

def test_health_aggregator_valid_weights():
    aggregator = HealthAggregator()
    res = aggregator.aggregate(
        conversion_potential=0.8,
        engagement=0.6,
        financial_health=0.7,
        momentum=0.8,
        risk_safety=0.9
    )
    # Expected: 0.8*0.25 + 0.6*0.20 + 0.7*0.20 + 0.8*0.15 + 0.9*0.20 = 0.20 + 0.12 + 0.14 + 0.12 + 0.18 = 0.76
    assert 0.0 <= res.health_score <= 100.0
    assert abs(res.health_score - 76.0) < 1e-2
    assert res.normalized_score == 0.76

def test_health_aggregator_invalid_weights():
    with pytest.raises(ValueError, match="Health weights must sum to 1.0"):
        HealthAggregator(weights={"w1": 0.5, "w2": 0.3})

def test_health_aggregator_clamping():
    aggregator = HealthAggregator()
    res_max = aggregator.aggregate(1.5, 1.2, 2.0, 1.1, 1.0)
    assert res_max.health_score == 100.0
    
    res_min = aggregator.aggregate(-0.5, -0.2, 0.0, 0.0, 0.0)
    assert res_min.health_score == 0.0
