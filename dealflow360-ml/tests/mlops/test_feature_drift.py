import pytest
import numpy as np
import pandas as pd
from src.mlops.drift.drift_metrics import DriftMetrics
from src.mlops.drift.feature_drift import FeatureDriftDetector
from src.schemas.mlops import DriftLevel

def test_drift_metrics_psi():
    # Identical distributions -> PSI ~ 0
    d1 = np.random.normal(loc=10.0, scale=2.0, size=500)
    d2 = np.random.normal(loc=10.0, scale=2.0, size=500)
    psi_identical = DriftMetrics.calculate_psi(d1, d2)
    assert psi_identical < 0.10

    # Shifted distributions -> PSI > 0.25 (High drift)
    d3 = np.random.normal(loc=20.0, scale=2.0, size=500)
    psi_shifted = DriftMetrics.calculate_psi(d1, d3)
    assert psi_shifted > 0.25

def test_feature_drift_detector_numeric_and_categorical():
    detector = FeatureDriftDetector(min_sample_size=30)
    rng = np.random.default_rng(42)

    # Numerical feature test (aligned distributions)
    train_num = pd.Series(rng.normal(10, 2, 200))
    prod_num = pd.Series(rng.normal(10, 2, 200))
    res_num = detector.detect_feature_drift("discount", train_num, prod_num)
    assert res_num.level == DriftLevel.LOW


    # Categorical feature test
    train_cat = pd.Series(["SMB"] * 50 + ["Enterprise"] * 50)
    prod_cat = pd.Series(["SMB"] * 10 + ["Enterprise"] * 90) # Shift
    res_cat = detector.detect_feature_drift("segment", train_cat, prod_cat)
    assert res_cat.level in [DriftLevel.MODERATE, DriftLevel.HIGH]
