import pandas as pd
from typing import Dict
from src.features.base import BaseFeatureBuilder

class ProductFeatureBuilder(BaseFeatureBuilder):
    def build_features(self, datasets: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        if 'products' not in datasets or 'order_items' not in datasets:
            return pd.DataFrame()
            
        products = datasets['products']
        order_items = datasets['order_items']
        
        # Calculate revenue and units
        order_items['revenue'] = order_items['quantity'] * order_items['unit_price']
        
        product_stats = order_items.groupby('product_id').agg(
            product_total_units_sold=('quantity', 'sum'),
            product_total_revenue=('revenue', 'sum'),
            product_order_frequency=('order_id', 'nunique'),
            product_average_discount=('discount_percentage', 'mean')
        ).reset_index()
        
        # Merge
        features = products[['product_id', 'margin_percentage']].copy()
        features = features.merge(product_stats, on='product_id', how='left')
        
        # Fill missing values for products with no sales
        features['product_total_units_sold'] = features['product_total_units_sold'].fillna(0)
        features['product_total_revenue'] = features['product_total_revenue'].fillna(0)
        features['product_order_frequency'] = features['product_order_frequency'].fillna(0)
        features['product_average_discount'] = features['product_average_discount'].fillna(0)
        
        features['product_popularity_rank'] = features['product_total_units_sold'].rank(method='dense', ascending=False)
        
        return features
