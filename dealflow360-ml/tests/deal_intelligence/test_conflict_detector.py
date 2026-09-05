import pytest
from src.deal_intelligence.conflict_detector import ConflictDetector
from src.schemas.deal_intelligence import InsightImportance

def test_conflict_health_prediction_mismatch():
    detector = ConflictDetector()
    prediction_data = {"conversion_probability": 0.85, "predicted_outcome": "LIKELY_TO_CONVERT"}
    health_data = {"health_score": 32.0, "classification": "AT_RISK"}
    
    conflicts = detector.detect_conflicts(
        prediction_data=prediction_data,
        health_data=health_data
    )
    assert len(conflicts) >= 1
    types = [c.type for c in conflicts]
    assert "HEALTH_PREDICTION_MISMATCH" in types
    
    mismatch = next(c for c in conflicts if c.type == "HEALTH_PREDICTION_MISMATCH")
    assert mismatch.severity == InsightImportance.HIGH
    assert "PREDICTION" in mismatch.participating_modules
    assert "DEAL_HEALTH" in mismatch.participating_modules

def test_conflict_high_value_critical_risk():
    detector = ConflictDetector(high_value_threshold=100000.0)
    prediction_data = {"revenue_forecast": {"expected_revenue": 300000.0}}
    anomaly_data = {"risk_level": "CRITICAL", "anomaly_score": 0.88}
    
    conflicts = detector.detect_conflicts(
        prediction_data=prediction_data,
        anomaly_data=anomaly_data
    )
    assert len(conflicts) >= 1
    types = [c.type for c in conflicts]
    assert "HIGH_VALUE_CRITICAL_RISK" in types
    
    crit = next(c for c in conflicts if c.type == "HIGH_VALUE_CRITICAL_RISK")
    assert crit.severity == InsightImportance.CRITICAL

def test_conflict_healthy_deal_low_conversion():
    detector = ConflictDetector()
    prediction_data = {"conversion_probability": 0.25, "predicted_outcome": "LIKELY_TO_LOSE"}
    health_data = {"health_score": 82.0, "classification": "EXCELLENT"}
    
    conflicts = detector.detect_conflicts(
        prediction_data=prediction_data,
        health_data=health_data
    )
    types = [c.type for c in conflicts]
    assert "HEALTH_CONVERSION_MISMATCH" in types

def test_no_conflicts_aligned_scenario():
    detector = ConflictDetector()
    prediction_data = {"conversion_probability": 0.80, "predicted_outcome": "LIKELY_TO_CONVERT"}
    health_data = {"health_score": 80.0, "classification": "EXCELLENT", "momentum": {"label": "POSITIVE"}}
    anomaly_data = {"risk_level": "LOW", "anomaly_score": 0.10}
    
    conflicts = detector.detect_conflicts(
        prediction_data=prediction_data,
        health_data=health_data,
        anomaly_data=anomaly_data
    )
    assert len(conflicts) == 0
