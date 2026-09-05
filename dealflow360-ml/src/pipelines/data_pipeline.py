import pandas as pd
from typing import Dict, Any
from dataclasses import dataclass

from src.data.providers.base import DataProvider
from src.data.validation.data_validator import DataValidator
from src.data.preprocessing.cleaner import DataCleaner
from src.features.customer_features import CustomerFeatureBuilder
from src.features.product_features import ProductFeatureBuilder

@dataclass
class DataPipelineResult:
    raw_data: Dict[str, pd.DataFrame]
    cleaned_data: Dict[str, pd.DataFrame]
    validation_report: Dict[str, Any]
    customer_features: pd.DataFrame
    product_features: pd.DataFrame

class DataPipeline:
    def __init__(self, data_provider: DataProvider):
        self.data_provider = data_provider
        self.validator = DataValidator()
        self.cleaner = DataCleaner()
        self.customer_builder = CustomerFeatureBuilder()
        self.product_builder = ProductFeatureBuilder()

    def run(self) -> DataPipelineResult:
        # 1. Fetch from provider
        print("Fetching raw data...")
        raw = self._fetch_raw_data()
        
        # 2. Validation
        print("Validating data...")
        report = self.validator.validate(raw)
        if not report['valid']:
            print(f"Validation failed with {len(report['errors'])} errors. Proceeding anyway for demonstration...")
            for e in report['errors']:
                print(f" - {e}")
        else:
            print("Validation passed.")
            
        # 3. Cleaning
        print("Cleaning data...")
        cleaned = self.cleaner.clean(raw)
        
        # 4. Feature Engineering
        print("Engineering features...")
        cust_features = self.customer_builder.build_features(cleaned)
        prod_features = self.product_builder.build_features(cleaned)
        
        return DataPipelineResult(
            raw_data=raw,
            cleaned_data=cleaned,
            validation_report=report,
            customer_features=cust_features,
            product_features=prod_features
        )

    def _fetch_raw_data(self) -> Dict[str, pd.DataFrame]:
        # Helper to fetch all entities into DataFrames
        return {
            "customers": pd.DataFrame([x.model_dump() for x in self.data_provider.get_customers()]),
            "products": pd.DataFrame([x.model_dump() for x in self.data_provider.get_products()]),
            "sales_representatives": pd.DataFrame([x.model_dump() for x in self.data_provider.get_sales_representatives()]),
            "quotations": pd.DataFrame([x.model_dump() for x in self.data_provider.get_quotations()]),
            "quotation_items": pd.DataFrame([x.model_dump() for x in self.data_provider.get_quotation_items()]),
            "orders": pd.DataFrame([x.model_dump() for x in self.data_provider.get_orders()]),
            "order_items": pd.DataFrame([x.model_dump() for x in self.data_provider.get_order_items()]),
            "approval_history": pd.DataFrame([x.model_dump() for x in self.data_provider.get_approval_history()]),
            "deal_events": pd.DataFrame([x.model_dump() for x in self.data_provider.get_deal_events()]),
            "inventory": pd.DataFrame([x.model_dump() for x in self.data_provider.get_inventory()]),
            "warehouses": pd.DataFrame([x.model_dump() for x in self.data_provider.get_warehouses()]),
            "fulfillments": pd.DataFrame([x.model_dump() for x in self.data_provider.get_fulfillments()])
        }
