import numpy as np
from src.anomaly_detection.scorer import AnomalyScorer

def test_anomaly_scorer():
    scorer = AnomalyScorer()
    
    raw_scores = np.array([0.5, 0.0, -0.5]) # -0.5 is anomaly, 0.5 is normal
    scorer.fit(raw_scores)
    
    assert scorer.is_fitted
    
    normalized = scorer.score(np.array([0.5, -0.5, 0.0]))
    # 0.5 -> inverted is -0.5 (min) -> normalized to 0.0
    # -0.5 -> inverted is 0.5 (max) -> normalized to 1.0
    assert normalized[0] == 0.0
    assert normalized[1] == 1.0
    assert normalized[2] == 0.5
