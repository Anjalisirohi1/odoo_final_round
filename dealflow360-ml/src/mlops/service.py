import logging
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone

from src.schemas.mlops import (
    ModelRegistryEntry, ModelStatus, PredictionObservation, OutcomeFeedbackRequest,
    PerformanceReport, DriftReport, ModelHealthReport, RetrainingRecommendation,
    ModelComparison
)
from .model_registry import ModelRegistry
from .training_tracker import TrainingTracker
from .data_lineage import DatasetLineageTracker
from .prediction_logger import PredictionLogger
from .prediction_repository import FilePredictionObservationRepository
from .feedback_service import FeedbackService
from .performance_monitor import PerformanceMonitor
from .performance_degradation import PerformanceDegradationDetector
from .drift.service import DriftService
from .retraining_advisor import RetrainingAdvisor
from .model_health import ModelHealthEvaluator
from .champion_challenger import ChampionChallengerComparator

logger = logging.getLogger(__name__)

class MLOpsService:
    """
    Unified facade for MLOps lifecycle governance, model registry, prediction logging,
    outcome feedback, performance monitoring, drift detection, and retraining advisory.
    """

    def __init__(
        self,
        registry: Optional[ModelRegistry] = None,
        training_tracker: Optional[TrainingTracker] = None,
        prediction_repo: Optional[FilePredictionObservationRepository] = None,
        prediction_logger: Optional[PredictionLogger] = None,
        feedback_service: Optional[FeedbackService] = None
    ):
        self.registry = registry or ModelRegistry()
        self.training_tracker = training_tracker or TrainingTracker()
        self.prediction_repo = prediction_repo or FilePredictionObservationRepository()
        self.prediction_logger = prediction_logger or PredictionLogger(repository=self.prediction_repo)
        self.feedback_service = feedback_service or FeedbackService(repository=self.prediction_repo)

        self.performance_monitor = PerformanceMonitor()
        self.degradation_detector = PerformanceDegradationDetector()
        self.drift_service = DriftService()
        self.retraining_advisor = RetrainingAdvisor()
        self.health_evaluator = ModelHealthEvaluator()
        self.comparator = ChampionChallengerComparator()

        # Cache baseline training feature distributions in memory when available
        self.baseline_training_dfs: Dict[str, pd.DataFrame] = {}

    def set_baseline_training_data(self, model_name: str, df: pd.DataFrame) -> None:
        self.baseline_training_dfs[model_name] = df

    # --- Registry & Model Lifecycle ---
    def list_models(self, model_name: Optional[str] = None) -> List[ModelRegistryEntry]:
        return self.registry.list_models(model_name=model_name)

    def get_model(self, model_name: str, version: str) -> Optional[ModelRegistryEntry]:
        return self.registry.get_model(model_name, version)

    def get_active_model(self, model_name: str) -> Optional[ModelRegistryEntry]:
        return self.registry.get_active_model(model_name)

    def activate_model(self, model_name: str, version: str) -> Tuple[ModelRegistryEntry, Optional[ModelRegistryEntry]]:
        return self.registry.activate_model(model_name, version)

    # --- Prediction Observation & Feedback ---
    def log_prediction(
        self,
        model_name: str,
        model_version: str,
        quotation_id: str,
        predicted_outcome: str,
        conversion_probability: float,
        confidence: str,
        expected_revenue: float,
        raw_features: Optional[Dict[str, Any]] = None
    ) -> Optional[PredictionObservation]:
        return self.prediction_logger.log_prediction(
            model_name=model_name,
            model_version=model_version,
            quotation_id=quotation_id,
            predicted_outcome=predicted_outcome,
            conversion_probability=conversion_probability,
            confidence=confidence,
            expected_revenue=expected_revenue,
            raw_features=raw_features
        )

    def record_feedback(self, request: OutcomeFeedbackRequest) -> PredictionObservation:
        return self.feedback_service.record_feedback(request)

    # --- Monitoring, Drift & Health ---
    def get_performance_report(
        self,
        model_name: str,
        version: Optional[str] = None,
        window_size: Optional[int] = None
    ) -> PerformanceReport:
        target_version = version or getattr(self.get_active_model(model_name), "model_version", "1.0.0")
        observations = self.prediction_repo.list_observations(model_name=model_name)
        # Filter by version if observations contain multiple versions
        ver_obs = [obs for obs in observations if obs.model_version == target_version] if version else observations

        return self.performance_monitor.evaluate_performance(
            observations=ver_obs,
            model_name=model_name,
            model_version=target_version,
            window_size=window_size
        )

    def get_drift_report(
        self,
        model_name: str,
        version: Optional[str] = None,
        training_df: Optional[pd.DataFrame] = None
    ) -> DriftReport:
        target_version = version or getattr(self.get_active_model(model_name), "model_version", "1.0.0")
        observations = self.prediction_repo.list_observations(model_name=model_name)
        ver_obs = [obs for obs in observations if obs.model_version == target_version] if version else observations

        t_df = training_df if training_df is not None else self.baseline_training_dfs.get(model_name)

        return self.drift_service.evaluate_drift(
            model_name=model_name,
            model_version=target_version,
            training_df=t_df,
            observations=ver_obs
        )

    def get_model_health(
        self,
        model_name: str,
        version: Optional[str] = None,
        training_df: Optional[pd.DataFrame] = None
    ) -> ModelHealthReport:
        target_model = self.get_model(model_name, version) if version else self.get_active_model(model_name)
        target_version = target_model.model_version if target_model else (version or "1.0.0")

        # 1. Performance & Degradation
        perf_report = self.get_performance_report(model_name, version=target_version)
        training_metrics = target_model.metrics if target_model else {}
        deg_report = self.degradation_detector.evaluate_degradation(training_metrics, perf_report)

        # 2. Drift
        drift_report = self.get_drift_report(model_name, version=target_version, training_df=training_df)

        # 3. Age & Feedback
        age_days = None
        if target_model and target_model.trained_at:
            try:
                t_dt = datetime.fromisoformat(target_model.trained_at)
                age_days = (datetime.now(timezone.utc) - t_dt).total_seconds() / 86400.0
            except Exception:
                age_days = 0.0

        return self.health_evaluator.evaluate_health(
            model_name=model_name,
            model_version=target_version,
            degradation_report=deg_report,
            drift_report=drift_report,
            resolved_feedback_count=perf_report.resolved_count,
            model_age_days=age_days
        )

    def get_retraining_advice(
        self,
        model_name: str,
        version: Optional[str] = None,
        training_df: Optional[pd.DataFrame] = None
    ) -> RetrainingRecommendation:
        target_model = self.get_model(model_name, version) if version else self.get_active_model(model_name)
        target_version = target_model.model_version if target_model else (version or "1.0.0")

        perf_report = self.get_performance_report(model_name, version=target_version)
        training_metrics = target_model.metrics if target_model else {}
        deg_report = self.degradation_detector.evaluate_degradation(training_metrics, perf_report)
        drift_report = self.get_drift_report(model_name, version=target_version, training_df=training_df)

        age_days = None
        if target_model and target_model.trained_at:
            try:
                t_dt = datetime.fromisoformat(target_model.trained_at)
                age_days = (datetime.now(timezone.utc) - t_dt).total_seconds() / 86400.0
            except Exception:
                age_days = 0.0

        return self.retraining_advisor.advise(
            model_name=model_name,
            model_version=target_version,
            degradation_report=deg_report,
            drift_report=drift_report,
            new_resolved_feedback_count=perf_report.resolved_count,
            model_age_days=age_days
        )

    def compare_models(self, model_name: str, challenger_version: str) -> ModelComparison:
        champ = self.get_active_model(model_name)
        chall = self.get_model(model_name, challenger_version)

        if not chall:
            raise ValueError(f"Challenger model '{model_name}' v{challenger_version} not found.")

        champ_version = champ.model_version if champ else "none"
        champ_metrics = champ.metrics if champ else {}
        chall_metrics = chall.metrics

        return self.comparator.compare_models(
            model_name=model_name,
            champion_version=champ_version,
            challenger_version=challenger_version,
            champion_metrics=champ_metrics,
            challenger_metrics=chall_metrics
        )
