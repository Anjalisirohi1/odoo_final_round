from dataclasses import dataclass, field
from typing import Dict, Any, Optional
from src.schemas.deal_intelligence import SignalDirection, InsightImportance, ModuleName

@dataclass
class NormalizedSignal:
    source: str
    category: str
    signal_type: str
    direction: SignalDirection
    severity: InsightImportance
    title: str
    description: str
    raw_score: Optional[float] = None
    normalized_score: Optional[float] = None
    confidence: str = "HIGH"
    evidence: Dict[str, Any] = field(default_factory=dict)

class SignalNormalizer:
    """
    Normalizes multi-modal signals onto standardized scales while preserving
    semantic direction, scale, and domain significance.
    """

    @staticmethod
    def normalize_score(raw_score: Optional[float], min_val: float = 0.0, max_val: float = 1.0) -> float:
        """Clamps and scales raw score between 0.0 and 1.0."""
        if raw_score is None:
            return 0.0
        if max_val <= min_val:
            return 0.0
        val = (raw_score - min_val) / (max_val - min_val)
        return round(max(0.0, min(1.0, float(val))), 4)

    @staticmethod
    def normalize_health_score(health_score: Optional[float]) -> float:
        """Converts deal health score from 0-100 to 0.0-1.0."""
        return SignalNormalizer.normalize_score(health_score, min_val=0.0, max_val=100.0)

    @staticmethod
    def normalize_priority_score(priority_score: Optional[float]) -> float:
        """Converts priority score from 0-100 to 0.0-1.0."""
        return SignalNormalizer.normalize_score(priority_score, min_val=0.0, max_val=100.0)

    @staticmethod
    def map_risk_level_to_importance(risk_level: str) -> InsightImportance:
        mapping = {
            "CRITICAL": InsightImportance.CRITICAL,
            "HIGH": InsightImportance.HIGH,
            "MEDIUM": InsightImportance.MEDIUM,
            "LOW": InsightImportance.LOW
        }
        return mapping.get(risk_level.upper(), InsightImportance.MEDIUM)

    @staticmethod
    def map_action_priority_to_importance(priority: str) -> InsightImportance:
        mapping = {
            "CRITICAL": InsightImportance.CRITICAL,
            "HIGH": InsightImportance.HIGH,
            "MEDIUM": InsightImportance.MEDIUM,
            "LOW": InsightImportance.LOW
        }
        return mapping.get(str(priority).upper(), InsightImportance.MEDIUM)
