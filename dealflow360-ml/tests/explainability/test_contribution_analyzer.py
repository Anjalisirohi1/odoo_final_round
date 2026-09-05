import pytest
from src.explainability.contribution_analyzer import ContributionAnalyzer
from src.explainability.base import RawContribution
from src.schemas.explainability import ImpactLevel, DriverDirection

def test_contribution_analyzer_impact_tiers():
    analyzer = ContributionAnalyzer(min_threshold=0.01, max_drivers=3)

    assert analyzer.categorize_impact(0.30) == ImpactLevel.VERY_HIGH
    assert analyzer.categorize_impact(0.15) == ImpactLevel.HIGH
    assert analyzer.categorize_impact(0.06) == ImpactLevel.MEDIUM
    assert analyzer.categorize_impact(0.01) == ImpactLevel.LOW

def test_contribution_analyzer_filter_and_rank():
    analyzer = ContributionAnalyzer(min_threshold=0.02, max_drivers=2)

    raw = [
        RawContribution(feature_name="customer_historical_conversion_rate", feature_value=0.75, contribution=0.22),
        RawContribution(feature_name="discount_percentage", feature_value=28.0, contribution=-0.18),
        RawContribution(feature_name="customer_interaction_count", feature_value=4, contribution=0.09),
        RawContribution(feature_name="noise_feature", feature_value=1.0, contribution=0.005),  # below threshold
        RawContribution(feature_name="margin_percentage", feature_value=10.0, contribution=-0.14)
    ]

    pos_drivers, neg_drivers, structured_all = analyzer.analyze_contributions(raw)

    # Top positive drivers limited to max_drivers=2
    assert len(pos_drivers) == 2
    assert pos_drivers[0].feature == "customer_historical_conversion_rate"
    assert pos_drivers[0].impact_level == ImpactLevel.HIGH
    assert pos_drivers[0].direction == DriverDirection.POSITIVE

    # Top negative drivers
    assert len(neg_drivers) == 2
    assert neg_drivers[0].feature == "discount_percentage"
    assert neg_drivers[0].direction == DriverDirection.NEGATIVE

    # All structured
    assert len(structured_all) == 5

    # Summary generation
    summary = analyzer.generate_summary(
        predicted_outcome="LIKELY_TO_CONVERT",
        conversion_probability=0.78,
        positive_drivers=pos_drivers,
        negative_drivers=neg_drivers
    )
    assert "strong conversion potential" in summary.lower()
    assert "78.0%" in summary
