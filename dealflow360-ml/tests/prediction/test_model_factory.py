import pytest
from src.prediction.model_factory import ModelFactory

def test_model_factory_returns_candidates():
    models = ModelFactory.get_candidate_models(random_state=42)
    assert "LogisticRegression" in models
    assert "RandomForest" in models
    assert "GradientBoosting" in models
    
    for name, model in models.items():
        assert hasattr(model, "fit")
        assert hasattr(model, "predict")
