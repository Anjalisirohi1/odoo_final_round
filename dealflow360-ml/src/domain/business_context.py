from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field

from .customer import Customer
from .product import Product
from .quotation import Quotation, QuotationItem
from .order import Order
from .activity import DealActivity

class BusinessContext(BaseModel):
    """
    Canonical ML Business Context aggregating all required domain entities
    for intelligence inference, anomaly detection, health scoring, forecasting, and XAI.
    """
    quotation: Quotation
    customer: Customer
    quotation_items: List[QuotationItem] = Field(default_factory=list)
    products: List[Product] = Field(default_factory=list)
    historical_orders: List[Order] = Field(default_factory=list)
    deal_events: List[DealActivity] = Field(default_factory=list)
    sales_rep: Optional[Dict[str, Any]] = None

    source: str = Field(default="canonical", description="Origin of business context (e.g. postgresql, api, synthetic)")
    retrieved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    context_version: str = Field(default="1.0.0")
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def to_quotation_dict(self) -> Dict[str, Any]:
        d = self.quotation.model_dump()
        if "created_at" in d and d["created_at"] is not None:
            d["created_at"] = str(d["created_at"])
        if "updated_at" in d and d["updated_at"] is not None:
            d["updated_at"] = str(d["updated_at"])
        return d

    def to_customer_dict(self) -> Dict[str, Any]:
        d = self.customer.model_dump()
        if "created_at" in d and d["created_at"] is not None:
            d["created_at"] = str(d["created_at"])
        return d

    def to_items_list(self) -> List[Dict[str, Any]]:
        return [item.model_dump() for item in self.quotation_items]

    def to_orders_list(self) -> List[Dict[str, Any]]:
        orders = []
        for o in self.historical_orders:
            od = o.model_dump()
            if "order_date" in od and od["order_date"] is not None:
                od["order_date"] = str(od["order_date"])
            orders.append(od)
        return orders

    def to_events_list(self) -> List[Dict[str, Any]]:
        events = []
        for e in self.deal_events:
            ed = e.model_dump()
            if "created_at" in ed and ed["created_at"] is not None:
                ed["created_at"] = str(ed["created_at"])
            events.append(ed)
        return events
