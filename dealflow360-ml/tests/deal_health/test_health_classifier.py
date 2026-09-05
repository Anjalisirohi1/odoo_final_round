import pytest
from src.schemas.deal_health import HealthClassification
from src.deal_health.health_classifier import HealthClassifier

def test_health_classifier_boundaries():
    classifier = HealthClassifier()
    
    assert classifier.classify(100.0) == HealthClassification.EXCELLENT
    assert classifier.classify(80.0) == HealthClassification.EXCELLENT
    assert classifier.classify(79.99) == HealthClassification.HEALTHY
    assert classifier.classify(60.0) == HealthClassification.HEALTHY
    assert classifier.classify(59.99) == HealthClassification.AT_RISK
    assert classifier.classify(40.0) == HealthClassification.AT_RISK
    assert classifier.classify(39.99) == HealthClassification.CRITICAL
    assert classifier.classify(0.0) == HealthClassification.CRITICAL
