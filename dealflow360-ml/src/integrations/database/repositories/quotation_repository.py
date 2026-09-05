from typing import Optional, List, Dict, Any
from ..connection import DatabaseConnection

class QuotationRepository:
    """
    Repository for quotation and line item record extraction from PostgreSQL/persistence storage.
    """
    def __init__(self, connection: Optional[DatabaseConnection] = None):
        self.connection = connection or DatabaseConnection()
        self._mock_quotes: Dict[str, Dict[str, Any]] = {}
        self._mock_items: Dict[str, List[Dict[str, Any]]] = {}

    def set_mock_data(
        self,
        quotations: Dict[str, Dict[str, Any]],
        items: Optional[Dict[str, List[Dict[str, Any]]]] = None
    ):
        self._mock_quotes = dict(quotations)
        self._mock_items = dict(items or {})

    def get_by_id(self, quotation_id: str) -> Optional[Dict[str, Any]]:
        return self._mock_quotes.get(quotation_id)

    def get_items(self, quotation_id: str) -> List[Dict[str, Any]]:
        return self._mock_items.get(quotation_id, [])
