import pytest
import numpy as np
import pandas as pd
from src.mlops.drift.prediction_drift import PredictionDriftDetector
from src.mlops.drift.service import DriftService
from src.schemas.mlops import DriftLevel, PredictionObservation

def test_prediction_drift_detector():
    detector = PredictionDriftDetector(min_sample_size=30)

    baseline = [0.1] * 20 + [0.3] * 20 + [0.5] * 20 + [0.7] * 20 + [0.9] * 20
    prod_stable = [0.12] * 20 + [0.31] * 20 + [0.49] * 20 + [0.72] * 20 + [0.88] * 20

    res = detector.detect_prediction_drift(baseline, prod_stable)
    assert res.level == DriftLevel.LOW

    # High shift
    prod_shifted = [0.95] * 100
    res_shift = detector.detect_prediction_drift(baseline, prod_shifted)
    assert res_shift.level == DriftLevel.HIGH

def test_drift_service_end_to_end():
    service = DriftService(min_sample_size=10)

    rng = np.random.default_rng(42)
    train_df = pd.DataFrame({
        "discount_percentage": rng.normal(12, 2, 100),
        "total_amount": rng.normal(50000, 5000, 100)
    })

    obs_list = [
        PredictionObservation(
            prediction_id=f"p_{i}",
            model_name="deal_predictor",
            model_version="1.0.0",
            quotation_id=f"q_{i}",
            predicted_outcome="LIKELY_TO_CONVERT" if i % 2 == 0 else "LIKELY_TO_LOSE",
            conversion_probability=float(np.clip(rng.uniform(0.05, 0.95), 0.0, 1.0)),
            confidence="HIGH",
            expected_revenue=40000.0,
            timestamp="2026-09-01T10:00:00Z",
            feature_snapshot={
                "discount_percentage": float(rng.normal(12.1, 1.9)),
                "total_amount": float(rng.normal(50100.0, 4900.0))
            }
        )
        for i in range(50)
    ]

    report = service.evaluate_drift(
        model_name="deal_predictor",
        model_version="1.0.0",
        training_df=train_df,
        observations=obs_list
    )

    assert report.sample_size == 50
    assert report.features_analyzed == 2
    assert report.overall_drift in [DriftLevel.LOW, DriftLevel.MODERATE]
