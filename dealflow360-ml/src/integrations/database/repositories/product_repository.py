from typing import Optional, List, Dict, Any
from ..connection import DatabaseConnection

class ProductRepository:
    """
    Repository for product catalog data.
    """
    def __init__(self, connection: Optional[DatabaseConnection] = None):
        self.connection = connection or DatabaseConnection()
        self._mock_store: Dict[str, Dict[str, Any]] = {}

    def set_mock_data(self, products: Dict[str, Dict[str, Any]]):
        self._mock_store = dict(products)

    def get_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        return self._mock_store.get(product_id)

    def get_all(self) -> List[Dict[str, Any]]:
        return list(self._mock_store.values())
