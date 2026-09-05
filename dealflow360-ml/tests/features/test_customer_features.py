import pandas as pd
from src.features.customer_features import CustomerFeatureBuilder
from datetime import datetime

def test_customer_features():
    builder = CustomerFeatureBuilder()
    
    # Need customers, orders, quotations
    cust_df = pd.DataFrame([{'customer_id': 'c1', 'created_at': '2022-01-01', 'customer_tier': 'GOLD'}])
    order_df = pd.DataFrame([
        {'order_id': 'o1', 'customer_id': 'c1', 'total_amount': 100, 'order_date': '2023-01-01'},
        {'order_id': 'o2', 'customer_id': 'c1', 'total_amount': 200, 'order_date': '2023-06-01'}
    ])
    quote_df = pd.DataFrame([
        {'quotation_id': 'q1', 'customer_id': 'c1', 'total_amount': 150, 'total_discount': 15},
        {'quotation_id': 'q2', 'customer_id': 'c1', 'total_amount': 250, 'total_discount': 25}
    ])
    
    datasets = {'customers': cust_df, 'orders': order_df, 'quotations': quote_df}
    features = builder.build_features(datasets)
    
    assert len(features) == 1
    assert features.iloc[0]['customer_total_orders'] == 2
    assert features.iloc[0]['customer_total_spend'] == 300
    assert features.iloc[0]['customer_average_order_value'] == 150
    assert features.iloc[0]['customer_average_discount'] == 0.1 # (15+25) / (150+250)
    assert features.iloc[0]['customer_conversion_rate'] == 1.0 # 2 orders / 2 quotes
