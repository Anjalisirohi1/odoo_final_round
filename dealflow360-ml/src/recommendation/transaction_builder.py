import pandas as pd
from typing import List, Dict, Any

class TransactionBuilder:
    def __init__(self):
        pass

    def build_transactions(self, orders_df: pd.DataFrame, order_items_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Converts orders and order items into a list of transaction dictionaries.
        Format: [{"order_id": "ord_1", "products": ["p1", "p2"]}, ...]
        """
        if orders_df.empty or order_items_df.empty:
            return []
            
        # Ensure we only use valid product IDs
        items = order_items_df.dropna(subset=['product_id', 'order_id'])
        
        # Group by order_id to get lists of products
        grouped = items.groupby('order_id')['product_id'].apply(list).reset_index()
        
        transactions = []
        for _, row in grouped.iterrows():
            order_id = row['order_id']
            products = row['product_id']
            
            # Make unique and sort for determinism
            unique_products = sorted(list(set(products)))
            
            # Skip empty transactions
            if not unique_products:
                continue
                
            transactions.append({
                "order_id": order_id,
                "products": unique_products
            })
            
        # Sort transactions by order_id for full determinism
        transactions.sort(key=lambda x: x["order_id"])
        return transactions

    def build_simple_transactions(self, orders_df: pd.DataFrame, order_items_df: pd.DataFrame) -> List[List[str]]:
        """
        Returns just the list of product lists.
        Format: [["p1", "p2"], ["p3"], ...]
        """
        transactions = self.build_transactions(orders_df, order_items_df)
        return [t["products"] for t in transactions]
