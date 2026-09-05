from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from src.domain.business_context import BusinessContext
from .customer_mapper import CustomerMapper
from .quotation_mapper import QuotationMapper
from .product_mapper import ProductMapper
from .order_mapper import OrderMapper
from .activity_mapper import ActivityMapper

class BusinessContextMapper:
    """
    Assembles domain entities from raw dictionaries into a unified canonical BusinessContext.
    """

    @classmethod
    def to_domain(
        cls,
        quotation_data: Dict[str, Any],
        customer_data: Dict[str, Any],
        quotation_items_data: Optional[List[Dict[str, Any]]] = None,
        products_data: Optional[List[Dict[str, Any]]] = None,
        orders_data: Optional[List[Dict[str, Any]]] = None,
        events_data: Optional[List[Dict[str, Any]]] = None,
        sales_rep_data: Optional[Dict[str, Any]] = None,
        source: str = "canonical"
    ) -> BusinessContext:
        quotation = QuotationMapper.to_domain(quotation_data, items_data=quotation_items_data)
        customer = CustomerMapper.to_domain(customer_data)
        products = [ProductMapper.to_domain(p) for p in (products_data or [])]
        orders = [OrderMapper.to_domain(o) for o in (orders_data or [])]
        events = [ActivityMapper.to_domain(e) for e in (events_data or [])]

        return BusinessContext(
            quotation=quotation,
            customer=customer,
            quotation_items=quotation.items,
            products=products,
            historical_orders=orders,
            deal_events=events,
            sales_rep=sales_rep_data,
            source=source,
            retrieved_at=datetime.now(timezone.utc),
            context_version="1.0.0"
        )
