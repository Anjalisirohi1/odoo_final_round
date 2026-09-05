from typing import List, Dict, Any, Optional
from ..connection import DatabaseConnection

class OrderRepository:
    """
    Repository for customer order history.
    """
    def __init__(self, connection: Optional[DatabaseConnection] = None):
        self.connection = connection or DatabaseConnection()
        self._mock_orders_by_customer: Dict[str, List[Dict[str, Any]]] = {}

    def set_mock_data(self, orders_by_customer: Dict[str, List[Dict[str, Any]]]):
        self._mock_orders_by_customer = dict(orders_by_customer)

    def get_by_customer_id(self, customer_id: str) -> List[Dict[str, Any]]:
        return self._mock_orders_by_customer.get(customer_id, [])
