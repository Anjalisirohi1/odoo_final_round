from typing import Dict, Any
from dataclasses import dataclass
from src.core.constants import DEFAULT_HEALTH_WEIGHTS

@dataclass
class HealthScoreResult:
    normalized_score: float
    health_score: float
    dimension_scores: Dict[str, float]
    weighted_contributions: Dict[str, float]
    weights_used: Dict[str, float]

class HealthAggregator:
    """
    Aggregates normalized dimension scores [0.0, 1.0] into a final
    composite Deal Health score [0.0, 100.0] using configurable weights.
    """
    
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_HEALTH_WEIGHTS.copy()
        self.validate_weights()

    def validate_weights(self):
        total = sum(self.weights.values())
        if not abs(total - 1.0) < 1e-5:
            raise ValueError(f"Health weights must sum to 1.0, got {total}")

    def aggregate(
        self,
        conversion_potential: float,
        engagement: float,
        financial_health: float,
        momentum: float,
        risk_safety: float
    ) -> HealthScoreResult:
        # Clamp inputs to [0.0, 1.0]
        c = min(1.0, max(0.0, conversion_potential))
        e = min(1.0, max(0.0, engagement))
        f = min(1.0, max(0.0, financial_health))
        m = min(1.0, max(0.0, momentum))
        r = min(1.0, max(0.0, risk_safety))
        
        dim_scores = {
            "conversion_potential": c,
            "engagement": e,
            "financial_health": f,
            "momentum": m,
            "risk_safety": r
        }
        
        weighted_contribs = {
            k: round(dim_scores[k] * self.weights[k], 4) for k in dim_scores
        }
        
        normalized_score = sum(weighted_contribs.values())
        normalized_score = min(1.0, max(0.0, normalized_score))
        
        health_score = round(normalized_score * 100.0, 2)
        
        return HealthScoreResult(
            normalized_score=round(normalized_score, 4),
            health_score=health_score,
            dimension_scores=dim_scores,
            weighted_contributions=weighted_contribs,
            weights_used=self.weights
        )
