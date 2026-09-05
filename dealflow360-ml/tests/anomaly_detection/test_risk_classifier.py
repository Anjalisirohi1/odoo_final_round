from src.anomaly_detection.risk_classifier import RiskClassifier

def test_risk_classifier():
    classifier = RiskClassifier()
    assert classifier.classify(0.1) == "LOW"
    assert classifier.classify(0.4) == "MEDIUM"
    assert classifier.classify(0.6) == "HIGH"
    assert classifier.classify(0.9) == "CRITICAL"
