import pytest
from datetime import datetime, timezone
from src.deal_health.context_builder import DealContextBuilder, DealContext

def test_context_builder_success():
    quotations = [{"quotation_id": "q1", "customer_id": "c1", "sales_rep_id": "r1", "total_amount": 1000.0, "total_discount": 100.0, "total_margin": 300.0}]
    customers = [{"customer_id": "c1", "customer_name": "Acme", "customer_tier": "GOLD"}]
    quotation_items = [{"quote_item_id": "qi1", "quotation_id": "q1", "product_id": "p1"}]
    orders = [{"order_id": "o1", "customer_id": "c1", "total_amount": 900.0}]
    deal_events = [{"event_id": "e1", "quotation_id": "q1", "event_type": "QUOTE_SENT"}]
    sales_reps = [{"sales_rep_id": "r1", "name": "Alice"}]

    builder = DealContextBuilder(
        quotations=quotations,
        customers=customers,
        quotation_items=quotation_items,
        orders=orders,
        deal_events=deal_events,
        sales_reps=sales_reps
    )

    ctx = builder.build_context("q1")
    assert ctx is not None
    assert ctx.quotation_id == "q1"
    assert ctx.customer["customer_name"] == "Acme"
    assert len(ctx.quotation_items) == 1
    assert len(ctx.customer_orders) == 1
    assert len(ctx.deal_events) == 1
    assert ctx.sales_rep["name"] == "Alice"

def test_context_builder_not_found():
    builder = DealContextBuilder(quotations=[])
    ctx = builder.build_context("nonexistent")
    assert ctx is None

def test_context_builder_missing_optional_data():
    quotations = [{"quotation_id": "q2", "customer_id": "unknown_c", "total_amount": 500.0}]
    builder = DealContextBuilder(quotations=quotations)
    ctx = builder.build_context("q2")
    assert ctx is not None
    assert ctx.customer is None
    assert ctx.quotation_items == []
    assert ctx.customer_orders == []
    assert ctx.deal_events == []
