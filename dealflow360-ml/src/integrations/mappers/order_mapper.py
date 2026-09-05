from typing import Dict, Any, List
from datetime import datetime
from src.domain.order import Order, OrderItem

class OrderMapper:
    """
    Transforms order and line items into canonical domain Order entities.
    """

    @staticmethod
    def to_item_domain(data: Dict[str, Any]) -> OrderItem:
        return OrderItem(
            order_item_id=str(data.get("order_item_id", data.get("item_id", "item_1"))),
            order_id=str(data.get("order_id", "")) if "order_id" in data else None,
            product_id=str(data.get("product_id", "")),
            quantity=max(1, int(data.get("quantity", 1))),
            unit_price=max(0.0, float(data.get("unit_price", 0.0))),
            discount_percentage=float(data.get("discount_percentage", 0.0))
        )

    @classmethod
    def to_domain(cls, data: Dict[str, Any]) -> Order:
        items = [cls.to_item_domain(it) for it in data.get("items", [])]
        order_date_val = data.get("order_date")
        if isinstance(order_date_val, str):
            try:
                order_date_val = datetime.fromisoformat(order_date_val)
            except Exception:
                order_date_val = None

        return Order(
            order_id=str(data.get("order_id", "")),
            customer_id=str(data.get("customer_id", "")),
            quotation_id=str(data.get("quotation_id", "")) if data.get("quotation_id") else None,
            total_amount=max(0.0, float(data.get("total_amount", 0.0))),
            status=str(data.get("status", "COMPLETED")).upper(),
            order_date=order_date_val,
            items=items,
            metadata=data.get("metadata", {})
        )
