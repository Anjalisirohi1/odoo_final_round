import pytest
from src.mlops.prediction_logger import PredictionLogger
from src.mlops.prediction_repository import PredictionObservationRepository
from src.schemas.mlops import PredictionObservation

class InMemoryPredRepo(PredictionObservationRepository):
    def __init__(self):
        self.items = []
    def append_observation(self, obs):
        self.items.append(obs)
    def get_observation(self, prediction_id):
        return next((o for o in self.items if o.prediction_id == prediction_id), None)
    def get_observation_by_quotation(self, quotation_id):
        return next((o for o in self.items if o.quotation_id == quotation_id), None)
    def list_observations(self, model_name=None, limit=None):
        return list(self.items)
    def update_observation(self, obs):
        return True

def test_prediction_logger_pii_sanitization():
    repo = InMemoryPredRepo()
    logger = PredictionLogger(repository=repo)

    raw_features = {
        "customer_name": "Secret Client Inc",
        "email": "contact@secret.com",
        "phone": "+1-555-0199",
        "discount_percentage": 14.5,
        "total_amount": 50000.0,
        "customer_tier": "Enterprise"
    }

    obs = logger.log_prediction(
        model_name="deal_predictor",
        model_version="1.0.0",
        quotation_id="Q-100",
        predicted_outcome="LIKELY_TO_CONVERT",
        conversion_probability=0.82,
        confidence="HIGH",
        expected_revenue=41000.0,
        raw_features=raw_features
    )

    assert obs is not None
    assert obs.quotation_id == "Q-100"
    # Verify PII was excluded from feature snapshot
    assert "customer_name" not in obs.feature_snapshot
    assert "email" not in obs.feature_snapshot
    assert "phone" not in obs.feature_snapshot
    # Verify ML features were preserved
    assert obs.feature_snapshot["discount_percentage"] == 14.5
    assert obs.feature_snapshot["customer_tier"] == "Enterprise"

def test_prediction_logger_graceful_error_isolation():
    class BrokenRepo(PredictionObservationRepository):
        def append_observation(self, obs):
            raise IOError("Disk write failure")
        def get_observation(self, prediction_id): return None
        def get_observation_by_quotation(self, quotation_id): return None
        def list_observations(self, model_name=None, limit=None): return []
        def update_observation(self, obs): return False

    logger = PredictionLogger(repository=BrokenRepo())
    # Should not raise exception
    res = logger.log_prediction(
        model_name="deal_predictor",
        model_version="1.0.0",
        quotation_id="Q-101",
        predicted_outcome="LIKELY_TO_CONVERT",
        conversion_probability=0.82,
        confidence="HIGH",
        expected_revenue=41000.0
    )
    assert res is None
