from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime

class Customer(BaseModel):
    customer_id: str
    customer_name: str
    customer_tier: str
    industry: str
    region: str
    created_at: datetime

class Product(BaseModel):
    product_id: str
    product_name: str
    category: str
    selling_price: float = Field(ge=0.0)
    cost_price: float = Field(ge=0.0)
    margin_percentage: float
    active: bool

class SalesRepresentative(BaseModel):
    sales_rep_id: str
    name: str
    team_id: str
    region: str

class Quotation(BaseModel):
    quotation_id: str
    customer_id: str
    sales_rep_id: str
    total_amount: float = Field(ge=0.0)
    total_discount: float = Field(ge=0.0)
    total_margin: float
    status: str
    created_at: datetime
    updated_at: datetime

class QuotationItem(BaseModel):
    quote_item_id: str
    quotation_id: str
    product_id: str
    quantity: int = Field(gt=0)
    original_price: float = Field(ge=0.0)
    discount_percentage: float = Field(ge=0.0, le=100.0)
    discount_amount: float = Field(ge=0.0)
    final_price: float = Field(ge=0.0)
    cost_price: float = Field(ge=0.0)
    margin_amount: float

class Order(BaseModel):
    order_id: str
    customer_id: str
    quotation_id: str
    order_date: datetime
    total_amount: float = Field(ge=0.0)
    status: str

class OrderItem(BaseModel):
    order_item_id: str
    order_id: str
    product_id: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0.0)
    discount_percentage: float = Field(ge=0.0, le=100.0)

class ApprovalHistory(BaseModel):
    approval_id: str
    quotation_id: str
    approval_level: int
    approver_id: str
    status: str
    requested_at: datetime
    completed_at: Optional[datetime] = None

class DealEvent(BaseModel):
    event_id: str
    quotation_id: str
    event_type: str
    actor_id: str
    actor_type: str
    created_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Inventory(BaseModel):
    inventory_id: str
    warehouse_id: str
    product_id: str
    available_quantity: int = Field(ge=0)
    reserved_quantity: int = Field(ge=0)
    updated_at: datetime

class Warehouse(BaseModel):
    warehouse_id: str
    warehouse_name: str
    region: str
    city: str
    active: bool

class Fulfillment(BaseModel):
    fulfillment_id: str
    order_id: str
    warehouse_id: str
    promised_delivery_date: datetime
    shipped_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    status: str
    created_at: datetime
