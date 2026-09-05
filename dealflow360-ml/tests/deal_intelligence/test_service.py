import pytest
from src.deal_intelligence.service import DealIntelligenceService
from src.data.providers.synthetic_provider import SyntheticDataProvider
from src.anomaly_detection.service import AnomalyDetectionService
from src.deal_health.service import DealHealthService
from src.prediction.service import DealPredictionService
from src.recommendation.service import RecommendationService
import pandas as pd

def test_deal_intelligence_service_end_to_end():
    provider = SyntheticDataProvider(seed=42, num_customers=30, num_products=20, num_quotations=100)

    orders_df = pd.DataFrame([o.model_dump() for o in provider.get_orders()])
    order_items_df = pd.DataFrame([oi.model_dump() for oi in provider.get_order_items()])
    products_df = pd.DataFrame([p.model_dump() for p in provider.get_products()])
    customers_df = pd.DataFrame([c.model_dump() for c in provider.get_customers()])

    # AI-01
    rec_service = RecommendationService({"min_support": 0.01, "min_confidence": 0.1, "min_lift": 0.5, "max_results": 5})
    rec_service.build_knowledge_base(orders_df, order_items_df, products_df, customers_df)

    # AI-02
    quotations = [q.model_dump() for q in provider.get_quotations()]
    anomaly_service = AnomalyDetectionService({"n_estimators": 50, "contamination": 0.05, "random_state": 42})
    anomaly_service.initialize(quotations)

    # AI-03
    customers = [c.model_dump() for c in provider.get_customers()]
    quotation_items = [qi.model_dump() for qi in provider.get_quotation_items()]
    orders = [o.model_dump() for o in provider.get_orders()]
    deal_events = [e.model_dump() for e in provider.get_deal_events()]
    sales_reps = [r.model_dump() for r in provider.get_sales_representatives()]

    deal_health_service = DealHealthService(anomaly_service=anomaly_service)
    deal_health_service.initialize(
        quotations=quotations,
        customers=customers,
        quotation_items=quotation_items,
        orders=orders,
        deal_events=deal_events,
        sales_reps=sales_reps
    )

    # AI-04
    prediction_service = DealPredictionService(
        deal_health_service=deal_health_service,
        anomaly_service=anomaly_service
    )
    prediction_service.set_context_data(
        quotations=quotations,
        customers=customers,
        quotation_items=quotation_items,
        orders=orders,
        deal_events=deal_events
    )
    # Attempt to load prediction model (may not be trained, which exercises graceful degradation)
    prediction_service.load_model()

    # AI-05
    service = DealIntelligenceService(
        recommendation_service=rec_service,
        anomaly_service=anomaly_service,
        deal_health_service=deal_health_service,
        prediction_service=prediction_service
    )
    service.initialize(
        quotations=quotations,
        customers=customers,
        quotation_items=quotation_items,
        orders=orders,
        deal_events=deal_events,
        sales_reps=sales_reps
    )

    sample_quote_id = quotations[0]["quotation_id"]
    response = service.analyze_deal(sample_quote_id)

    assert response is not None
    assert response.quotation_id == sample_quote_id
    assert 0.0 <= response.overall_assessment.intelligence_score <= 100.0
    assert response.overall_assessment.summary is not None
    assert isinstance(response.recommended_actions, list)
    assert isinstance(response.top_insights, list)
    assert isinstance(response.intelligence_timeline, list)

def test_deal_intelligence_service_uninitialized():
    service = DealIntelligenceService()
    with pytest.raises(RuntimeError, match="not initialized"):
        service.analyze_deal("Q-123")

def test_deal_intelligence_service_quote_not_found():
    service = DealIntelligenceService()
    service.initialize(quotations=[], customers=[])
    res = service.analyze_deal("NON_EXISTENT")
    assert res is None
