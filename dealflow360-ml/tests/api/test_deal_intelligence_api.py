import pytest
from fastapi.testclient import TestClient
from src.main import app

def test_deal_intelligence_api_success():
    with TestClient(app) as client:
        service = getattr(client.app.state, "deal_intelligence_service", None)
        assert service is not None
        assert service.is_initialized is True

        quote_id = next(iter(service.context_builder.quotations_map.keys()))

        response = client.post("/api/v1/deal-intelligence/analyze", json={"quotation_id": quote_id})
        assert response.status_code == 200

        data = response.json()
        assert data["quotation_id"] == quote_id
        assert "overall_assessment" in data
        assert "intelligence_score" in data["overall_assessment"]
        assert 0.0 <= data["overall_assessment"]["intelligence_score"] <= 100.0
        assert "classification" in data["overall_assessment"]
        assert "business_impact" in data["overall_assessment"]
        assert "summary" in data["overall_assessment"]

        assert "module_status" in data
        assert "RECOMMENDATION" in data["module_status"]
        assert "ANOMALY_DETECTION" in data["module_status"]
        assert "DEAL_HEALTH" in data["module_status"]
        assert "PREDICTION" in data["module_status"]

        assert "key_positive_signals" in data
        assert "key_risks" in data
        assert "signal_agreements" in data
        assert "signal_conflicts" in data
        assert "recommended_actions" in data
        assert "top_insights" in data
        assert "intelligence_timeline" in data
        assert "generated_at" in data

def test_deal_intelligence_api_not_found():
    with TestClient(app) as client:
        response = client.post("/api/v1/deal-intelligence/analyze", json={"quotation_id": "nonexistent_quote_99999"})
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

def test_deal_intelligence_api_invalid_request():
    with TestClient(app) as client:
        response = client.post("/api/v1/deal-intelligence/analyze", json={})
        assert response.status_code == 422
