import pytest
from src.schemas.prediction import ImpactDirection
from src.prediction.explainer import PredictionExplainer

def test_prediction_explainer_factors():
    explainer = PredictionExplainer()
    features = {
        "customer_historical_conversion_rate": 0.75,
        "discount_percentage": 5.0,
        "margin_percentage": 35.0,
        "customer_interaction_count": 3,
        "customer_tier": "PLATINUM"
    }
    
    pos, neg = explainer.explain(features, model=None, feature_names=[])
    assert len(pos) > 0
    assert any(f.feature == "customer_historical_conversion_rate" for f in pos)
    assert any(f.impact == ImpactDirection.POSITIVE for f in pos)
