from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from src.schemas.mlops import (
    ModelHealthReport, ModelHealthClassification,
    PerformanceDegradationReport, PerformanceStatus,
    DriftReport, DriftLevel
)
from src.core.config import settings

class ModelHealthEvaluator:
    """
    Computes an operational Model Health Score (0–100) combining performance stability,
    data drift stability, feedback availability, and model freshness.
    """

    def __init__(
        self,
        weight_performance: Optional[float] = None,
        weight_drift: Optional[float] = None,
        weight_feedback: Optional[float] = None,
        weight_freshness: Optional[float] = None
    ):
        self.w_perf = weight_performance if weight_performance is not None else settings.MODEL_HEALTH_WEIGHT_PERFORMANCE
        self.w_drift = weight_drift if weight_drift is not None else settings.MODEL_HEALTH_WEIGHT_DRIFT
        self.w_fb = weight_feedback if weight_feedback is not None else settings.MODEL_HEALTH_WEIGHT_FEEDBACK
        self.w_fresh = weight_freshness if weight_freshness is not None else settings.MODEL_HEALTH_WEIGHT_FRESHNESS

    def evaluate_health(
        self,
        model_name: str,
        model_version: str,
        degradation_report: Optional[PerformanceDegradationReport] = None,
        drift_report: Optional[DriftReport] = None,
        resolved_feedback_count: int = 0,
        model_age_days: Optional[float] = None
    ) -> ModelHealthReport:
        reasons: List[str] = []

        # 1. Performance Stability (0–100)
        if degradation_report is None or degradation_report.status == PerformanceStatus.INSUFFICIENT_DATA:
            perf_score = 90.0
            reasons.append("Production feedback is currently accumulating.")
        elif degradation_report.status == PerformanceStatus.STABLE:
            perf_score = 100.0
            reasons.append("Model classification accuracy and metrics remain stable.")
        elif degradation_report.status == PerformanceStatus.MINOR_DEGRADATION:
            perf_score = 70.0
            reasons.append("Minor drop in production validation metrics detected.")
        else:
            perf_score = 35.0
            reasons.append("Significant degradation detected in production performance.")

        # 2. Data Drift Stability (0–100)
        if drift_report is None or drift_report.overall_drift == DriftLevel.INSUFFICIENT_DATA:
            drift_score = 90.0
        elif drift_report.overall_drift == DriftLevel.LOW:
            drift_score = 100.0
            reasons.append("Input feature distributions are aligned with training baselines.")
        elif drift_report.overall_drift == DriftLevel.MODERATE:
            drift_score = 70.0
            reasons.append(f"Moderate feature drift detected across {drift_report.moderate_drift_count} features.")
        else:
            drift_score = 30.0
            reasons.append(f"High feature/prediction drift detected across {drift_report.high_drift_count} features.")

        # 3. Feedback Coverage (0–100)
        min_fb = settings.RETRAINING_MIN_NEW_FEEDBACK
        if resolved_feedback_count >= min_fb:
            fb_score = 100.0
        else:
            fb_score = max(50.0, (resolved_feedback_count / max(1, min_fb)) * 100.0)

        # 4. Freshness (0–100)
        age = model_age_days if model_age_days is not None else 0.0
        max_age = max(1.0, float(settings.MODEL_MAX_AGE_DAYS))
        fresh_score = max(20.0, min(100.0, 100.0 - (age / max_age) * 50.0))

        # Composite Bounded Score
        composite = (
            (self.w_perf * perf_score)
            + (self.w_drift * drift_score)
            + (self.w_fb * fb_score)
            + (self.w_fresh * fresh_score)
        )
        final_score = round(max(0.0, min(100.0, composite)), 2)

        if final_score >= 90.0:
            classification = ModelHealthClassification.EXCELLENT
        elif final_score >= 70.0:
            classification = ModelHealthClassification.HEALTHY
        elif final_score >= 40.0:
            classification = ModelHealthClassification.WARNING
        else:
            classification = ModelHealthClassification.CRITICAL

        components = {
            "performance_stability": round(perf_score, 2),
            "data_drift_stability": round(drift_score, 2),
            "feedback_coverage": round(fb_score, 2),
            "model_freshness": round(fresh_score, 2)
        }

        return ModelHealthReport(
            model_name=model_name,
            model_version=model_version,
            health_score=final_score,
            classification=classification,
            components=components,
            reasons=reasons,
            generated_at=datetime.now(timezone.utc).isoformat()
        )
