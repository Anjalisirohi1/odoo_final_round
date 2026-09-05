import pytest
from src.data.providers.synthetic_provider import SyntheticDataProvider
from src.prediction.dataset_builder import DatasetBuilder
from src.prediction.trainer import ModelTrainer
from src.prediction.service import DealPredictionService
from src.schemas.prediction import PredictionOutcome

def test_prediction_service_end_to_end():
    provider = SyntheticDataProvider(seed=42, num_customers=50, num_products=50, num_quotations=100)
    
    quotations = [q.model_dump() for q in provider.get_quotations()]
    customers = [c.model_dump() for c in provider.get_customers()]
    quotation_items = [qi.model_dump() for qi in provider.get_quotation_items()]
    orders = [o.model_dump() for o in provider.get_orders()]
    deal_events = [e.model_dump() for e in provider.get_deal_events()]
    
    # Build & train
    builder = DatasetBuilder()
    X, y = builder.build_dataset(quotations, customers, quotation_items, orders, deal_events)
    
    trainer = ModelTrainer(test_size=0.20, random_state=42)
    train_results = trainer.train_and_evaluate(X, y)
    
    service = DealPredictionService()
    service.set_context_data(quotations, customers, quotation_items, orders, deal_events)
    service.set_model(
        model=train_results["best_model"],
        preprocessor=train_results["preprocessor"],
        model_name=train_results["best_model_name"],
        metadata={"metrics": train_results["best_metrics"]}
    )
    
    assert service.is_initialized is True
    
    # Predict for first quotation
    target_id = quotations[0]["quotation_id"]
    result = service.predict_deal_outcome(target_id)
    
    assert result is not None
    assert result["quotation_id"] == target_id
    assert 0.0 <= result["conversion_probability"] <= 1.0
    assert isinstance(result["predicted_outcome"], PredictionOutcome)
    assert 0.0 <= result["confidence"].score <= 1.0
    assert result["revenue_forecast"].expected_revenue >= 0.0
    assert 0.0 <= result["priority"].score <= 100.0
    assert len(result["top_positive_factors"]) > 0

def test_prediction_service_uninitialized():
    service = DealPredictionService()
    with pytest.raises(RuntimeError, match="DealPredictionService is not initialized"):
        service.predict_deal_outcome("quote_1")

def test_prediction_service_quote_not_found():
    service = DealPredictionService()
    service.set_context_data([], [])
    service.is_initialized = True
    service.model = object()
    service.preprocessor = object()
    
    res = service.predict_deal_outcome("nonexistent_quote")
    assert res is None
