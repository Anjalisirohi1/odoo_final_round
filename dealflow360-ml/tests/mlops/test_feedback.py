import pytest
from src.mlops.feedback_service import FeedbackService
from src.mlops.prediction_repository import PredictionObservationRepository
from src.schemas.mlops import PredictionObservation, OutcomeFeedbackRequest, ActualOutcome

class InMemoryPredRepo(PredictionObservationRepository):
    def __init__(self):
        self.items = {}
    def append_observation(self, obs):
        self.items[obs.prediction_id] = obs
    def get_observation(self, prediction_id):
        return self.items.get(prediction_id)
    def get_observation_by_quotation(self, quotation_id):
        return next((o for o in self.items.values() if o.quotation_id == quotation_id), None)
    def list_observations(self, model_name=None, limit=None):
        return list(self.items.values())
    def update_observation(self, obs):
        self.items[obs.prediction_id] = obs
        return True

def test_feedback_loop_by_prediction_id():
    repo = InMemoryPredRepo()
    service = FeedbackService(repository=repo)

    obs = PredictionObservation(
        prediction_id="pred_123",
        model_name="deal_predictor",
        model_version="1.0.0",
        quotation_id="Q-123",
        predicted_outcome="LIKELY_TO_CONVERT",
        conversion_probability=0.88,
        confidence="HIGH",
        expected_revenue=100000.0,
        timestamp="2026-09-01T10:00:00Z"
    )
    repo.append_observation(obs)

    feedback_req = OutcomeFeedbackRequest(
        prediction_id="pred_123",
        actual_outcome=ActualOutcome.WON,
        actual_revenue=105000.0
    )

    updated = service.record_feedback(feedback_req)
    assert updated.actual_outcome == ActualOutcome.WON
    assert updated.actual_revenue == 105000.0
    assert updated.conversion_probability == 0.88  # preserved original

def test_feedback_loop_by_quotation_id():
    repo = InMemoryPredRepo()
    service = FeedbackService(repository=repo)

    obs = PredictionObservation(
        prediction_id="pred_456",
        model_name="deal_predictor",
        model_version="1.0.0",
        quotation_id="Q-456",
        predicted_outcome="LIKELY_TO_CONVERT",
        conversion_probability=0.75,
        confidence="HIGH",
        expected_revenue=50000.0,
        timestamp="2026-09-01T10:00:00Z"
    )
    repo.append_observation(obs)

    feedback_req = OutcomeFeedbackRequest(
        quotation_id="Q-456",
        actual_outcome=ActualOutcome.LOST,
        actual_revenue=0.0
    )

    updated = service.record_feedback(feedback_req)
    assert updated.actual_outcome == ActualOutcome.LOST
    assert updated.actual_revenue == 0.0

def test_feedback_not_found():
    repo = InMemoryPredRepo()
    service = FeedbackService(repository=repo)
    with pytest.raises(ValueError, match="not found"):
        service.record_feedback(OutcomeFeedbackRequest(prediction_id="nonexistent", actual_outcome=ActualOutcome.WON))
