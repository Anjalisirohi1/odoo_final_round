import pytest
from datetime import datetime, timezone, timedelta
from src.schemas.deal_health import MomentumLabel
from src.deal_health.context_builder import DealContext
from src.deal_health.momentum_analyzer import MomentumAnalyzer

def test_momentum_strong_positive():
    analyzer = MomentumAnalyzer()
    now = datetime(2026, 9, 5, 12, 0, tzinfo=timezone.utc)
    context = DealContext(
        quotation_id="q1",
        quotation={"quotation_id": "q1", "created_at": now - timedelta(days=2)},
        deal_events=[
            {"event_id": "e1", "event_type": "QUOTE_SENT", "created_at": now - timedelta(hours=24)},
            {"event_id": "e2", "event_type": "CUSTOMER_VIEWED", "created_at": now - timedelta(hours=12)},
            {"event_id": "e3", "event_type": "COUNTER_OFFER", "created_at": now - timedelta(hours=2)}
        ],
        now=now
    )
    score, label, evidence, strengths, concerns = analyzer.analyze(context)
    assert label == MomentumLabel.STRONG_POSITIVE
    assert score >= 0.90
    assert len(strengths) > 0

def test_momentum_declining_and_stagnant():
    analyzer = MomentumAnalyzer()
    now = datetime(2026, 9, 5, 12, 0, tzinfo=timezone.utc)
    
    # Declining: 20 days inactive
    ctx_declining = DealContext(
        quotation_id="q1",
        quotation={"quotation_id": "q1", "created_at": now - timedelta(days=20)},
        deal_events=[
            {"event_id": "e1", "event_type": "QUOTE_CREATED", "created_at": now - timedelta(days=20)}
        ],
        now=now
    )
    score_d, label_d, _, _, _ = analyzer.analyze(ctx_declining)
    assert label_d == MomentumLabel.DECLINING
    assert score_d == 0.40
    
    # Stagnant: 40 days inactive
    ctx_stagnant = DealContext(
        quotation_id="q2",
        quotation={"quotation_id": "q2", "created_at": now - timedelta(days=40)},
        deal_events=[
            {"event_id": "e1", "event_type": "QUOTE_CREATED", "created_at": now - timedelta(days=40)}
        ],
        now=now
    )
    score_s, label_s, _, _, _ = analyzer.analyze(ctx_stagnant)
    assert label_s == MomentumLabel.STAGNANT
    assert score_s == 0.15
