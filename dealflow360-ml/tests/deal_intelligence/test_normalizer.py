import pytest
from src.deal_intelligence.normalizer import SignalNormalizer, NormalizedSignal
from src.schemas.deal_intelligence import SignalDirection, InsightImportance

def test_signal_normalizer_scores():
    assert SignalNormalizer.normalize_score(50.0, 0.0, 100.0) == 0.5
    assert SignalNormalizer.normalize_score(150.0, 0.0, 100.0) == 1.0
    assert SignalNormalizer.normalize_score(-10.0, 0.0, 100.0) == 0.0
    assert SignalNormalizer.normalize_score(None) == 0.0

def test_normalize_health_and_priority():
    assert SignalNormalizer.normalize_health_score(75.5) == 0.755
    assert SignalNormalizer.normalize_health_score(0.0) == 0.0
    assert SignalNormalizer.normalize_priority_score(88.0) == 0.88

def test_map_risk_and_action_priority():
    assert SignalNormalizer.map_risk_level_to_importance("CRITICAL") == InsightImportance.CRITICAL
    assert SignalNormalizer.map_risk_level_to_importance("HIGH") == InsightImportance.HIGH
    assert SignalNormalizer.map_risk_level_to_importance("LOW") == InsightImportance.LOW
    assert SignalNormalizer.map_action_priority_to_importance("CRITICAL") == InsightImportance.CRITICAL
