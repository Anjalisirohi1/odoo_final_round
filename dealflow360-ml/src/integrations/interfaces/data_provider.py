from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

class GenericDataProvider(ABC):
    """
    Abstract contract for low-level data extraction.
    """
    @abstractmethod
    def fetch_quotation(self, quotation_id: str) -> Optional[Dict[str, Any]]: pass
    @abstractmethod
    def fetch_customer(self, customer_id: str) -> Optional[Dict[str, Any]]: pass
    @abstractmethod
    def fetch_quotation_items(self, quotation_id: str) -> List[Dict[str, Any]]: pass
    @abstractmethod
    def fetch_customer_orders(self, customer_id: str) -> List[Dict[str, Any]]: pass
    @abstractmethod
    def fetch_deal_events(self, quotation_id: str) -> List[Dict[str, Any]]: pass
