import pytest
from src.deal_intelligence.insight_ranker import ExecutiveInsightRanker
from src.deal_intelligence.normalizer import NormalizedSignal
from src.schemas.deal_intelligence import InsightImportance, SignalDirection, SignalConflict

def test_insight_ranker_ordering():
    ranker = ExecutiveInsightRanker(max_insights=3)

    signals = [
        NormalizedSignal(
            source="DEAL_HEALTH",
            category="HEALTH",
            signal_type="OVERALL_HEALTH",
            direction=SignalDirection.POSITIVE,
            severity=InsightImportance.LOW,
            title="Moderate Health",
            description="Score is 62"
        ),
        NormalizedSignal(
            source="ANOMALY_DETECTION",
            category="RISK",
            signal_type="OVERALL_ANOMALY_RISK",
            direction=SignalDirection.NEGATIVE,
            severity=InsightImportance.CRITICAL,
            title="Critical Quotation Anomaly",
            description="Severe discount detected"
        )
    ]

    conflicts = [
        SignalConflict(
            type="HEALTH_PREDICTION_MISMATCH",
            severity=InsightImportance.HIGH,
            description="Mismatch between prediction and health",
            participating_modules=["PREDICTION", "DEAL_HEALTH"]
        )
    ]

    insights = ranker.rank_insights(signals=signals, conflicts=conflicts)
    assert len(insights) <= 3
    # First insight should be highest severity (Critical Anomaly or Conflict)
    assert insights[0].importance in [InsightImportance.CRITICAL, InsightImportance.HIGH]
