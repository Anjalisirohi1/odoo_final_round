from abc import ABC, abstractmethod
from typing import List
from src.schemas.domain import (
    Customer, Product, SalesRepresentative, Quotation, QuotationItem,
    Order, OrderItem, DealEvent, Inventory, Warehouse, Fulfillment, ApprovalHistory
)

class DataProvider(ABC):
    """
    Abstract base class for data providers.
    Future implementations may include PostgreSQLDataProvider or APIDataProvider.
    """
    
    @abstractmethod
    def get_customers(self) -> List[Customer]:
        pass

    @abstractmethod
    def get_products(self) -> List[Product]:
        pass

    @abstractmethod
    def get_sales_representatives(self) -> List[SalesRepresentative]:
        pass

    @abstractmethod
    def get_quotations(self) -> List[Quotation]:
        pass

    @abstractmethod
    def get_quotation_items(self) -> List[QuotationItem]:
        pass

    @abstractmethod
    def get_orders(self) -> List[Order]:
        pass

    @abstractmethod
    def get_order_items(self) -> List[OrderItem]:
        pass
        
    @abstractmethod
    def get_approval_history(self) -> List[ApprovalHistory]:
        pass

    @abstractmethod
    def get_deal_events(self) -> List[DealEvent]:
        pass

    @abstractmethod
    def get_inventory(self) -> List[Inventory]:
        pass

    @abstractmethod
    def get_warehouses(self) -> List[Warehouse]:
        pass

    @abstractmethod
    def get_fulfillments(self) -> List[Fulfillment]:
        pass
