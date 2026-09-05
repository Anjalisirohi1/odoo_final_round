import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from src.schemas.mlops import (
    DriftReport, DriftLevel, PredictionObservation
)
from src.core.config import settings
from .drift_metrics import DriftMetrics
from .feature_drift import FeatureDriftDetector
from .prediction_drift import PredictionDriftDetector

class DriftService:
    """
    Coordinates end-to-end dataset, feature, and prediction drift evaluation.
    """

    def __init__(
        self,
        psi_low_threshold: Optional[float] = None,
        psi_high_threshold: Optional[float] = None,
        min_sample_size: Optional[int] = None
    ):
        self.min_samples = min_sample_size or settings.MINIMUM_DRIFT_SAMPLE_SIZE
        self.feature_detector = FeatureDriftDetector(
            psi_low_threshold=psi_low_threshold,
            psi_high_threshold=psi_high_threshold,
            min_sample_size=self.min_samples
        )
        self.pred_detector = PredictionDriftDetector(
            psi_low_threshold=psi_low_threshold,
            psi_high_threshold=psi_high_threshold,
            min_sample_size=self.min_samples
        )


    def evaluate_drift(
        self,
        model_name: str,
        model_version: str,
        training_df: Optional[pd.DataFrame],
        observations: List[PredictionObservation],
        baseline_probabilities: Optional[List[float]] = None
    ) -> DriftReport:
        prod_samples = len(observations)
        if prod_samples == 0 or training_df is None or training_df.empty:
            return DriftReport(
                model_name=model_name,
                model_version=model_version,
                sample_size=prod_samples,
                features_analyzed=0,
                low_drift_count=0,
                moderate_drift_count=0,
                high_drift_count=0,
                feature_drift_results=[],
                prediction_drift=self.pred_detector.detect_prediction_drift([], []),
                overall_drift=DriftLevel.INSUFFICIENT_DATA,
                generated_at=datetime.now(timezone.utc).isoformat()
            )

        # Build production DataFrame from observation snapshots
        snapshots = [obs.feature_snapshot for obs in observations if obs.feature_snapshot]
        prod_df = pd.DataFrame(snapshots) if snapshots else pd.DataFrame()

        feature_results = []
        low_count = 0
        mod_count = 0
        high_count = 0

        common_features = [col for col in training_df.columns if col in prod_df.columns] if not prod_df.empty else []

        for col in common_features:
            res = self.feature_detector.detect_feature_drift(
                feature_name=col,
                training_series=training_df[col],
                production_series=prod_df[col]
            )
            feature_results.append(res)
            if res.level == DriftLevel.HIGH:
                high_count += 1
            elif res.level == DriftLevel.MODERATE:
                mod_count += 1
            elif res.level == DriftLevel.LOW:
                low_count += 1

        # Prediction distribution drift
        prod_probs = [obs.conversion_probability for obs in observations]
        baseline_probs = baseline_probabilities or [0.1, 0.3, 0.5, 0.7, 0.9] # Fallback uniform bins if baseline not provided
        pred_drift_result = self.pred_detector.detect_prediction_drift(
            baseline_probabilities=baseline_probs,
            production_probabilities=prod_probs
        )

        # Determine overall drift status
        if len(feature_results) == 0 or prod_samples < self.min_samples:
            overall = DriftLevel.INSUFFICIENT_DATA
        elif high_count >= 2 or pred_drift_result.level == DriftLevel.HIGH:
            overall = DriftLevel.HIGH
        elif mod_count >= 3 or pred_drift_result.level == DriftLevel.MODERATE:
            overall = DriftLevel.MODERATE
        else:
            overall = DriftLevel.LOW


        return DriftReport(
            model_name=model_name,
            model_version=model_version,
            sample_size=prod_samples,
            features_analyzed=len(feature_results),
            low_drift_count=low_count,
            moderate_drift_count=mod_count,
            high_drift_count=high_count,
            feature_drift_results=feature_results,
            prediction_drift=pred_drift_result,
            overall_drift=overall,
            generated_at=datetime.now(timezone.utc).isoformat()
        )
