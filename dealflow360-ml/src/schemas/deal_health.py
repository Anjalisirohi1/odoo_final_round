from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class HealthClassification(str, Enum):
    EXCELLENT = "EXCELLENT"
    HEALTHY = "HEALTHY"
    AT_RISK = "AT_RISK"
    CRITICAL = "CRITICAL"

class MomentumLabel(str, Enum):
    STRONG_POSITIVE = "STRONG_POSITIVE"
    POSITIVE = "POSITIVE"
    STABLE = "STABLE"
    DECLINING = "DECLINING"
    STAGNANT = "STAGNANT"

class ActionType(str, Enum):
    FOLLOW_UP_CUSTOMER = "FOLLOW_UP_CUSTOMER"
    REENGAGE_CUSTOMER = "REENGAGE_CUSTOMER"
    REVIEW_DISCOUNT = "REVIEW_DISCOUNT"
    VERIFY_COMMERCIAL_TERMS = "VERIFY_COMMERCIAL_TERMS"
    ESCALATE_TO_MANAGER = "ESCALATE_TO_MANAGER"
    PRIORITIZE_DEAL = "PRIORITIZE_DEAL"
    MONITOR_ACTIVITY = "MONITOR_ACTIVITY"

class ActionPriority(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class DealHealthRequest(BaseModel):
    quotation_id: str = Field(..., description="The unique ID of the quotation to analyze.")

class DimensionScores(BaseModel):
    conversion_potential: float = Field(..., ge=0.0, le=1.0)
    engagement: float = Field(..., ge=0.0, le=1.0)
    financial_health: float = Field(..., ge=0.0, le=1.0)
    momentum: float = Field(..., ge=0.0, le=1.0)
    risk_safety: float = Field(..., ge=0.0, le=1.0)

class MomentumResult(BaseModel):
    label: MomentumLabel
    score: float = Field(..., ge=0.0, le=1.0)
    evidence: Dict[str, Any] = Field(default_factory=dict)

class RecommendedAction(BaseModel):
    action_type: ActionType
    priority: ActionPriority
    reason: str
    evidence: Dict[str, Any] = Field(default_factory=dict)

class DealHealthResponse(BaseModel):
    quotation_id: str
    health_score: float = Field(..., ge=0.0, le=100.0)
    classification: HealthClassification
    dimension_scores: DimensionScores
    momentum: MomentumResult
    strengths: List[str]
    concerns: List[str]
    recommended_actions: List[RecommendedAction]
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
