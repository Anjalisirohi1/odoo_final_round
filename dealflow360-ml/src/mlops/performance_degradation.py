from typing import Dict, Any, Optional
from src.schemas.mlops import PerformanceReport, PerformanceDegradationReport, PerformanceStatus
from src.core.config import settings

class PerformanceDegradationDetector:
    """
    Compares baseline training evaluation metrics with recent production feedback metrics
    to detect statistical model performance degradation.
    """

    def __init__(
        self,
        minor_threshold: Optional[float] = None,
        significant_threshold: Optional[float] = None
    ):
        self.minor_threshold = minor_threshold or settings.PERFORMANCE_DEGRADATION_MINOR
        self.significant_threshold = significant_threshold or settings.PERFORMANCE_DEGRADATION_SIGNIFICANT

    def evaluate_degradation(
        self,
        training_metrics: Dict[str, Any],
        production_report: PerformanceReport
    ) -> PerformanceDegradationReport:
        if production_report.status == PerformanceStatus.INSUFFICIENT_DATA:
            return PerformanceDegradationReport(
                model_name=production_report.model_name,
                model_version=production_report.model_version,
                training_metrics={},
                production_metrics={},
                metric_drops={},
                status=PerformanceStatus.INSUFFICIENT_DATA,
                description=production_report.description
            )

        metric_keys = ["roc_auc", "f1", "accuracy", "precision", "recall"]
        prod_metrics = {}
        train_metrics = {}
        drops = {}

        for k in metric_keys:
            p_val = getattr(production_report, k, None)
            t_val = training_metrics.get(k)
            if p_val is not None and t_val is not None:
                try:
                    p_num = float(p_val)
                    t_num = float(t_val)
                    prod_metrics[k] = round(p_num, 4)
                    train_metrics[k] = round(t_num, 4)
                    drops[k] = round(t_num - p_num, 4)
                except (ValueError, TypeError):
                    continue

        if not drops:
            return PerformanceDegradationReport(
                model_name=production_report.model_name,
                model_version=production_report.model_version,
                training_metrics=train_metrics,
                production_metrics=prod_metrics,
                metric_drops={},
                status=PerformanceStatus.INSUFFICIENT_DATA,
                description="No comparable metrics available between training and production."
            )

        # Primary degradation metric is roc_auc drop, or f1 drop if roc_auc unavailable
        primary_drop = drops.get("roc_auc")
        if primary_drop is None:
            primary_drop = drops.get("f1", max(drops.values()))

        if primary_drop >= self.significant_threshold:
            status = PerformanceStatus.SIGNIFICANT_DEGRADATION
            desc = f"Significant performance degradation: primary metric dropped by {primary_drop:.4f} (>= threshold {self.significant_threshold})."
        elif primary_drop >= self.minor_threshold:
            status = PerformanceStatus.MINOR_DEGRADATION
            desc = f"Minor performance degradation: primary metric dropped by {primary_drop:.4f} (>= threshold {self.minor_threshold})."
        else:
            status = PerformanceStatus.STABLE
            desc = f"Model performance is stable in production relative to training baseline."

        return PerformanceDegradationReport(
            model_name=production_report.model_name,
            model_version=production_report.model_version,
            training_metrics=train_metrics,
            production_metrics=prod_metrics,
            metric_drops=drops,
            status=status,
            description=desc
        )
