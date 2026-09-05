import pytest
import pandas as pd
import numpy as np
from src.mlops.service import MLOpsService
from src.mlops.model_registry import ModelRegistry
from src.mlops.registry_repository import ModelRegistryRepository
from src.mlops.prediction_repository import FilePredictionObservationRepository
from src.schemas.mlops import (
    ModelRegistryEntry, ModelStatus, OutcomeFeedbackRequest, ActualOutcome
)

class InMemoryRegistryRepo(ModelRegistryRepository):
    def __init__(self):
        self.items = []
    def load_entries(self): return list(self.items)
    def save_entries(self, entries): self.items = list(entries)

def test_mlops_service_end_to_end(tmp_path):
    registry = ModelRegistry(repository=InMemoryRegistryRepo())
    pred_repo = FilePredictionObservationRepository(logs_dir=str(tmp_path / "logs"))
    service = MLOpsService(registry=registry, prediction_repo=pred_repo)

    # 1. Register active model
    entry = ModelRegistryEntry(
        model_name="deal_outcome_prediction",
        model_version="1.0.0",
        status=ModelStatus.ACTIVE,
        created_at="2026-09-01T10:00:00Z",
        trained_at="2026-09-01T10:00:00Z",
        metrics={"roc_auc": 0.85, "f1": 0.80, "accuracy": 0.82},
        is_active=True
    )
    service.registry.register_model(entry)

    # Set baseline training data
    train_df = pd.DataFrame({
        "discount_percentage": np.random.normal(10, 2, 100),
        "total_amount": np.random.normal(50000, 5000, 100)
    })
    service.set_baseline_training_data("deal_outcome_prediction", train_df)

    # 2. Log predictions
    for i in range(15):
        service.log_prediction(
            model_name="deal_outcome_prediction",
            model_version="1.0.0",
            quotation_id=f"quote_{i}",
            predicted_outcome="LIKELY_TO_CONVERT" if i % 2 == 0 else "LIKELY_TO_LOSE",
            conversion_probability=0.85 if i % 2 == 0 else 0.20,
            confidence="HIGH",
            expected_revenue=40000.0,
            raw_features={"discount_percentage": 10.2, "total_amount": 50500.0}
        )

    # 3. Submit feedback
    for i in range(12):
        service.record_feedback(OutcomeFeedbackRequest(
            quotation_id=f"quote_{i}",
            actual_outcome=ActualOutcome.WON if i % 2 == 0 else ActualOutcome.LOST,
            actual_revenue=45000.0 if i % 2 == 0 else 0.0
        ))

    # 4. Check Performance
    perf = service.get_performance_report("deal_outcome_prediction", version="1.0.0")
    assert perf.resolved_count == 12
    assert perf.accuracy is not None

    # 5. Check Drift
    drift = service.get_drift_report("deal_outcome_prediction", version="1.0.0")
    assert drift.sample_size == 15

    # 6. Check Health
    health = service.get_model_health("deal_outcome_prediction", version="1.0.0")
    assert 0.0 <= health.health_score <= 100.0

    # 7. Check Retraining Advice
    advice = service.get_retraining_advice("deal_outcome_prediction", version="1.0.0")
    assert advice.recommendation is not None
