from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    order_item_id: str = Field(..., description="Order item identifier")
    order_id: Optional[str] = None
    product_id: str = Field(..., description="Product identifier")
    quantity: int = Field(default=1, gt=0)
    unit_price: float = Field(default=0.0, ge=0.0)
    discount_percentage: float = Field(default=0.0, ge=0.0, le=100.0)

class Order(BaseModel):
    order_id: str = Field(..., description="Unique order identifier")
    customer_id: str = Field(..., description="Customer identifier")
    quotation_id: Optional[str] = None
    total_amount: float = Field(default=0.0, ge=0.0)
    status: str = Field(default="COMPLETED")
    order_date: Optional[datetime] = None
    items: List[OrderItem] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
