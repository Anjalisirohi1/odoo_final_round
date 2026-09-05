from src.schemas.deal_health import HealthClassification
from src.core.constants import HEALTH_CLASSIFICATIONS

class HealthClassifier:
    """
    Classifies a numeric health score [0.0, 100.0] into discrete tiers:
    EXCELLENT, HEALTHY, AT_RISK, CRITICAL.
    """
    
    def __init__(
        self,
        excellent_threshold: float = None,
        healthy_threshold: float = None,
        at_risk_threshold: float = None
    ):
        self.excellent_threshold = (
            excellent_threshold if excellent_threshold is not None else HEALTH_CLASSIFICATIONS["EXCELLENT"]
        )
        self.healthy_threshold = (
            healthy_threshold if healthy_threshold is not None else HEALTH_CLASSIFICATIONS["HEALTHY"]
        )
        self.at_risk_threshold = (
            at_risk_threshold if at_risk_threshold is not None else HEALTH_CLASSIFICATIONS["AT_RISK"]
        )

    def classify(self, health_score: float) -> HealthClassification:
        """
        Deterministic classification mapping:
        80.00 <= score <= 100.00 -> EXCELLENT
        60.00 <= score < 80.00   -> HEALTHY
        40.00 <= score < 60.00   -> AT_RISK
        0.00  <= score < 40.00   -> CRITICAL
        """
        score = float(health_score)
        
        if score >= self.excellent_threshold:
            return HealthClassification.EXCELLENT
        elif score >= self.healthy_threshold:
            return HealthClassification.HEALTHY
        elif score >= self.at_risk_threshold:
            return HealthClassification.AT_RISK
        else:
            return HealthClassification.CRITICAL
