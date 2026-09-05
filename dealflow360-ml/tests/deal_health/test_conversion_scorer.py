import pytest
from src.deal_health.context_builder import DealContext
from src.deal_health.conversion_scorer import ConversionPotentialScorer

def test_conversion_scorer_high_conversion():
    scorer = ConversionPotentialScorer()
    context = DealContext(
        quotation_id="q1",
        quotation={"quotation_id": "q1", "customer_id": "c1"},
        customer={"customer_id": "c1", "customer_tier": "PLATINUM"},
        customer_orders=[{"order_id": "o1"}, {"order_id": "o2"}, {"order_id": "o3"}, {"order_id": "o4"}],
        customer_quotations=[{"quotation_id": "q1"}, {"quotation_id": "q2"}, {"quotation_id": "q3"}, {"quotation_id": "q4"}, {"quotation_id": "q5"}]
    )
    score, evidence, strengths, concerns = scorer.score(context)
    assert 0.0 <= score <= 1.0
    assert score > 0.8
    assert evidence["is_cold_start"] is False
    assert len(strengths) > 0

def test_conversion_scorer_cold_start():
    scorer = ConversionPotentialScorer()
    context = DealContext(
        quotation_id="q1",
        quotation={"quotation_id": "q1", "customer_id": "c1"},
        customer={"customer_id": "c1", "customer_tier": "GOLD"},
        customer_orders=[],
        customer_quotations=[]
    )
    score, evidence, strengths, concerns = scorer.score(context)
    assert 0.0 <= score <= 1.0
    assert score == 0.50
    assert evidence["is_cold_start"] is True
    assert len(concerns) > 0

def test_conversion_scorer_low_conversion():
    scorer = ConversionPotentialScorer()
    context = DealContext(
        quotation_id="q1",
        quotation={"quotation_id": "q1", "customer_id": "c1"},
        customer={"customer_id": "c1", "customer_tier": "BRONZE"},
        customer_orders=[{"order_id": "o1"}],
        customer_quotations=[{"quotation_id": "q1"}, {"quotation_id": "q2"}, {"quotation_id": "q3"}, {"quotation_id": "q4"}, {"quotation_id": "q5"}, {"quotation_id": "q6"}]
    )
    score, evidence, strengths, concerns = scorer.score(context)
    assert 0.0 <= score <= 1.0
    assert score < 0.25
    assert len(concerns) > 0
