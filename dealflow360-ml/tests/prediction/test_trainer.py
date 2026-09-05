import pytest
from src.data.providers.synthetic_provider import SyntheticDataProvider
from src.prediction.dataset_builder import DatasetBuilder
from src.prediction.trainer import ModelTrainer

def test_trainer_end_to_end():
    provider = SyntheticDataProvider(seed=42, num_customers=30, num_products=50, num_quotations=100)
    quotations = [q.model_dump() for q in provider.get_quotations()]
    customers = [c.model_dump() for c in provider.get_customers()]
    orders = [o.model_dump() for o in provider.get_orders()]
    
    builder = DatasetBuilder()
    X, y = builder.build_dataset(quotations=quotations, customers=customers, orders=orders)
    
    trainer = ModelTrainer(test_size=0.25, random_state=42, selection_metric="roc_auc")
    results = trainer.train_and_evaluate(X, y)
    
    assert "best_model_name" in results
    assert results["best_model_name"] in ["LogisticRegression", "RandomForest", "GradientBoosting"]
    assert "evaluation_results" in results
    assert "best_metrics" in results
    assert results["best_metrics"]["roc_auc"] >= 0.50
    assert len(results["feature_names"]) > 0
