import pandas as pd
from src.features.product_features import ProductFeatureBuilder

def test_product_features():
    builder = ProductFeatureBuilder()
    
    prod_df = pd.DataFrame([
        {'product_id': 'p1', 'margin_percentage': 20},
        {'product_id': 'p2', 'margin_percentage': 30}
    ])
    
    oi_df = pd.DataFrame([
        {'order_item_id': 'oi1', 'order_id': 'o1', 'product_id': 'p1', 'quantity': 2, 'unit_price': 100, 'discount_percentage': 10},
        {'order_item_id': 'oi2', 'order_id': 'o2', 'product_id': 'p1', 'quantity': 3, 'unit_price': 100, 'discount_percentage': 5}
    ])
    
    features = builder.build_features({'products': prod_df, 'order_items': oi_df})
    
    assert len(features) == 2
    p1_feat = features[features['product_id'] == 'p1'].iloc[0]
    p2_feat = features[features['product_id'] == 'p2'].iloc[0]
    
    assert p1_feat['product_total_units_sold'] == 5
    assert p1_feat['product_total_revenue'] == 500
    assert p1_feat['product_order_frequency'] == 2
    assert p1_feat['product_average_discount'] == 7.5
    
    assert p2_feat['product_total_units_sold'] == 0
    assert p2_feat['product_total_revenue'] == 0
