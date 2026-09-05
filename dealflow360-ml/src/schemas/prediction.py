from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class PredictionOutcome(str, Enum):
    LIKELY_TO_CONVERT = "LIKELY_TO_CONVERT"
    UNCERTAIN = "UNCERTAIN"
    LIKELY_TO_LOSE = "LIKELY_TO_LOSE"

class ConfidenceLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class PriorityClassification(str, Enum):
    CRITICAL_ATTENTION = "CRITICAL_ATTENTION"
    HIGH_PRIORITY = "HIGH_PRIORITY"
    MEDIUM_PRIORITY = "MEDIUM_PRIORITY"
    LOW_PRIORITY = "LOW_PRIORITY"

class ImpactDirection(str, Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"

class PredictionRequest(BaseModel):
    quotation_id: str = Field(..., description="The ID of the quotation to evaluate.")

class ConfidenceResult(BaseModel):
    level: ConfidenceLevel
    score: float = Field(..., ge=0.0, le=1.0)

class RevenueForecast(BaseModel):
    quotation_value: float = Field(..., ge=0.0)
    conversion_probability: float = Field(..., ge=0.0, le=1.0)
    expected_revenue: float = Field(..., ge=0.0)

class PriorityResult(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0)
    classification: PriorityClassification
    components: Dict[str, float] = Field(default_factory=dict)

class FeatureImpact(BaseModel):
    feature: str
    impact: ImpactDirection
    importance: float
    description: str

class ModelMetadata(BaseModel):
    model_name: str
    model_version: str
    trained_at: str
    metrics: Dict[str, Any] = Field(default_factory=dict)

class PredictionResponse(BaseModel):
    quotation_id: str
    conversion_probability: float = Field(..., ge=0.0, le=1.0)
    predicted_outcome: PredictionOutcome
    confidence: ConfidenceResult
    revenue_forecast: RevenueForecast
    priority: PriorityResult
    top_positive_factors: List[FeatureImpact]
    top_negative_factors: List[FeatureImpact]
    model_metadata: ModelMetadata
    predicted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
