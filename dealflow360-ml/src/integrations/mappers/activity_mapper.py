from typing import Dict, Any
from datetime import datetime
from src.domain.activity import DealActivity

class ActivityMapper:
    """
    Transforms event and CRM touchpoint logs into canonical DealActivity domain entities.
    """

    @staticmethod
    def to_domain(data: Dict[str, Any]) -> DealActivity:
        created_at_val = data.get("created_at")
        if isinstance(created_at_val, str):
            try:
                created_at_val = datetime.fromisoformat(created_at_val)
            except Exception:
                created_at_val = None

        return DealActivity(
            event_id=str(data.get("event_id", data.get("activity_id", "evt_1"))),
            quotation_id=str(data.get("quotation_id", "")),
            event_type=str(data.get("event_type", data.get("activity_type", "TOUCHPOINT"))).upper(),
            actor_id=str(data.get("actor_id", "system")),
            actor_type=str(data.get("actor_type", "CUSTOMER")).upper(),
            created_at=created_at_val,
            metadata=data.get("metadata", {})
        )
