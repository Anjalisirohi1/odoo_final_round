import pytest
from src.mlops.model_health import ModelHealthEvaluator
from src.schemas.mlops import (
    PerformanceDegradationReport, PerformanceStatus,
    DriftReport, DriftLevel, PredictionDriftResult,
    ModelHealthClassification
)

def test_model_health_evaluator_excellent():
    evaluator = ModelHealthEvaluator()

    deg = PerformanceDegradationReport(
        model_name="deal_predictor",
        model_version="1.0.0",
        training_metrics={},
        production_metrics={},
        metric_drops={},
        status=PerformanceStatus.STABLE,
        description="Stable"
    )

    drift = DriftReport(
        model_name="deal_predictor",
        model_version="1.0.0",
        sample_size=100,
        features_analyzed=10,
        low_drift_count=10,
        moderate_drift_count=0,
        high_drift_count=0,
        feature_drift_results=[],
        prediction_drift=PredictionDriftResult(score=0.01, level=DriftLevel.LOW),
        overall_drift=DriftLevel.LOW,
        generated_at="2026-09-01T10:00:00Z"
    )

    report = evaluator.evaluate_health(
        model_name="deal_predictor",
        model_version="1.0.0",
        degradation_report=deg,
        drift_report=drift,
        resolved_feedback_count=60,
        model_age_days=10.0
    )

    assert report.health_score >= 90.0
    assert report.classification == ModelHealthClassification.EXCELLENT
    assert 0.0 <= report.health_score <= 100.0

def test_model_health_evaluator_critical():
    evaluator = ModelHealthEvaluator()

    deg = PerformanceDegradationReport(
        model_name="deal_predictor",
        model_version="1.0.0",
        training_metrics={},
        production_metrics={},
        metric_drops={},
        status=PerformanceStatus.SIGNIFICANT_DEGRADATION,
        description="Significant drop"
    )

    drift = DriftReport(
        model_name="deal_predictor",
        model_version="1.0.0",
        sample_size=100,
        features_analyzed=10,
        low_drift_count=2,
        moderate_drift_count=2,
        high_drift_count=6,
        feature_drift_results=[],
        prediction_drift=PredictionDriftResult(score=0.35, level=DriftLevel.HIGH),
        overall_drift=DriftLevel.HIGH,
        generated_at="2026-09-01T10:00:00Z"
    )

    report = evaluator.evaluate_health(
        model_name="deal_predictor",
        model_version="1.0.0",
        degradation_report=deg,
        drift_report=drift,
        resolved_feedback_count=5,
        model_age_days=120.0
    )

    assert report.health_score < 40.0
    assert report.classification == ModelHealthClassification.CRITICAL
