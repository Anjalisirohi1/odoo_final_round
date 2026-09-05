import pytest
import pandas as pd
from datetime import datetime, timezone
from src.prediction.feature_builder import PredictionFeatureBuilder

def test_feature_builder_extraction():
    builder = PredictionFeatureBuilder()
    now = datetime(2026, 9, 5, 12, 0, tzinfo=timezone.utc)
    
    quotations = [{
        "quotation_id": "q1",
        "customer_id": "c1",
        "total_amount": 1000.0,
        "total_discount": 100.0,
        "total_margin": 300.0,
        "created_at": now
    }]
    customers_map = {
        "c1": {
            "customer_id": "c1",
            "customer_tier": "GOLD",
            "industry": "Technology",
            "region": "North America",
            "created_at": now
        }
    }
    items_by_quote = {"q1": [{"product_id": "p1", "quantity": 2}]}
    orders_by_customer = {"c1": [{"order_id": "o1"}]}
    quotes_by_customer = {"c1": [{"quotation_id": "q1"}, {"quotation_id": "q2"}]}
    events_by_quote = {"q1": [{"event_type": "CUSTOMER_VIEWED"}]}
    
    df = builder.build_features_for_quotations(
        quotations=quotations,
        customers_map=customers_map,
        items_by_quote=items_by_quote,
        orders_by_customer=orders_by_customer,
        quotes_by_customer=quotes_by_customer,
        events_by_quote=events_by_quote,
        custom_now=now
    )
    
    assert not df.empty
    assert df.index[0] == "q1"
    assert df.loc["q1", "quotation_value"] == 1000.0
    assert df.loc["q1", "customer_tier"] == "GOLD"
    assert df.loc["q1", "customer_historical_conversion_rate"] == 0.5
    assert df.loc["q1", "early_event_count"] == 1
    assert df.loc["q1", "customer_interaction_count"] == 1
