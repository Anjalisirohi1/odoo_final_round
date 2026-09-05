import pytest
from src.deal_intelligence.agreement_detector import AgreementDetector
from src.schemas.deal_intelligence import ModuleName

def test_strong_positive_consensus():
    detector = AgreementDetector()
    prediction_data = {"conversion_probability": 0.85}
    health_data = {"health_score": 85.0, "classification": "EXCELLENT"}
    anomaly_data = {"risk_level": "LOW", "anomaly_score": 0.12}

    agreements = detector.detect_agreements(
        prediction_data=prediction_data,
        health_data=health_data,
        anomaly_data=anomaly_data
    )
    assert len(agreements) == 1
    assert agreements[0].type == "STRONG_POSITIVE_CONSENSUS"
    assert agreements[0].confidence == "HIGH"
    assert set(agreements[0].participating_modules) == {
        ModuleName.PREDICTION.value,
        ModuleName.DEAL_HEALTH.value,
        ModuleName.ANOMALY_DETECTION.value
    }

def test_strong_negative_consensus():
    detector = AgreementDetector()
    prediction_data = {"conversion_probability": 0.20}
    health_data = {"health_score": 25.0, "classification": "CRITICAL"}
    anomaly_data = {"risk_level": "HIGH", "anomaly_score": 0.72}

    agreements = detector.detect_agreements(
        prediction_data=prediction_data,
        health_data=health_data,
        anomaly_data=anomaly_data
    )
    assert len(agreements) == 1
    assert agreements[0].type == "STRONG_NEGATIVE_CONSENSUS"
    assert agreements[0].confidence == "HIGH"

def test_moderate_alignment():
    detector = AgreementDetector()
    prediction_data = {"conversion_probability": 0.80}
    health_data = {"health_score": 75.0, "classification": "HEALTHY"}
    # Anomaly unavailable or medium
    anomaly_data = {"risk_level": "MEDIUM", "anomaly_score": 0.40}

    agreements = detector.detect_agreements(
        prediction_data=prediction_data,
        health_data=health_data,
        anomaly_data=anomaly_data
    )
    assert len(agreements) == 1
    assert agreements[0].type == "MODERATE_POSITIVE_ALIGNMENT"
