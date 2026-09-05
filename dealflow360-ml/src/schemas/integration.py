from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

from src.schemas.prediction import PredictionResponse
from src.schemas.deal_health import DealHealthResponse
from src.schemas.anomaly import AnomalyResponse
from src.schemas.deal_intelligence import OverallAssessment, TimelineItem, PrioritizedAction, TopInsight
from src.schemas.explainability import LocalExplanationResponse

class BusinessContextRequest(BaseModel):
    quotation: Dict[str, Any] = Field(..., description="Quotation dictionary or entity")
    customer: Dict[str, Any] = Field(..., description="Customer dictionary or entity")
    quotation_items: List[Dict[str, Any]] = Field(default_factory=list, description="Quotation line items")
    products: List[Dict[str, Any]] = Field(default_factory=list, description="Referenced products")
    orders: List[Dict[str, Any]] = Field(default_factory=list, description="Historical customer orders")
    deal_events: List[Dict[str, Any]] = Field(default_factory=list, description="Deal progression touchpoints")
    sales_rep: Optional[Dict[str, Any]] = None

class IntelligenceMetadata(BaseModel):
    data_source: str = "synthetic"
    data_provider: str = "synthetic"
    model_version: str = "1.0.0"
    generated_at: str
    latency_ms: Optional[float] = None

class UnifiedIntelligenceResponse(BaseModel):
    quotation_id: str
    overall_assessment: Optional[OverallAssessment] = None
    prediction: Optional[PredictionResponse] = None
    deal_health: Optional[DealHealthResponse] = None
    anomaly: Optional[AnomalyResponse] = None
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    explanations: Optional[LocalExplanationResponse] = None
    top_insights: List[TopInsight] = Field(default_factory=list)
    recommended_actions: List[PrioritizedAction] = Field(default_factory=list)
    intelligence_timeline: List[TimelineItem] = Field(default_factory=list)
    metadata: IntelligenceMetadata

class ReadinessResponse(BaseModel):
    service: str = "ready"
    data_provider: str
    database: str
    models: Dict[str, str]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
