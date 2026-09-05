from pydantic import BaseModel, Field
from typing import List, Optional

class RecommendationRequest(BaseModel):
    customer_id: Optional[str] = None
    product_ids: List[str] = Field(..., min_length=1)
    limit: int = Field(5, ge=1, le=50)

class RecommendationItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    score: float
    confidence: str
    reason: str
    expected_margin: float

class ModelMetadata(BaseModel):
    algorithm: str
    knowledge_base_version: str

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    total_candidates: int
    model_metadata: ModelMetadata
