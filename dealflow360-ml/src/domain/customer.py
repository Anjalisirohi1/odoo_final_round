from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class Customer(BaseModel):
    customer_id: str = Field(..., description="Unique customer identifier")
    customer_name: str = Field(..., description="Customer legal or business name")
    customer_tier: str = Field(default="BRONZE", description="Account tier (e.g. PLATINUM, GOLD, SILVER, BRONZE)")
    industry: str = Field(default="General", description="Industry classification")
    region: str = Field(default="Global", description="Geographic sales region")
    historical_conversion_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    total_prior_quotes: int = Field(default=0, ge=0)
    total_prior_orders: int = Field(default=0, ge=0)
    created_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
