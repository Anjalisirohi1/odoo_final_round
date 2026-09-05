from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class Product(BaseModel):
    product_id: str = Field(..., description="Unique product identifier")
    product_name: str = Field(..., description="Product commercial name")
    category: str = Field(default="General", description="Product category or family")
    selling_price: float = Field(default=0.0, ge=0.0, description="Catalog selling unit price")
    cost_price: float = Field(default=0.0, ge=0.0, description="Unit cost price")
    margin_percentage: Optional[float] = Field(default=None, description="Standard gross margin percentage")
    active: bool = Field(default=True)
    metadata: Dict[str, Any] = Field(default_factory=dict)
