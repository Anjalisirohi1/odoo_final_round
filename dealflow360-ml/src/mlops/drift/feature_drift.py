import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from src.schemas.mlops import FeatureDriftResult, DriftLevel
from src.core.config import settings
from .drift_metrics import DriftMetrics

class FeatureDriftDetector:
    """
    Evaluates covariate feature drift between training baseline distributions
    and online serving feature snapshots.
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

    def detect_feature_drift(
        self,
        feature_name: str,
        training_series: pd.Series,
        production_series: pd.Series
    ) -> FeatureDriftResult:
        """
        Computes PSI and drift level for a single feature.
        """
        t_clean = training_series.dropna()
        p_clean = production_series.dropna()

        if len(p_clean) < self.min_samples:
            return FeatureDriftResult(
                feature=feature_name,
                metric="PSI",
                score=0.0,
                level=DriftLevel.INSUFFICIENT_DATA,
                training_mean=float(t_clean.mean()) if pd.api.types.is_numeric_dtype(t_clean) and len(t_clean) > 0 else None,
                production_mean=float(p_clean.mean()) if pd.api.types.is_numeric_dtype(p_clean) and len(p_clean) > 0 else None,
                details={"reason": f"Sample size ({len(p_clean)}) below minimum threshold ({self.min_samples})."}
            )

        # Numerical feature PSI
        if pd.api.types.is_numeric_dtype(t_clean) and pd.api.types.is_numeric_dtype(p_clean):
            t_arr = t_clean.to_numpy(dtype=float)
            p_arr = p_clean.to_numpy(dtype=float)
            psi_score = DriftMetrics.calculate_psi(t_arr, p_arr)
            t_mean = float(t_arr.mean()) if len(t_arr) > 0 else None
            p_mean = float(p_arr.mean()) if len(p_arr) > 0 else None
        else:
            # Categorical feature PSI
            t_counts = dict(t_clean.astype(str).value_counts())
            p_counts = dict(p_clean.astype(str).value_counts())
            psi_score = DriftMetrics.calculate_categorical_psi(t_counts, p_counts)
            t_mean = None
            p_mean = None

        if psi_score >= self.psi_high:
            level = DriftLevel.HIGH
        elif psi_score >= self.psi_low:
            level = DriftLevel.MODERATE
        else:
            level = DriftLevel.LOW

        return FeatureDriftResult(
            feature=feature_name,
            metric="PSI",
            score=psi_score,
            level=level,
            training_mean=round(t_mean, 4) if t_mean is not None else None,
            production_mean=round(p_mean, 4) if p_mean is not None else None,
            details={"sample_size": len(p_clean)}
        )
