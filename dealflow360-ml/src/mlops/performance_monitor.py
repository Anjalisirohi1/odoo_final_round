import numpy as np
from typing import List, Optional, Dict, Any
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, brier_score_loss

from src.schemas.mlops import (
    PredictionObservation, PerformanceReport, PerformanceStatus, ActualOutcome
)
from src.core.config import settings
from .performance_window import PerformanceWindow

class PerformanceMonitor:
    """
    Evaluates statistical and commercial prediction accuracy metrics exclusively
    on resolved feedback observations.
    """

    def __init__(self, min_samples: Optional[int] = None):
        self.min_samples = min_samples or settings.MINIMUM_PERFORMANCE_SAMPLE_SIZE

    def evaluate_performance(
        self,
        observations: List[PredictionObservation],
        model_name: str,
        model_version: str,
        window_size: Optional[int] = None
    ) -> PerformanceReport:
        resolved = PerformanceWindow.filter_resolved_observations(observations, window_size=window_size)
        total_sample = len(observations)
        resolved_count = len(resolved)

        if resolved_count < self.min_samples:
            return PerformanceReport(
                model_name=model_name,
                model_version=model_version,
                sample_size=total_sample,
                resolved_count=resolved_count,
                status=PerformanceStatus.INSUFFICIENT_DATA,
                description=f"Insufficient resolved outcomes ({resolved_count}/{self.min_samples} required) for performance evaluation."
            )

        y_true = np.array([1 if obs.actual_outcome == ActualOutcome.WON else 0 for obs in resolved])
        y_prob = np.array([obs.conversion_probability for obs in resolved])
        y_pred = np.array([1 if p >= 0.50 else 0 for p in y_prob])

        acc = float(accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec = float(recall_score(y_true, y_pred, zero_division=0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))

        roc_auc = None
        if len(np.unique(y_true)) > 1:
            try:
                roc_auc = float(roc_auc_score(y_true, y_prob))
            except Exception:
                pass

        brier = float(brier_score_loss(y_true, y_prob))

        # Commercial Revenue Forecast Accuracy
        exp_revs = []
        act_revs = []
        for obs in resolved:
            if obs.actual_revenue is not None:
                exp_revs.append(obs.expected_revenue)
                act_revs.append(obs.actual_revenue)

        exp_total = float(sum(exp_revs)) if exp_revs else None
        act_total = float(sum(act_revs)) if act_revs else None
        mae = None
        mape = None

        if exp_revs and act_revs:
            exp_arr = np.array(exp_revs)
            act_arr = np.array(act_revs)
            mae = float(np.mean(np.abs(exp_arr - act_arr)))
            non_zero_mask = act_arr > 0
            if np.any(non_zero_mask):
                mape = float(np.mean(np.abs((act_arr[non_zero_mask] - exp_arr[non_zero_mask]) / act_arr[non_zero_mask])) * 100)

        return PerformanceReport(
            model_name=model_name,
            model_version=model_version,
            sample_size=total_sample,
            resolved_count=resolved_count,
            accuracy=round(acc, 4),
            precision=round(prec, 4),
            recall=round(rec, 4),
            f1=round(f1, 4),
            roc_auc=round(roc_auc, 4) if roc_auc is not None else None,
            brier_score=round(brier, 4),
            expected_revenue_total=round(exp_total, 2) if exp_total is not None else None,
            actual_revenue_total=round(act_total, 2) if act_total is not None else None,
            revenue_mae=round(mae, 2) if mae is not None else None,
            revenue_mape=round(mape, 2) if mape is not None else None,
            status=PerformanceStatus.STABLE,
            description=f"Evaluated on {resolved_count} resolved deal outcomes."
        )
