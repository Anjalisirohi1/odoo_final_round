from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from src.domain.business_context import BusinessContext

class BusinessContextProvider(ABC):
    """
    Abstract interface for retrieving and assembling business context for deal intelligence.
    Decouples ML models from specific persistence mechanisms (PostgreSQL, REST API, Synthetic).
    """

    @property
    @abstractmethod
    def provider_type(self) -> str:
        """Returns provider identifier: 'synthetic', 'database', or 'api'."""
        pass

    @abstractmethod
    def get_business_context(self, quotation_id: str) -> Optional[BusinessContext]:
        """
        Retrieves all domain entities associated with quotation_id and constructs a canonical BusinessContext.
        """
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """
        Verifies connectivity and operational readiness of the data source.
        """
        pass
