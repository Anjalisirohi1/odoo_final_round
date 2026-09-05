import pytest
from datetime import datetime, timezone
from src.deal_intelligence.synthesizer import InsightSynthesizer
from src.deal_intelligence.context_builder import UnifiedDealContext
from src.deal_intelligence.normalizer import NormalizedSignal
from src.schemas.deal_intelligence import (
    SignalDirection, InsightImportance, IntelligenceClassification,
    BusinessImpactLevel, ModuleAvailability, ModuleStatusDetail
)

def test_insight_synthesizer():
    synthesizer = InsightSynthesizer()

    context = UnifiedDealContext(
        quotation_id="Q-100",
        quotation={"quotation_id": "Q-100", "total_amount": 75000.0}
    )

    signals = [
        NormalizedSignal(
            source="PREDICTION",
            category="PREDICTION",
            signal_type="CONVERSION_PROBABILITY",
            direction=SignalDirection.POSITIVE,
            severity=InsightImportance.HIGH,
            title="High Conversion Potential",
            description="Probability of close is 85%",
            raw_score=0.85,
            normalized_score=0.85
        ),
        NormalizedSignal(
            source="ANOMALY_DETECTION",
            category="RISK",
            signal_type="OVERALL_ANOMALY_RISK",
            direction=SignalDirection.NEGATIVE,
            severity=InsightImportance.HIGH,
            title="Quotation Risk: HIGH",
            description="Discount is 40% higher than average",
            raw_score=0.70,
            normalized_score=0.70
        )
    ]

    score_result = {
        "intelligence_score": 72.0,
        "classification": IntelligenceClassification.POSITIVE
    }

    module_statuses = {
        "PREDICTION": ModuleStatusDetail(status=ModuleAvailability.AVAILABLE),
        "ANOMALY_DETECTION": ModuleStatusDetail(status=ModuleAvailability.AVAILABLE),
        "DEAL_HEALTH": ModuleStatusDetail(status=ModuleAvailability.UNAVAILABLE, reason="Not run"),
        "RECOMMENDATION": ModuleStatusDetail(status=ModuleAvailability.UNAVAILABLE, reason="Not run")
    }

    response = synthesizer.synthesize(
        context=context,
        signals=signals,
        score_result=score_result,
        business_impact_level=BusinessImpactLevel.HIGH,
        business_impact_reason="High pipeline revenue exposure",
        conflicts=[],
        agreements=[],
        actions=[],
        top_insights=[],
        timeline=[],
        module_statuses=module_statuses
    )

    assert response.quotation_id == "Q-100"
    assert response.overall_assessment.intelligence_score == 72.0
    assert response.overall_assessment.classification == IntelligenceClassification.POSITIVE
    assert response.overall_assessment.business_impact == BusinessImpactLevel.HIGH
    assert len(response.key_positive_signals) == 1
    assert len(response.key_risks) == 1
    assert "positive closing viability" in response.overall_assessment.summary.lower()
