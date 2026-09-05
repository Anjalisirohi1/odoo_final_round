import logging
from typing import Optional
from datetime import datetime, timezone

from src.schemas.mlops import PredictionObservation, OutcomeFeedbackRequest, ActualOutcome
from .prediction_repository import PredictionObservationRepository, FilePredictionObservationRepository

logger = logging.getLogger(__name__)

class FeedbackService:
    """
    Manages the outcome feedback loop, binding resolved deal outcomes (WON/LOST)
    and realized revenues to previous prediction observations.
    """

    def __init__(self, repository: Optional[PredictionObservationRepository] = None):
        self.repository = repository or FilePredictionObservationRepository()

    def record_feedback(self, request: OutcomeFeedbackRequest) -> PredictionObservation:
        """
        Attaches actual outcome to an existing prediction observation.
        Preserves original prediction parameters and metadata.
        """
        obs = None
        if request.prediction_id:
            obs = self.repository.get_observation(request.prediction_id)
        elif request.quotation_id:
            obs = self.repository.get_observation_by_quotation(request.quotation_id)

        if not obs:
            raise ValueError(
                f"Prediction observation not found for prediction_id='{request.prediction_id}' "
                f"or quotation_id='{request.quotation_id}'."
            )

        now_utc = request.outcome_timestamp or datetime.now(timezone.utc)
        obs.actual_outcome = request.actual_outcome
        obs.actual_revenue = request.actual_revenue
        obs.outcome_timestamp = now_utc.isoformat() if isinstance(now_utc, datetime) else str(now_utc)

        success = self.repository.update_observation(obs)
        if not success:
            logger.warning(f"Failed to persist feedback for observation {obs.prediction_id}.")

        logger.info(
            f"Attached feedback for prediction {obs.prediction_id} (quote {obs.quotation_id}): "
            f"actual_outcome={obs.actual_outcome.value} actual_rev={obs.actual_revenue}."
        )
        return obs
