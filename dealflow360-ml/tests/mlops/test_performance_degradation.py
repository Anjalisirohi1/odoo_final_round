import pytest
from src.mlops.performance_degradation import PerformanceDegradationDetector
from src.schemas.mlops import PerformanceReport, PerformanceStatus

def test_performance_degradation_stable():
    detector = PerformanceDegradationDetector(minor_threshold=0.05, significant_threshold=0.10)
    training_metrics = {"roc_auc": 0.85, "f1": 0.80, "accuracy": 0.82}
    prod_report = PerformanceReport(
        model_name="deal_predictor",
        model_version="1.0.0",
        sample_size=100,
        resolved_count=100,
        accuracy=0.81,
        f1=0.79,
        roc_auc=0.84,
        status=PerformanceStatus.STABLE,
        description="Resolved"
    )

    deg = detector.evaluate_degradation(training_metrics, prod_report)
    assert deg.status == PerformanceStatus.STABLE
    assert "stable" in deg.description.lower()

def test_performance_degradation_significant():
    detector = PerformanceDegradationDetector(minor_threshold=0.05, significant_threshold=0.10)
    training_metrics = {"roc_auc": 0.88, "f1": 0.85}
    prod_report = PerformanceReport(
        model_name="deal_predictor",
        model_version="1.0.0",
        sample_size=100,
        resolved_count=100,
        accuracy=0.70,
        f1=0.70,
        roc_auc=0.74, # drop of 0.14 (> 0.10)
        status=PerformanceStatus.STABLE,
        description="Resolved"
    )

    deg = detector.evaluate_degradation(training_metrics, prod_report)
    assert deg.status == PerformanceStatus.SIGNIFICANT_DEGRADATION
    assert deg.metric_drops["roc_auc"] == 0.14
