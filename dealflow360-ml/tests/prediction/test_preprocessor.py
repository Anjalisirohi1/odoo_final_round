import pytest
import pandas as pd
import numpy as np
from src.prediction.preprocessor import PredictionPreprocessor

def test_preprocessor_fit_transform():
    df = pd.DataFrame([
        {
            "quotation_value": 1000.0,
            "log_quotation_value": 6.9,
            "discount_percentage": 10.0,
            "margin_percentage": 30.0,
            "discount_to_margin_ratio": 0.33,
            "product_count": 2,
            "total_quantity": 4,
            "customer_historical_conversion_rate": 0.5,
            "customer_total_prior_quotes": 4,
            "customer_total_prior_orders": 2,
            "customer_account_age_days": 100,
            "quote_creation_day_of_week": 1,
            "quote_creation_month": 5,
            "early_event_count": 2,
            "customer_interaction_count": 1,
            "customer_tier": "GOLD",
            "customer_industry": "Technology",
            "customer_region": "North America"
        },
        {
            "quotation_value": 2000.0,
            "log_quotation_value": 7.6,
            "discount_percentage": 15.0,
            "margin_percentage": 25.0,
            "discount_to_margin_ratio": 0.6,
            "product_count": 3,
            "total_quantity": 6,
            "customer_historical_conversion_rate": 0.7,
            "customer_total_prior_quotes": 10,
            "customer_total_prior_orders": 7,
            "customer_account_age_days": 200,
            "quote_creation_day_of_week": 3,
            "quote_creation_month": 6,
            "early_event_count": 3,
            "customer_interaction_count": 2,
            "customer_tier": "PLATINUM",
            "customer_industry": "Finance",
            "customer_region": "EMEA"
        }
    ])
    
    preprocessor = PredictionPreprocessor()
    transformed = preprocessor.fit_transform(df)
    
    assert transformed.shape[0] == 2
    assert transformed.shape[1] >= len(PredictionPreprocessor().numeric_features)
    assert not np.isnan(transformed).any()
    
    # Test transform on single row
    transformed_test = preprocessor.transform(df.iloc[[0]])
    assert transformed_test.shape[0] == 1
    assert transformed_test.shape[1] == transformed.shape[1]
