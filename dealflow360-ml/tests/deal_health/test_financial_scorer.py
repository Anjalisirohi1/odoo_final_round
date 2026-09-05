import pytest
from src.deal_health.context_builder import DealContext
from src.deal_health.financial_scorer import FinancialHealthScorer

def test_financial_scorer_healthy():
    scorer = FinancialHealthScorer()
    context = DealContext(
        quotation_id="q1",
        quotation={
            "quotation_id": "q1",
            "total_amount": 1000.0,
            "total_discount": 50.0,
            "total_margin": 400.0
        }
    )
    score, evidence, strengths, concerns = scorer.score(context)
    assert 0.0 <= score <= 1.0
    assert score > 0.80
    assert len(strengths) >= 2
    assert len(concerns) == 0

def test_financial_scorer_high_discount_low_margin():
    scorer = FinancialHealthScorer()
    context = DealContext(
        quotation_id="q1",
        quotation={
            "quotation_id": "q1",
            "total_amount": 1000.0,
            "total_discount": 400.0,
            "total_margin": 50.0
        }
    )
    score, evidence, strengths, concerns = scorer.score(context)
    assert 0.0 <= score <= 1.0
    assert score < 0.35
    assert len(concerns) > 0

def test_financial_scorer_zero_amount():
    scorer = FinancialHealthScorer()
    context = DealContext(
        quotation_id="q1",
        quotation={"quotation_id": "q1", "total_amount": 0.0, "total_discount": 0.0, "total_margin": 0.0}
    )
    score, evidence, strengths, concerns = scorer.score(context)
    assert score == 0.50
    assert len(concerns) > 0
