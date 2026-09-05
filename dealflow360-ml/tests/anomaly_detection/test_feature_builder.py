import pandas as pd
from src.anomaly_detection.feature_builder import AnomalyFeatureBuilder

def test_feature_builder_calculate_discount():
    builder = AnomalyFeatureBuilder()
    pct = builder._calculate_discount_pct(80, 20)
    assert pct == 20.0
    
def test_feature_builder_fit_and_build():
    builder = AnomalyFeatureBuilder()
    quotes = [
        {'quotation_id': 'q1', 'customer_id': 'c1', 'sales_rep_id': 'r1', 'total_amount': 90, 'total_discount': 10, 'total_margin': 20},
        {'quotation_id': 'q2', 'customer_id': 'c1', 'sales_rep_id': 'r1', 'total_amount': 80, 'total_discount': 20, 'total_margin': 20},
    ]
    df = pd.DataFrame(quotes)
    builder.fit_baselines(df)
    
    assert builder.customer_baselines['c1']['avg_discount_pct'] == 15.0
    
    features = builder.build_features([{'quotation_id': 'q3', 'customer_id': 'c1', 'sales_rep_id': 'r1', 'total_amount': 50, 'total_discount': 50, 'total_margin': 10}])
    assert len(features) == 1
    assert features.iloc[0]['discount_percentage'] == 50.0
    assert features.iloc[0]['discount_customer_deviation'] == 35.0
