from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class ModuleName(str, Enum):
    RECOMMENDATION = "RECOMMENDATION"
    ANOMALY_DETECTION = "ANOMALY_DETECTION"
    DEAL_HEALTH = "DEAL_HEALTH"
    PREDICTION = "PREDICTION"

class ModuleAvailability(str, Enum):
    AVAILABLE = "AVAILABLE"
    UNAVAILABLE = "UNAVAILABLE"
    DEGRADED = "DEGRADED"
    FAILED = "FAILED"

class SignalDirection(str, Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"

class InsightImportance(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class BusinessImpactLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class IntelligenceClassification(str, Enum):
    STRONG_OPPORTUNITY = "STRONG_OPPORTUNITY"
    POSITIVE = "POSITIVE"
    MIXED = "MIXED"
    AT_RISK = "AT_RISK"
    CRITICAL = "CRITICAL"

class DealIntelligenceRequest(BaseModel):
    quotation_id: str = Field(..., description="The ID of the quotation to evaluate.")
    include: Optional[List[str]] = Field(
        default=None,
        description="Optional list of intelligence modules to include (defaults to all)."
    )

class ModuleStatusDetail(BaseModel):
    status: ModuleAvailability
    reason: Optional[str] = None
    latency_ms: Optional[float] = None

class OverallAssessment(BaseModel):
    intelligence_score: float = Field(..., ge=0.0, le=100.0)
    classification: IntelligenceClassification
    business_impact: BusinessImpactLevel
    summary: str
    confidence: str = Field(default="HIGH", description="Confidence level in synthesized assessment.")

class IntelligenceSignal(BaseModel):
    title: str
    source: str
    importance: InsightImportance
    description: str
    category: Optional[str] = None
    direction: Optional[SignalDirection] = None
    score: Optional[float] = None
    raw_score: Optional[float] = None
    evidence: Dict[str, Any] = Field(default_factory=dict)

class SignalAgreement(BaseModel):
    type: str
    confidence: str
    description: str
    participating_modules: List[str]

class SignalConflict(BaseModel):
    type: str
    severity: InsightImportance
    description: str
    participating_modules: List[str]

class UnifiedRecommendedAction(BaseModel):
    action: str
    urgency: InsightImportance
    reason: str
    supporting_signals: List[str]
    expected_impact: Optional[str] = None

class ExecutiveInsight(BaseModel):
    title: str
    importance: InsightImportance
    source: str
    description: str
    category: Optional[str] = None

class IntelligenceTimelineItem(BaseModel):
    timestamp: str
    event_type: str
    title: str
    source: str
    importance: InsightImportance
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DealIntelligenceResponse(BaseModel):
    quotation_id: str
    overall_assessment: OverallAssessment
    module_status: Dict[str, ModuleStatusDetail]
    key_positive_signals: List[IntelligenceSignal]
    key_risks: List[IntelligenceSignal]
    signal_agreements: List[SignalAgreement]
    signal_conflicts: List[SignalConflict]
    recommended_actions: List[UnifiedRecommendedAction]
    top_insights: List[ExecutiveInsight]
    intelligence_timeline: List[IntelligenceTimelineItem]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
