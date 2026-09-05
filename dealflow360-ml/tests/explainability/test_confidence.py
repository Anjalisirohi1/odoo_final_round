import pytest
from src.explainability.confidence import ExplanationConfidenceEstimator
from src.explainability.base import RawContribution
from src.schemas.explainability import ExplanationConfidence, ExplanationMethod

def test_explanation_confidence_estimator():
    estimator = ExplanationConfidenceEstimator()

    # High confidence case
    contributions_strong = [
        RawContribution(feature_name="f1", feature_value=1.0, contribution=0.25),
        RawContribution(feature_name="f2", feature_value=2.0, contribution=-0.15),
        RawContribution(feature_name="f3", feature_value=3.0, contribution=0.08)
    ]
    conf_high = estimator.estimate_confidence(
        method=ExplanationMethod.LINEAR_COEFFICIENT,
        raw_contributions=contributions_strong
    )
    assert conf_high == ExplanationConfidence.HIGH

    # Fallback used -> Medium confidence
    conf_fallback = estimator.estimate_confidence(
        method=ExplanationMethod.RULE_BASED,
        raw_contributions=contributions_strong,
        fallback_used=True
    )
    assert conf_fallback == ExplanationConfidence.MEDIUM

    # Dispersed / empty -> Low confidence
    conf_empty = estimator.estimate_confidence(
        method=ExplanationMethod.LINEAR_COEFFICIENT,
        raw_contributions=[]
    )
    assert conf_empty == ExplanationConfidence.LOW
