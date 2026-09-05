import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

from src.domain.business_context import BusinessContext
from src.integrations.interfaces.business_context_provider import BusinessContextProvider
from src.integrations.mappers.business_context_mapper import BusinessContextMapper
from src.data.providers.synthetic_provider import SyntheticDataProvider

logger = logging.getLogger(__name__)

class SyntheticBusinessContextProvider(BusinessContextProvider):
    """
    BusinessContextProvider backed by in-memory collections or synthetic data generation.
    Used for local development, reproducible testing, and offline evaluation.
    """

    def __init__(
        self,
        quotations_map: Optional[Dict[str, Dict[str, Any]]] = None,
        customers_map: Optional[Dict[str, Dict[str, Any]]] = None,
        items_by_quote: Optional[Dict[str, List[Dict[str, Any]]]] = None,
        orders_by_customer: Optional[Dict[str, List[Dict[str, Any]]]] = None,
        events_by_quote: Optional[Dict[str, List[Dict[str, Any]]]] = None,
        products_map: Optional[Dict[str, Dict[str, Any]]] = None
    ):
        self.quotations_map = dict(quotations_map or {})
        self.customers_map = dict(customers_map or {})
        self.items_by_quote = dict(items_by_quote or {})
        self.orders_by_customer = dict(orders_by_customer or {})
        self.events_by_quote = dict(events_by_quote or {})
        self.products_map = dict(products_map or {})

    @property
    def provider_type(self) -> str:
        return "synthetic"

    def populate_from_synthetic_provider(self, provider: SyntheticDataProvider) -> None:
        quotes = [q.model_dump() for q in provider.get_quotations()]
        self.quotations_map = {q["quotation_id"]: q for q in quotes}

        custs = [c.model_dump() for c in provider.get_customers()]
        self.customers_map = {c["customer_id"]: c for c in custs}

        prods = [p.model_dump() for p in provider.get_products()]
        self.products_map = {p["product_id"]: p for p in prods}

        self.items_by_quote = {}
        for it in [qi.model_dump() for qi in provider.get_quotation_items()]:
            q_id = it.get("quotation_id")
            if q_id:
                self.items_by_quote.setdefault(q_id, []).append(it)

        self.events_by_quote = {}
        for ev in [e.model_dump() for e in provider.get_deal_events()]:
            q_id = ev.get("quotation_id")
            if q_id:
                self.events_by_quote.setdefault(q_id, []).append(ev)

        self.orders_by_customer = {}
        for ord_dict in [o.model_dump() for o in provider.get_orders()]:
            c_id = ord_dict.get("customer_id")
            if c_id:
                self.orders_by_customer.setdefault(c_id, []).append(ord_dict)

    def get_business_context(self, quotation_id: str) -> Optional[BusinessContext]:
        quote_data = self.quotations_map.get(quotation_id)
        if not quote_data:
            return None

        customer_id = quote_data.get("customer_id")
        customer_data = self.customers_map.get(customer_id, {
            "customer_id": customer_id or "cust_unknown",
            "customer_name": "Standard Customer",
            "customer_tier": "BRONZE"
        })

        items_data = self.items_by_quote.get(quotation_id, [])
        orders_data = self.orders_by_customer.get(customer_id, [])
        events_data = self.events_by_quote.get(quotation_id, [])
        products_data = list(self.products_map.values())

        return BusinessContextMapper.to_domain(
            quotation_data=quote_data,
            customer_data=customer_data,
            quotation_items_data=items_data,
            products_data=products_data,
            orders_data=orders_data,
            events_data=events_data,
            source="synthetic"
        )

    def health_check(self) -> Dict[str, Any]:
        return {
            "status": "ready",
            "provider": "synthetic",
            "quotation_count": len(self.quotations_map),
            "customer_count": len(self.customers_map)
        }
