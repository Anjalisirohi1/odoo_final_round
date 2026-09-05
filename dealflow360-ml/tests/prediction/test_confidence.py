import pytest
from src.schemas.prediction import ConfidenceLevel
from src.prediction.confidence import ConfidenceEstimator

def test_confidence_estimator_levels():
    estimator = ConfidenceEstimator(high_threshold=0.60, medium_threshold=0.30)
    
    # 0.50 -> diff = 0.0 -> score = 0.0 -> LOW
    res_uncertain = estimator.estimate(0.50)
    assert res_uncertain.level == ConfidenceLevel.LOW
    assert res_uncertain.score == 0.0
    
    # 0.70 -> diff = 0.20 -> score = 0.40 -> MEDIUM
    res_med = estimator.estimate(0.70)
    assert res_med.level == ConfidenceLevel.MEDIUM
    assert abs(res_med.score - 0.40) < 1e-4
    
    # 0.95 -> diff = 0.45 -> score = 0.90 -> HIGH
    res_high = estimator.estimate(0.95)
    assert res_high.level == ConfidenceLevel.HIGH
    assert abs(res_high.score - 0.90) < 1e-4
    
    # 0.05 -> diff = 0.45 -> score = 0.90 -> HIGH
    res_low_prob_high_conf = estimator.estimate(0.05)
    assert res_low_prob_high_conf.level == ConfidenceLevel.HIGH
