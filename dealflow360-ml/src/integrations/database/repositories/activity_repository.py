from typing import List, Dict, Any, Optional
from ..connection import DatabaseConnection

class ActivityRepository:
    """
    Repository for deal activities and engagement events.
    """
    def __init__(self, connection: Optional[DatabaseConnection] = None):
        self.connection = connection or DatabaseConnection()
        self._mock_events: Dict[str, List[Dict[str, Any]]] = {}

    def set_mock_data(self, events_by_quote: Dict[str, List[Dict[str, Any]]]):
        self._mock_events = dict(events_by_quote)

    def get_by_quotation_id(self, quotation_id: str) -> List[Dict[str, Any]]:
        return self._mock_events.get(quotation_id, [])
