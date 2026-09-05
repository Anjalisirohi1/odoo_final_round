import logging
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from src.schemas.mlops import PredictionObservation, ActualOutcome
from .prediction_repository import PredictionObservationRepository, FilePredictionObservationRepository

logger = logging.getLogger(__name__)

# Sensitive keys that should never be logged into feature monitoring snapshots
PII_EXCLUSION_KEYS = {
    "customer_name", "email", "phone", "contact_name", "address",
    "street", "zip_code", "tax_id", "password", "token", "auth"
}

class PredictionLogger:
    """
    Logs online prediction observations safely into append-friendly storage.
    Guarantees privacy filtering (no PII) and graceful error isolation.
    """

    def __init__(self, repository: Optional[PredictionObservationRepository] = None):
        self.repository = repository or FilePredictionObservationRepository()

    def sanitize_features(self, raw_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Strips PII and retains purely ML feature signals for drift monitoring.
        """
        sanitized = {}
        for k, v in (raw_features or {}).items():
            k_lower = str(k).lower()
            if any(pii in k_lower for pii in PII_EXCLUSION_KEYS):
                continue
            # Keep numbers, strings, and booleans
            if isinstance(v, (int, float, str, bool)) or v is None:
                sanitized[str(k)] = v
        return sanitized

    def log_prediction(
        self,
        model_name: str,
        model_version: str,
        quotation_id: str,
        predicted_outcome: str,
        conversion_probability: float,
        confidence: str,
        expected_revenue: float,
        raw_features: Optional[Dict[str, Any]] = None,
        custom_now: Optional[datetime] = None
    ) -> Optional[PredictionObservation]:
        """
        Asynchronously or synchronously records a prediction event without disrupting serving.
        """
        try:
            now_utc = custom_now or datetime.now(timezone.utc)
            prediction_id = f"pred_{now_utc.strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"

            sanitized_features = self.sanitize_features(raw_features or {})

            obs = PredictionObservation(
                prediction_id=prediction_id,
                model_name=model_name,
                model_version=model_version,
                quotation_id=quotation_id,
                predicted_outcome=predicted_outcome,
                conversion_probability=round(float(conversion_probability), 4),
                confidence=confidence,
                expected_revenue=round(float(expected_revenue), 2),
                timestamp=now_utc.isoformat(),
                feature_snapshot=sanitized_features,
                actual_outcome=ActualOutcome.PENDING
            )

            self.repository.append_observation(obs)
            return obs
        except Exception as e:
            # Graceful degradation: never crash prediction flow on logging error
            logger.warning(f"Failed to log prediction observation for quote {quotation_id}: {e}")
            return None
