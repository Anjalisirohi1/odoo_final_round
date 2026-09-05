import pytest
from datetime import datetime, timezone
from src.deal_intelligence.context_builder import UnifiedContextBuilder, UnifiedDealContext

def test_context_builder_success():
    quotations = [
        {"quotation_id": "Q-001", "customer_id": "C-100", "sales_rep_id": "R-1", "total_amount": 50000.0, "discount_percentage": 10.0}
    ]
    customers = [
        {"customer_id": "C-100", "customer_name": "Acme Corp", "industry": "Technology"}
    ]
    items = [
        {"quotation_id": "Q-001", "product_id": "P-10", "quantity": 2, "unit_price": 25000.0}
    ]
    orders = [
        {"order_id": "O-01", "customer_id": "C-100", "total_amount": 30000.0}
    ]
    events = [
        {"quotation_id": "Q-001", "event_type": "QUOTE_SENT", "event_timestamp": "2026-09-01T10:00:00Z"}
    ]
    reps = [
        {"sales_rep_id": "R-1", "name": "Alice"}
    ]

    builder = UnifiedContextBuilder(
        quotations=quotations,
        customers=customers,
        quotation_items=items,
        orders=orders,
        deal_events=events,
        sales_reps=reps
    )

    ctx = builder.build_context("Q-001")
    assert ctx is not None
    assert ctx.quotation_id == "Q-001"
    assert ctx.customer is not None
    assert ctx.customer["customer_name"] == "Acme Corp"
    assert ctx.product_ids == ["P-10"]
    assert ctx.total_amount == 50000.0
    assert ctx.discount_percentage == 10.0
    assert len(ctx.deal_events) == 1
    assert len(ctx.customer_orders) == 1
    assert ctx.sales_rep["name"] == "Alice"

def test_context_builder_not_found():
    builder = UnifiedContextBuilder(quotations=[])
    ctx = builder.build_context("NON_EXISTENT")
    assert ctx is None

def test_context_builder_missing_optional_data():
    quotations = [
        {"quotation_id": "Q-002", "total_amount": 12000.0, "product_ids": ["P-99"]}
    ]
    builder = UnifiedContextBuilder(quotations=quotations)
    ctx = builder.build_context("Q-002")
    assert ctx is not None
    assert ctx.customer is None
    assert ctx.sales_rep is None
    assert ctx.product_ids == ["P-99"]
    assert ctx.items == []
