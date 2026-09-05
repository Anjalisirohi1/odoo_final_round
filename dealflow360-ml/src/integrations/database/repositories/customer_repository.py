from typing import Optional, Dict, Any
from ..connection import DatabaseConnection

class CustomerRepository:
    """
    Repository for customer record extraction from PostgreSQL/persistence storage.
    """
    def __init__(self, connection: Optional[DatabaseConnection] = None):
        self.connection = connection or DatabaseConnection()
        self._mock_store: Dict[str, Dict[str, Any]] = {}

    def set_mock_data(self, customers: Dict[str, Dict[str, Any]]):
        self._mock_store = dict(customers)

    def get_by_id(self, customer_id: str) -> Optional[Dict[str, Any]]:
        # In mock/offline mode or test environment
        if customer_id in self._mock_store:
            return self._mock_store[customer_id]
        return None
