from pydantic import BaseModel, Field
from typing import List, Dict, Any

class QuotationAnomalyRequest(BaseModel):
    quotation_id: str = Field(..., description="The ID of the quotation to analyze.")

class DeviationSignal(BaseModel):
    feature: str
    severity: str
    description: str

class ModelMetadata(BaseModel):
    algorithm: str
    version: str

class QuotationAnomalyResponse(BaseModel):
    quotation_id: str
    is_anomaly: bool
    anomaly_score: float = Field(..., ge=0.0, le=1.0)
    risk_level: str
    summary: str
    primary_reasons: List[str]
    deviations: List[Dict[str, Any]]
    model_metadata: ModelMetadata
