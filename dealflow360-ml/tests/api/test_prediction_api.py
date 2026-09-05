import pytest
from fastapi.testclient import TestClient
from src.main import app

def test_prediction_api_success():
    with TestClient(app) as client:
        service = getattr(client.app.state, "prediction_service", None)
        assert service is not None
        assert service.is_initialized is True
        
        # Pick quotation ID
        quote_id = next(iter(service.quotations_map.keys()))
        
        response = client.post("/api/v1/predictions/deal", json={"quotation_id": quote_id})
        assert response.status_code == 200
        
        data = response.json()
        assert data["quotation_id"] == quote_id
        assert "conversion_probability" in data
        assert 0.0 <= data["conversion_probability"] <= 1.0
        assert "predicted_outcome" in data
        assert data["predicted_outcome"] in ["LIKELY_TO_CONVERT", "UNCERTAIN", "LIKELY_TO_LOSE"]
        assert "confidence" in data
        assert "level" in data["confidence"]
        assert "revenue_forecast" in data
        assert "expected_revenue" in data["revenue_forecast"]
        assert "priority" in data
        assert "score" in data["priority"]
        assert "top_positive_factors" in data
        assert "top_negative_factors" in data
        assert "model_metadata" in data
        assert "model_name" in data["model_metadata"]

def test_prediction_api_not_found():
    with TestClient(app) as client:
        response = client.post("/api/v1/predictions/deal", json={"quotation_id": "nonexistent_quote_9999"})
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

def test_prediction_api_invalid_request():
    with TestClient(app) as client:
        response = client.post("/api/v1/predictions/deal", json={})
        assert response.status_code == 422

def test_prediction_api_model_not_trained():
    with TestClient(app) as client:
        # Simulate uninitialized model state
        service = getattr(client.app.state, "prediction_service", None)
        assert service is not None
        original_state = service.is_initialized
        try:
            service.is_initialized = False
            response = client.post("/api/v1/predictions/deal", json={"quotation_id": "any_quote"})
            assert response.status_code == 503
            detail = response.json()["detail"]
            assert detail["error"] == "MODEL_NOT_TRAINED"
            assert "train_prediction_model.py" in detail["message"]
        finally:
            service.is_initialized = original_state
