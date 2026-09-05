from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class ExplanationMethod(str, Enum):
    SHAP = "SHAP"
    LINEAR_COEFFICIENT = "LINEAR_COEFFICIENT"
    TREE_FEATURE_IMPORTANCE = "TREE_FEATURE_IMPORTANCE"
    RULE_BASED = "RULE_BASED"
    DEVIATION_ANALYSIS = "DEVIATION_ANALYSIS"
    HYBRID_DECISION_SCORING = "HYBRID_DECISION_SCORING"
    ASSOCIATION_RULE_ANALYSIS = "ASSOCIATION_RULE_ANALYSIS"

class ImpactLevel(str, Enum):
    VERY_HIGH = "VERY_HIGH"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class DriverDirection(str, Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"

class ExplanationConfidence(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class DecisionDriver(BaseModel):
    feature: str
    label: str
    impact_level: ImpactLevel
    direction: DriverDirection
    reason: str
    value_context: Optional[str] = None
    contribution: Optional[float] = None

class FeatureContribution(BaseModel):
    feature: str
    label: str
    category: str
    raw_value: Any
    formatted_value: str
    contribution: float
    impact_level: ImpactLevel
    direction: DriverDirection
    reason: str

class ExplanationMetadata(BaseModel):
    model_name: str
    model_version: str
    explanation_method: ExplanationMethod
    generated_at: str
    feature_count: int
    significant_feature_count: int
    fallback_used: bool = False

class LocalExplanationResponse(BaseModel):
    quotation_id: str
    decision_type: str = "PREDICTION"
    summary: str
    positive_drivers: List[DecisionDriver]
    negative_drivers: List[DecisionDriver]
    feature_contributions: Optional[List[FeatureContribution]] = None
    explanation_confidence: ExplanationConfidence
    method: ExplanationMethod
    metadata: Optional[ExplanationMetadata] = None

class GlobalFeatureImportance(BaseModel):
    feature: str
    label: str
    category: str
    importance: float
    rank: int
    description: Optional[str] = None

class GlobalImportanceResponse(BaseModel):
    model_name: str
    model_version: str
    method: ExplanationMethod
    feature_importance: List[GlobalFeatureImportance]
    generated_at: str

class ModuleExplanationSummary(BaseModel):
    module_name: str
    summary: str
    method: str
    key_drivers: List[str] = Field(default_factory=list)
    confidence: Optional[str] = None

class UnifiedDealExplanationResponse(BaseModel):
    quotation_id: str
    executive_summary: str
    module_summaries: Dict[str, ModuleExplanationSummary] = Field(default_factory=dict)
    ai_consensus: List[str] = Field(default_factory=list)
    ai_conflicts: List[str] = Field(default_factory=list)
    overall_explanation_confidence: ExplanationConfidence
    generated_at: str
