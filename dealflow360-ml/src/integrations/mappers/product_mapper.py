from typing import Dict, Any
from src.domain.product import Product

class ProductMapper:
    """
    Transforms raw product records into canonical domain Product entities.
    """

    @staticmethod
    def to_domain(data: Dict[str, Any]) -> Product:
        selling = float(data.get("selling_price", 0.0))
        cost = float(data.get("cost_price", 0.0))
        margin = data.get("margin_percentage")
        if margin is None and selling > 0:
            margin = ((selling - cost) / selling) * 100.0

        return Product(
            product_id=str(data.get("product_id", "")),
            product_name=str(data.get("product_name", "Unknown Product")),
            category=str(data.get("category", "General")),
            selling_price=max(0.0, selling),
            cost_price=max(0.0, cost),
            margin_percentage=margin,
            active=bool(data.get("active", True)),
            metadata=data.get("metadata", {})
        )
