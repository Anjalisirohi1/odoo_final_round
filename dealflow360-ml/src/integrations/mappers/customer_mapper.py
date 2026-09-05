from typing import Dict, Any, Optional
from datetime import datetime
from src.domain.customer import Customer

class CustomerMapper:
    """
    Transforms persistence/API customer representations into canonical domain Customer entities.
    """

    @staticmethod
    def to_domain(data: Dict[str, Any]) -> Customer:
        created_at_val = data.get("created_at")
        if isinstance(created_at_val, str):
            try:
                created_at_val = datetime.fromisoformat(created_at_val)
            except Exception:
                created_at_val = None

        return Customer(
            customer_id=str(data.get("customer_id", "")),
            customer_name=str(data.get("customer_name", "Unknown Customer")),
            customer_tier=str(data.get("customer_tier", "BRONZE")).upper(),
            industry=str(data.get("industry", "General")),
            region=str(data.get("region", "Global")),
            historical_conversion_rate=data.get("historical_conversion_rate"),
            total_prior_quotes=int(data.get("total_prior_quotes", 0)),
            total_prior_orders=int(data.get("total_prior_orders", 0)),
            created_at=created_at_val,
            metadata=data.get("metadata", {})
        )
