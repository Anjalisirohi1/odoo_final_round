from src.schemas.prediction import ConfidenceLevel, ConfidenceResult
from src.core.config import settings

class ConfidenceEstimator:
    """
    Computes statistical prediction confidence based on decision boundary distance.
    """
    
    def __init__(
        self,
        high_threshold: float = None,
        medium_threshold: float = None
    ):
        self.high_threshold = high_threshold if high_threshold is not None else settings.CONFIDENCE_HIGH_THRESHOLD
        self.medium_threshold = medium_threshold if medium_threshold is not None else settings.CONFIDENCE_MEDIUM_THRESHOLD

    def estimate(self, probability: float) -> ConfidenceResult:
        prob = min(1.0, max(0.0, float(probability)))
        
        # Distance from uncertainty threshold (0.50)
        score = min(1.0, max(0.0, abs(prob - 0.5) * 2.0))
        
        if score >= self.high_threshold:
            level = ConfidenceLevel.HIGH
        elif score >= self.medium_threshold:
            level = ConfidenceLevel.MEDIUM
        else:
            level = ConfidenceLevel.LOW
            
        return ConfidenceResult(level=level, score=round(score, 4))
