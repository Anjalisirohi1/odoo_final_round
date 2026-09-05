import logging
from typing import Optional, Dict, Any

from src.domain.business_context import BusinessContext
from src.integrations.interfaces.business_context_provider import BusinessContextProvider
from src.integrations.mappers.business_context_mapper import BusinessContextMapper
from src.integrations.database.connection import DatabaseConnection
from src.integrations.database.repositories.customer_repository import CustomerRepository
from src.integrations.database.repositories.quotation_repository import QuotationRepository
from src.integrations.database.repositories.product_repository import ProductRepository
from src.integrations.database.repositories.order_repository import OrderRepository
from src.integrations.database.repositories.activity_repository import ActivityRepository

logger = logging.getLogger(__name__)

class DatabaseBusinessContextProvider(BusinessContextProvider):
    """
    BusinessContextProvider backed by relational PostgreSQL repositories.
    """

    def __init__(
        self,
        connection: Optional[DatabaseConnection] = None,
        quotation_repo: Optional[QuotationRepository] = None,
        customer_repo: Optional[CustomerRepository] = None,
        product_repo: Optional[ProductRepository] = None,
        order_repo: Optional[OrderRepository] = None,
        activity_repo: Optional[ActivityRepository] = None
    ):
        self.connection = connection or DatabaseConnection()
        self.quotation_repo = quotation_repo or QuotationRepository(self.connection)
        self.customer_repo = customer_repo or CustomerRepository(self.connection)
        self.product_repo = product_repo or ProductRepository(self.connection)
        self.order_repo = order_repo or OrderRepository(self.connection)
        self.activity_repo = activity_repo or ActivityRepository(self.connection)

    @property
    def provider_type(self) -> str:
        return "database"

    def get_business_context(self, quotation_id: str) -> Optional[BusinessContext]:
        quote_data = self.quotation_repo.get_by_id(quotation_id)
        if not quote_data:
            logger.info(f"Quotation {quotation_id} not found in database repository.")
            return None

        customer_id = quote_data.get("customer_id")
        customer_data = self.customer_repo.get_by_id(customer_id) if customer_id else None
        if not customer_data:
            customer_data = {
                "customer_id": customer_id or "cust_unknown",
                "customer_name": "Database Customer",
                "customer_tier": "BRONZE"
            }

        items_data = self.quotation_repo.get_items(quotation_id)
        products_data = self.product_repo.get_all()
        orders_data = self.order_repo.get_by_customer_id(customer_id) if customer_id else []
        events_data = self.activity_repo.get_by_quotation_id(quotation_id)

        return BusinessContextMapper.to_domain(
            quotation_data=quote_data,
            customer_data=customer_data,
            quotation_items_data=items_data,
            products_data=products_data,
            orders_data=orders_data,
            events_data=events_data,
            source="postgresql"
        )

    def health_check(self) -> Dict[str, Any]:
        conn_health = self.connection.check_health()
        return {
            "status": "ready" if conn_health.get("connected") else "disconnected",
            "provider": "database",
            "database_details": conn_health
        }
