import pandas as pd
from typing import Dict
from src.features.base import BaseFeatureBuilder

class CustomerFeatureBuilder(BaseFeatureBuilder):
    def build_features(self, datasets: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        if 'customers' not in datasets or 'orders' not in datasets or 'quotations' not in datasets:
            return pd.DataFrame()
            
        customers = datasets['customers']
        orders = datasets['orders']
        quotations = datasets['quotations']
        
        # Aggregate order stats
        order_stats = orders.groupby('customer_id').agg(
            customer_total_orders=('order_id', 'count'),
            customer_total_spend=('total_amount', 'sum'),
            customer_average_order_value=('total_amount', 'mean'),
            last_order_date=('order_date', 'max')
        ).reset_index()
        
        # Aggregate quotation stats
        quote_stats = quotations.groupby('customer_id').agg(
            customer_total_quotes=('quotation_id', 'count'),
            total_quote_discount=('total_discount', 'sum'),
            total_quote_amount=('total_amount', 'sum')
        ).reset_index()
        
        quote_stats['customer_average_discount'] = quote_stats['total_quote_discount'] / quote_stats['total_quote_amount'].replace(0, 1)
        
        # Merge
        features = customers[['customer_id', 'created_at', 'customer_tier']].copy()
        features = features.merge(order_stats, on='customer_id', how='left')
        features = features.merge(quote_stats, on='customer_id', how='left')
        
        # Fill missing numeric values for customers with no orders
        features['customer_total_orders'] = features['customer_total_orders'].fillna(0)
        features['customer_total_spend'] = features['customer_total_spend'].fillna(0)
        features['customer_average_order_value'] = features['customer_average_order_value'].fillna(0)
        features['customer_average_discount'] = features['customer_average_discount'].fillna(0)
        
        features['customer_conversion_rate'] = features['customer_total_orders'] / features['customer_total_quotes'].replace(0, 1)
        features['customer_conversion_rate'] = features['customer_conversion_rate'].fillna(0)
        
        # Calculate temporal features natively here
        now = pd.Timestamp.now('UTC').tz_localize(None)
        features['created_at'] = pd.to_datetime(features['created_at']).dt.tz_localize(None)
        features['customer_age_days'] = (now - features['created_at']).dt.days
        
        features['last_order_date'] = pd.to_datetime(features['last_order_date']).dt.tz_localize(None)
        features['customer_days_since_last_order'] = (now - features['last_order_date']).dt.days
        
        # Drop temporary columns
        features = features.drop(columns=['created_at', 'last_order_date', 'total_quote_discount', 'total_quote_amount', 'customer_total_quotes'])
        
        return features
