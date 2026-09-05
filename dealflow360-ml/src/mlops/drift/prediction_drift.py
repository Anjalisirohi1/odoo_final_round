import numpy as np
from typing import List, Optional
from src.schemas.mlops import PredictionDriftResult, DriftLevel
from src.core.config import settings
from .drift_metrics import DriftMetrics

class PredictionDriftDetector:
    """
    Monitors drift in model predicted probability outputs between baseline training predictions
    and recent online serving predictions.
    """

    def __init__(
        self,
        psi_low_threshold: Optional[float] = None,
        psi_high_threshold: Optional[float] = None,
        min_sample_size: Optional[int] = None
    ):
        self.psi_low = psi_low_threshold or settings.DRIFT_PSI_LOW_THRESHOLD
        self.psi_high = psi_high_threshold or settings.DRIFT_PSI_HIGH_THRESHOLD
        self.min_samples = min_sample_size or settings.MINIMUM_DRIFT_SAMPLE_SIZE

    def detect_prediction_drift(
        self,
        baseline_probabilities: List[float],
        production_probabilities: List[float]
    ) -> PredictionDriftResult:
        if len(production_probabilities) < self.min_samples:
            return PredictionDriftResult(
                metric="PSI",
                score=0.0,
                level=DriftLevel.INSUFFICIENT_DATA,
                training_distribution={},
                production_distribution={}
            )

        exp_arr = np.array(baseline_probabilities, dtype=float)
        act_arr = np.array(production_probabilities, dtype=float)

        psi_score = DriftMetrics.calculate_psi(exp_arr, act_arr, num_buckets=5)

        # Build histogram buckets for explainability
        bins = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
        exp_hist, _ = np.histogram(exp_arr, bins=bins)
        act_hist, _ = np.histogram(act_arr, bins=bins)

        exp_dist = {f"{bins[i]:.1f}-{bins[i+1]:.1f}": round(float(exp_hist[i]/len(exp_arr)), 4) for i in range(len(bins)-1)}
        act_dist = {f"{bins[i]:.1f}-{bins[i+1]:.1f}": round(float(act_hist[i]/len(act_arr)), 4) for i in range(len(bins)-1)}

        if psi_score >= self.psi_high:
            level = DriftLevel.HIGH
        elif psi_score >= self.psi_low:
            level = DriftLevel.MODERATE
        else:
            level = DriftLevel.LOW

        return PredictionDriftResult(
            metric="PSI",
            score=psi_score,
            level=level,
            training_distribution=exp_dist,
            production_distribution=act_dist
        )
