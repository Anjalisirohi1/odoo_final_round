import pytest
from datetime import datetime, timezone, timedelta
from src.deal_health.context_builder import DealContext
from src.deal_health.engagement_scorer import EngagementHealthScorer

def test_engagement_scorer_active_deal():
    scorer = EngagementHealthScorer()
    now = datetime(2026, 9, 5, 12, 0, tzinfo=timezone.utc)
    context = DealContext(
        quotation_id="q1",
        quotation={"quotation_id": "q1", "created_at": now - timedelta(days=5)},
        deal_events=[
            {"event_id": "e1", "event_type": "QUOTE_CREATED", "created_at": now - timedelta(days=5)},
            {"event_id": "e2", "event_type": "CUSTOMER_VIEWED", "created_at": now - timedelta(days=1)},
            {"event_id": "e3", "event_type": "COUNTER_OFFER", "created_at": now - timedelta(hours=6)}
        ],
        now=now
    )
    score, evidence, strengths, concerns = scorer.score(context)
    assert 0.0 <= score <= 1.0
    assert score > 0.70
    assert evidence["customer_interactions"] == 2
    assert len(strengths) > 0

def test_engagement_scorer_inactive_deal():
    scorer = EngagementHealthScorer()
    now = datetime(2026, 9, 5, 12, 0, tzinfo=timezone.utc)
    context = DealContext(
        quotation_id="q1",
        quotation={"quotation_id": "q1", "created_at": now - timedelta(days=30)},
        deal_events=[
            {"event_id": "e1", "event_type": "QUOTE_CREATED", "created_at": now - timedelta(days=30)}
        ],
        now=now
    )
    score, evidence, strengths, concerns = scorer.score(context)
    assert 0.0 <= score <= 1.0
    assert score < 0.25
    assert len(concerns) > 0

def test_engagement_scorer_no_events_new_quote():
    scorer = EngagementHealthScorer()
    now = datetime(2026, 9, 5, 12, 0, tzinfo=timezone.utc)
    context = DealContext(
        quotation_id="q1",
        quotation={"quotation_id": "q1", "created_at": now - timedelta(days=1)},
        deal_events=[],
        now=now
    )
    score, evidence, strengths, concerns = scorer.score(context)
    assert 0.0 <= score <= 1.0
    assert score == 0.75
    assert evidence["is_new_deal"] is True
