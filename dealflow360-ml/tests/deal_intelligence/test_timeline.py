import pytest
from datetime import datetime, timezone
from src.deal_intelligence.timeline import IntelligenceTimelineBuilder
from src.deal_intelligence.context_builder import UnifiedDealContext

def test_intelligence_timeline_builder():
    builder = IntelligenceTimelineBuilder()

    context = UnifiedDealContext(
        quotation_id="Q-001",
        quotation={
            "quotation_id": "Q-001",
            "created_at": "2026-09-01T08:00:00Z",
            "total_amount": 50000.0,
            "discount_percentage": 10.0
        },
        deal_events=[
            {"event_timestamp": "2026-09-02T10:00:00Z", "event_type": "EMAIL_OPENED", "title": "Client viewed quotation"}
        ],
        now=datetime(2026, 9, 3, 12, 0, 0, tzinfo=timezone.utc)
    )

    anomaly_data = {
        "is_anomaly": True,
        "risk_level": "HIGH",
        "anomaly_score": 0.65
    }

    timeline = builder.build_timeline(
        context=context,
        anomaly_data=anomaly_data
    )

    assert len(timeline) == 3
    # Ensure chronological order
    timestamps = [item.timestamp for item in timeline]
    assert timestamps == sorted(timestamps)

    types = [item.event_type for item in timeline]
    assert "QUOTATION_CREATED" in types
    assert "EMAIL_OPENED" in types
    assert "ANOMALY_FLAGGED" in types
