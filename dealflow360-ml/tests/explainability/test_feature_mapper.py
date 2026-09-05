import pytest
from src.explainability.feature_mapper import FeatureMapper

def test_feature_mapper_known_features():
    mapper = FeatureMapper()
    meta = mapper.get_metadata("customer_historical_conversion_rate")
    assert meta["label"] == "Customer Historical Win Rate"
    assert meta["category"] == "Customer Profile"

    # Value formatting
    assert mapper.format_value("customer_historical_conversion_rate", 0.65) == "65.0%"
    assert mapper.format_value("quotation_value", 50000.0) == "$50,000.00"
    assert mapper.format_value("discount_percentage", 12.5) == "12.5%"

    # Reason generation
    pos_reason = mapper.generate_reason("customer_historical_conversion_rate", 0.70, "POSITIVE", 0.15)
    assert "Strong historical customer conversion rate" in pos_reason
    assert "70.0%" in pos_reason

    neg_reason = mapper.generate_reason("discount_percentage", 30.0, "NEGATIVE", -0.12)
    assert "Aggressive discount level" in neg_reason

def test_feature_mapper_one_hot_and_unknown():
    mapper = FeatureMapper()
    # One-hot encoded feature
    meta_tier = mapper.get_metadata("customer_tier_PLATINUM")
    assert "Platinum" in meta_tier["label"]

    # Unknown feature fallback
    meta_unknown = mapper.get_metadata("custom_arbitrary_metric")
    assert meta_unknown["label"] == "Custom Arbitrary Metric"
    assert meta_unknown["category"] == "General Metrics"
