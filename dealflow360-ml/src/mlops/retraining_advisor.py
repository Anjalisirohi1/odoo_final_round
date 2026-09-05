from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from src.schemas.mlops import (
    RetrainingRecommendation, RetrainingDecision, RetrainingPriority,
    PerformanceDegradationReport, PerformanceStatus, DriftReport, DriftLevel
)
from src.core.config import settings

class RetrainingAdvisor:
    """
    Synthesizes performance degradation, covariate drift, prediction drift,
    feedback volume, and model age into an actionable retraining recommendation.
    NOTE: Advises on retraining only; never automatically initiates retraining.
    """

    def __init__(
        self,
        min_new_feedback: Optional[int] = None,
        max_age_days: Optional[int] = None
    ):
        self.min_feedback = min_new_feedback or settings.RETRAINING_MIN_NEW_FEEDBACK
        self.max_age_days = max_age_days or settings.MODEL_MAX_AGE_DAYS

    def advise(
        self,
        model_name: str,
        model_version: str,
        degradation_report: Optional[PerformanceDegradationReport] = None,
        drift_report: Optional[DriftReport] = None,
        new_resolved_feedback_count: int = 0,
        model_age_days: Optional[float] = None
    ) -> RetrainingRecommendation:
        reasons: List[str] = []
        metrics_summary: Dict[str, Any] = {
            "resolved_feedback_count": new_resolved_feedback_count,
            "model_age_days": model_age_days
        }

        is_significant_deg = degradation_report is not None and degradation_report.status == PerformanceStatus.SIGNIFICANT_DEGRADATION
        is_minor_deg = degradation_report is not None and degradation_report.status == PerformanceStatus.MINOR_DEGRADATION
        is_high_drift = drift_report is not None and drift_report.overall_drift == DriftLevel.HIGH
        is_mod_drift = drift_report is not None and drift_report.overall_drift == DriftLevel.MODERATE
        is_aging = model_age_days is not None and model_age_days >= self.max_age_days
        has_sufficient_feedback = new_resolved_feedback_count >= self.min_feedback

        if degradation_report:
            metrics_summary["performance_status"] = degradation_report.status.value
            metrics_summary["metric_drops"] = degradation_report.metric_drops
        if drift_report:
            metrics_summary["overall_drift"] = drift_report.overall_drift.value
            metrics_summary["high_drift_features"] = drift_report.high_drift_count

        # Decision Logic (Deterministic Priority Order)
        if is_significant_deg or is_high_drift:
            decision = RetrainingDecision.RETRAIN_HIGH_PRIORITY
            priority = RetrainingPriority.HIGH
            if is_significant_deg:
                reasons.append(degradation_report.description)
            if is_high_drift:
                reasons.append(f"High feature/prediction drift detected ({drift_report.high_drift_count} high-drift features).")
            if has_sufficient_feedback:
                reasons.append(f"{new_resolved_feedback_count} resolved deal outcomes available for retraining.")

        elif (is_minor_deg or is_mod_drift) and has_sufficient_feedback:
            decision = RetrainingDecision.RETRAIN_RECOMMENDED
            priority = RetrainingPriority.MEDIUM
            if is_minor_deg:
                reasons.append("Minor performance degradation observed relative to training baseline.")
            if is_mod_drift:
                reasons.append(f"Moderate covariate data drift detected ({drift_report.moderate_drift_count} features).")
            reasons.append(f"Sufficient ground truth feedback ({new_resolved_feedback_count} >= {self.min_feedback}) available to retrain.")

        elif is_aging and has_sufficient_feedback:
            decision = RetrainingDecision.RETRAIN_RECOMMENDED
            priority = RetrainingPriority.LOW
            reasons.append(f"Model age ({int(model_age_days)} days) exceeds standard retention horizon ({self.max_age_days} days).")
            reasons.append(f"{new_resolved_feedback_count} new resolved outcomes ready for ingestion.")

        elif is_minor_deg or is_mod_drift:
            decision = RetrainingDecision.MONITOR
            priority = RetrainingPriority.LOW
            reasons.append("Moderate drift or minor performance drops detected, but feedback sample is still accumulating.")
            reasons.append(f"Current feedback sample: {new_resolved_feedback_count}/{self.min_feedback} target.")

        else:
            decision = RetrainingDecision.NO_ACTION
            priority = RetrainingPriority.NONE
            reasons.append("Model performance, data distributions, and feature stability are in good standing.")

        return RetrainingRecommendation(
            model_name=model_name,
            model_version=model_version,
            recommendation=decision,
            priority=priority,
            reasons=reasons,
            metrics_summary=metrics_summary,
            generated_at=datetime.now(timezone.utc).isoformat()
        )
