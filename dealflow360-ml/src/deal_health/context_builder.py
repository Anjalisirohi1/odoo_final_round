from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import pandas as pd

@dataclass
class DealContext:
    quotation_id: str
    quotation: Dict[str, Any]
    customer: Optional[Dict[str, Any]] = None
    quotation_items: List[Dict[str, Any]] = field(default_factory=list)
    customer_orders: List[Dict[str, Any]] = field(default_factory=list)
    customer_quotations: List[Dict[str, Any]] = field(default_factory=list)
    deal_events: List[Dict[str, Any]] = field(default_factory=list)
    sales_rep: Optional[Dict[str, Any]] = None
    now: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class DealContextBuilder:
    """
    Collects and organizes all historical, relational, and temporal data
    for a specific deal/quotation into a unified DealContext object.
    """
    
    def __init__(
        self,
        quotations: Optional[List[Dict[str, Any]]] = None,
        customers: Optional[List[Dict[str, Any]]] = None,
        quotation_items: Optional[List[Dict[str, Any]]] = None,
        orders: Optional[List[Dict[str, Any]]] = None,
        deal_events: Optional[List[Dict[str, Any]]] = None,
        sales_reps: Optional[List[Dict[str, Any]]] = None
    ):
        self.quotations_map: Dict[str, Dict[str, Any]] = {
            q["quotation_id"]: q for q in (quotations or [])
        }
        self.customers_map: Dict[str, Dict[str, Any]] = {
            c["customer_id"]: c for c in (customers or [])
        }
        self.sales_reps_map: Dict[str, Dict[str, Any]] = {
            r["sales_rep_id"]: r for r in (sales_reps or [])
        }
        
        # Group items by quotation_id
        self.items_by_quote: Dict[str, List[Dict[str, Any]]] = {}
        for item in (quotation_items or []):
            q_id = item.get("quotation_id")
            if q_id:
                self.items_by_quote.setdefault(q_id, []).append(item)
                
        # Group events by quotation_id
        self.events_by_quote: Dict[str, List[Dict[str, Any]]] = {}
        for evt in (deal_events or []):
            q_id = evt.get("quotation_id")
            if q_id:
                self.events_by_quote.setdefault(q_id, []).append(evt)
                
        # Group orders and quotations by customer_id
        self.orders_by_customer: Dict[str, List[Dict[str, Any]]] = {}
        for o in (orders or []):
            c_id = o.get("customer_id")
            if c_id:
                self.orders_by_customer.setdefault(c_id, []).append(o)
                
        self.quotes_by_customer: Dict[str, List[Dict[str, Any]]] = {}
        for q in (quotations or []):
            c_id = q.get("customer_id")
            if c_id:
                self.quotes_by_customer.setdefault(c_id, []).append(q)

    def build_context(self, quotation_id: str, custom_now: Optional[datetime] = None) -> Optional[DealContext]:
        """
        Builds a DealContext for the given quotation_id.
        Returns None if quotation_id is not found.
        """
        quotation = self.quotations_map.get(quotation_id)
        if not quotation:
            return None
            
        customer_id = quotation.get("customer_id")
        sales_rep_id = quotation.get("sales_rep_id")
        
        customer = self.customers_map.get(customer_id) if customer_id else None
        sales_rep = self.sales_reps_map.get(sales_rep_id) if sales_rep_id else None
        
        quote_items = self.items_by_quote.get(quotation_id, [])
        deal_events = self.events_by_quote.get(quotation_id, [])
        customer_orders = self.orders_by_customer.get(customer_id, []) if customer_id else []
        customer_quotations = self.quotes_by_customer.get(customer_id, []) if customer_id else []
        
        now = custom_now or datetime.now(timezone.utc)
        
        return DealContext(
            quotation_id=quotation_id,
            quotation=quotation,
            customer=customer,
            quotation_items=quote_items,
            customer_orders=customer_orders,
            customer_quotations=customer_quotations,
            deal_events=deal_events,
            sales_rep=sales_rep,
            now=now
        )
