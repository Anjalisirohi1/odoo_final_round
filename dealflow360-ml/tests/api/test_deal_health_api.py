import pytest
from fastapi.testclient import TestClient
from src.main import app

def test_deal_health_api_success():
    with TestClient(app) as client:
        service = getattr(client.app.state, "deal_health_service", None)
        assert service is not None
        assert service.is_initialized is True
        
        # Pick an existing quote from context builder
        quote_id = next(iter(service.context_builder.quotations_map.keys()))
        
        response = client.post("/api/v1/deal-health/analyze", json={"quotation_id": quote_id})
        assert response.status_code == 200
        
        data = response.json()
        assert data["quotation_id"] == quote_id
        assert "health_score" in data
        assert 0.0 <= data["health_score"] <= 100.0
        assert "classification" in data
        assert data["classification"] in ["EXCELLENT", "HEALTHY", "AT_RISK", "CRITICAL"]
        assert "dimension_scores" in data
        assert "conversion_potential" in data["dimension_scores"]
        assert "engagement" in data["dimension_scores"]
        assert "financial_health" in data["dimension_scores"]
        assert "momentum" in data["dimension_scores"]
        assert "risk_safety" in data["dimension_scores"]
        assert "momentum" in data
        assert "label" in data["momentum"]
        assert "strengths" in data
        assert "concerns" in data
        assert "recommended_actions" in data
        assert len(data["recommended_actions"]) > 0
        assert "action_type" in data["recommended_actions"][0]
        assert "priority" in data["recommended_actions"][0]
        assert "reason" in data["recommended_actions"][0]
        assert "evidence" in data["recommended_actions"][0]

def test_deal_health_api_not_found():
    with TestClient(app) as client:
        response = client.post("/api/v1/deal-health/analyze", json={"quotation_id": "nonexistent_quote_id_12345"})
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

def test_deal_health_api_invalid_request():
    with TestClient(app) as client:
        response = client.post("/api/v1/deal-health/analyze", json={})
        assert response.status_code == 422
