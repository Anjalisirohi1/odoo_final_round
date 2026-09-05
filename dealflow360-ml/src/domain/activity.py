from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class DealActivity(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    quotation_id: str = Field(..., description="Referenced quotation identifier")
    event_type: str = Field(..., description="Activity type (e.g. QUOTATION_VIEWED, EMAIL_OPENED, CALL_LOGGED)")
    actor_id: str = Field(default="system", description="User or contact performing event")
    actor_type: str = Field(default="CUSTOMER", description="CUSTOMER or SALES_REP")
    created_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
