import pandas as pd
from typing import Dict, Any

class DataValidator:
    def __init__(self):
        self.report = {
            "valid": True,
            "total_records": 0,
            "invalid_records": 0,
            "warnings": [],
            "errors": []
        }

    def validate(self, datasets: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """
        Validates business rules, referential integrity, and temporal logic
        across the provided datasets.
        """
        self.report["total_records"] = sum(len(df) for df in datasets.values())
        
        self._validate_business_rules(datasets)
        self._validate_referential_integrity(datasets)
        self._validate_temporal_logic(datasets)
        
        self.report["valid"] = len(self.report["errors"]) == 0
        return self.report

    def _add_error(self, message: str):
        self.report["errors"].append(message)
        self.report["invalid_records"] += 1
        
    def _add_warning(self, message: str):
        self.report["warnings"].append(message)

    def _validate_business_rules(self, datasets: Dict[str, pd.DataFrame]):
        if 'products' in datasets:
            products = datasets['products']
            if (products['selling_price'] < products['cost_price']).any():
                self._add_error("Selling price is less than cost price in products.")
                
        if 'quotation_items' in datasets:
            qi = datasets['quotation_items']
            if (qi['quantity'] <= 0).any():
                self._add_error("Quotation item quantity <= 0.")
            if (qi['discount_percentage'] < 0).any() or (qi['discount_percentage'] > 100).any():
                self._add_error("Quotation item discount percentage out of bounds [0, 100].")
                
        if 'inventory' in datasets:
            inv = datasets['inventory']
            if (inv['available_quantity'] < 0).any():
                self._add_error("Inventory available quantity < 0.")

    def _validate_referential_integrity(self, datasets: Dict[str, pd.DataFrame]):
        # Check foreign keys conceptually
        if 'quotations' in datasets and 'customers' in datasets:
            q_custs = set(datasets['quotations']['customer_id'])
            c_custs = set(datasets['customers']['customer_id'])
            if not q_custs.issubset(c_custs):
                self._add_error("Quotations reference non-existent customers.")
                
        if 'quotation_items' in datasets and 'quotations' in datasets:
            qi_quotes = set(datasets['quotation_items']['quotation_id'])
            q_quotes = set(datasets['quotations']['quotation_id'])
            if not qi_quotes.issubset(q_quotes):
                self._add_error("Quotation items reference non-existent quotations.")
                
        if 'orders' in datasets and 'quotations' in datasets:
            o_quotes = set(datasets['orders']['quotation_id'])
            q_quotes = set(datasets['quotations']['quotation_id'])
            if not o_quotes.issubset(q_quotes):
                self._add_error("Orders reference non-existent quotations.")

    def _validate_temporal_logic(self, datasets: Dict[str, pd.DataFrame]):
        if 'orders' in datasets and 'quotations' in datasets:
            merged = datasets['orders'].merge(datasets['quotations'], on='quotation_id', suffixes=('_ord', '_quote'))
            # Ensure order_date >= quote created_at
            if (merged['order_date'] < merged['created_at']).any():
                self._add_error("Order date precedes quotation creation date.")
                
        if 'fulfillments' in datasets and 'orders' in datasets:
            merged = datasets['fulfillments'].merge(datasets['orders'], on='order_id')
            # Shipped date should not be before order date
            if 'shipped_date' in merged.columns and merged['shipped_date'].notna().any():
                if (merged['shipped_date'] < merged['order_date']).any():
                    self._add_error("Fulfillment shipped date precedes order date.")
