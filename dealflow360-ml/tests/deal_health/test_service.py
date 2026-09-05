import pytest
from src.data.providers.synthetic_provider import SyntheticDataProvider
from src.anomaly_detection.service import AnomalyDetectionService
from src.deal_health.service import DealHealthService
from src.schemas.deal_health import HealthClassification

def test_deal_health_service_end_to_end():
    provider = SyntheticDataProvider(seed=42, num_customers=50, num_products=50, num_quotations=200)
    
    quotations = [q.model_dump() for q in provider.get_quotations()]
    customers = [c.model_dump() for c in provider.get_customers()]
    quotation_items = [qi.model_dump() for qi in provider.get_quotation_items()]
    orders = [o.model_dump() for o in provider.get_orders()]
    deal_events = [e.model_dump() for e in provider.get_deal_events()]
    sales_reps = [r.model_dump() for r in provider.get_sales_representatives()]
    
    anomaly_service = AnomalyDetectionService({})
    anomaly_service.initialize(quotations)
    
    health_service = DealHealthService(anomaly_service=anomaly_service)
    health_service.initialize(
        quotations=quotations,
        customers=customers,
        quotation_items=quotation_items,
        orders=orders,
        deal_events=deal_events,
        sales_reps=sales_reps
    )
    
    assert health_service.is_initialized is True
    
    # Test evaluation on the first quotation
    target_quote_id = quotations[0]["quotation_id"]
    result = health_service.evaluate_deal_health(target_quote_id)
    
    assert result is not None
    assert result["quotation_id"] == target_quote_id
    assert 0.0 <= result["health_score"] <= 100.0
    assert isinstance(result["classification"], HealthClassification)
    assert 0.0 <= result["dimension_scores"].conversion_potential <= 1.0
    assert 0.0 <= result["dimension_scores"].engagement <= 1.0
    assert 0.0 <= result["dimension_scores"].financial_health <= 1.0
    assert 0.0 <= result["dimension_scores"].momentum <= 1.0
    assert 0.0 <= result["dimension_scores"].risk_safety <= 1.0
    assert result["momentum"].label is not None
    assert len(result["recommended_actions"]) > 0

def test_deal_health_service_uninitialized():
    health_service = DealHealthService()
    with pytest.raises(RuntimeError, match="DealHealthService is not initialized"):
        health_service.evaluate_deal_health("any_quote")

def test_deal_health_service_quote_not_found():
    health_service = DealHealthService()
    health_service.initialize(quotations=[], customers=[])
    res = health_service.evaluate_deal_health("nonexistent_quote")
    assert res is None
