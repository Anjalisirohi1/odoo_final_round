from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class QuotationItem(BaseModel):
    quote_item_id: str = Field(..., description="Quotation line item identifier")
    quotation_id: Optional[str] = None
    product_id: str = Field(..., description="Referenced product identifier")
    product_name: Optional[str] = None
    quantity: int = Field(..., gt=0, description="Item unit quantity")
    unit_price: float = Field(default=0.0, ge=0.0, description="Base unit price")
    discount_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Line discount percentage")
    discount_amount: float = Field(default=0.0, ge=0.0)
    final_price: float = Field(default=0.0, ge=0.0)
    cost_price: float = Field(default=0.0, ge=0.0)
    margin_amount: float = Field(default=0.0)
    margin_percentage: Optional[float] = None

class Quotation(BaseModel):
    quotation_id: str = Field(..., description="Unique quotation identifier")
    customer_id: str = Field(..., description="Customer identifier")
    sales_rep_id: Optional[str] = Field(default="rep_default")
    total_amount: float = Field(..., ge=0.0, description="Total quotation commercial value")
    total_discount: float = Field(default=0.0, ge=0.0, description="Total discount amount")
    total_margin: float = Field(default=0.0, description="Total gross margin amount")
    discount_percentage: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    margin_percentage: Optional[float] = Field(default=None)
    status: str = Field(default="DRAFT", description="Quotation status (e.g. DRAFT, SENT, ACCEPTED, REJECTED)")
    items: List[QuotationItem] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
