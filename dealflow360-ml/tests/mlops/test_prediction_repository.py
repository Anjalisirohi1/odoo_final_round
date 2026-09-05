import pytest
from src.mlops.prediction_repository import FilePredictionObservationRepository
from src.schemas.mlops import PredictionObservation, ActualOutcome

def test_prediction_repository_append_and_update(tmp_path):
    logs_dir = str(tmp_path / "prediction_logs")
    repo = FilePredictionObservationRepository(logs_dir=logs_dir)

    obs1 = PredictionObservation(
        prediction_id="pred_001",
        model_name="deal_predictor",
        model_version="1.0.0",
        quotation_id="Q-001",
        predicted_outcome="LIKELY_TO_CONVERT",
        conversion_probability=0.85,
        confidence="HIGH",
        expected_revenue=85000.0,
        timestamp="2026-09-01T10:00:00Z",
        feature_snapshot={"discount": 10.0}
    )

    repo.append_observation(obs1)

    # Retrieval
    retrieved = repo.get_observation("pred_001")
    assert retrieved is not None
    assert retrieved.quotation_id == "Q-001"
    assert retrieved.conversion_probability == 0.85
    assert retrieved.actual_outcome == ActualOutcome.PENDING

    # Update with feedback
    obs1.actual_outcome = ActualOutcome.WON
    obs1.actual_revenue = 90000.0
    obs1.outcome_timestamp = "2026-09-05T12:00:00Z"
    updated = repo.update_observation(obs1)
    assert updated is True

    # Check updated
    updated_obs = repo.get_observation("pred_001")
    assert updated_obs.actual_outcome == ActualOutcome.WON
    assert updated_obs.actual_revenue == 90000.0
    # Original probability remains unchanged
    assert updated_obs.conversion_probability == 0.85

    # List
    all_obs = repo.list_observations("deal_predictor")
    assert len(all_obs) == 1
