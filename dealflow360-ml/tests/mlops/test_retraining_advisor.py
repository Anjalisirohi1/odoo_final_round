import pytest
from src.mlops.retraining_advisor import RetrainingAdvisor
from src.schemas.mlops import (
    PerformanceDegradationReport, PerformanceStatus,
    DriftReport, DriftLevel, PredictionDriftResult,
    RetrainingDecision, RetrainingPriority
)

def test_retraining_advisor_high_priority_on_significant_degradation():
    advisor = RetrainingAdvisor(min_new_feedback=50)

    deg = PerformanceDegradationReport(
        model_name="deal_predictor",
        model_version="1.0.0",
        training_metrics={"roc_auc": 0.88},
        production_metrics={"roc_auc": 0.72},
        metric_drops={"roc_auc": 0.16},
        status=PerformanceStatus.SIGNIFICANT_DEGRADATION,
        description="Significant drop"
    )

    rec = advisor.advise(
        model_name="deal_predictor",
        model_version="1.0.0",
        degradation_report=deg,
        new_resolved_feedback_count=60
    )

    assert rec.recommendation == RetrainingDecision.RETRAIN_HIGH_PRIORITY
    assert rec.priority == RetrainingPriority.HIGH
    assert len(rec.reasons) >= 1

def test_retraining_advisor_no_action_when_healthy():
    advisor = RetrainingAdvisor()

    deg = PerformanceDegradationReport(
        model_name="deal_predictor",
        model_version="1.0.0",
        training_metrics={"roc_auc": 0.85},
        production_metrics={"roc_auc": 0.84},
        metric_drops={"roc_auc": 0.01},
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
        prediction_drift=PredictionDriftResult(score=0.02, level=DriftLevel.LOW),
        overall_drift=DriftLevel.LOW,
        generated_at="2026-09-01T10:00:00Z"
    )

    rec = advisor.advise(
        model_name="deal_predictor",
        model_version="1.0.0",
        degradation_report=deg,
        drift_report=drift,
        new_resolved_feedback_count=100
    )

    assert rec.recommendation == RetrainingDecision.NO_ACTION
    assert rec.priority == RetrainingPriority.NONE
