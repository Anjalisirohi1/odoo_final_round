import pytest
from src.mlops.performance_monitor import PerformanceMonitor
from src.schemas.mlops import PredictionObservation, ActualOutcome, PerformanceStatus

def test_performance_monitor_accuracy_and_metrics():
    monitor = PerformanceMonitor(min_samples=5)

    observations = []
    # 6 correct predictions, 4 incorrect
    for i in range(10):
        actual = ActualOutcome.WON if i < 6 else ActualOutcome.LOST
        prob = 0.85 if i < 7 else 0.15 # 1 false positive at index 6
        act_rev = 10000.0 if actual == ActualOutcome.WON else 0.0
        observations.append(PredictionObservation(
            prediction_id=f"p_{i}",
            model_name="deal_predictor",
            model_version="1.0.0",
            quotation_id=f"Q_{i}",
            predicted_outcome="LIKELY_TO_CONVERT" if prob >= 0.5 else "LIKELY_TO_LOSE",
            conversion_probability=prob,
            confidence="HIGH",
            expected_revenue=prob * 10000.0,
            timestamp="2026-09-01T10:00:00Z",
            actual_outcome=actual,
            actual_revenue=act_rev
        ))

    report = monitor.evaluate_performance(
        observations=observations,
        model_name="deal_predictor",
        model_version="1.0.0"
    )

    assert report.status == PerformanceStatus.STABLE
    assert report.sample_size == 10
    assert report.resolved_count == 10
    assert report.accuracy is not None
    assert report.accuracy >= 0.80
    assert report.f1 is not None
    assert report.brier_score is not None
    assert report.expected_revenue_total is not None
    assert report.actual_revenue_total == 60000.0

def test_performance_monitor_insufficient_data():
    monitor = PerformanceMonitor(min_samples=10)
    observations = [
        PredictionObservation(
            prediction_id="p_1",
            model_name="deal_predictor",
            model_version="1.0.0",
            quotation_id="Q_1",
            predicted_outcome="LIKELY_TO_CONVERT",
            conversion_probability=0.8,
            confidence="HIGH",
            expected_revenue=800,
            timestamp="t",
            actual_outcome=ActualOutcome.WON
        )
    ]
    report = monitor.evaluate_performance(observations, "deal_predictor", "1.0.0")
    assert report.status == PerformanceStatus.INSUFFICIENT_DATA
    assert report.resolved_count == 1
