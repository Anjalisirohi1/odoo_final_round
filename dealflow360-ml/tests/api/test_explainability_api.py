import pytest
from fastapi.testclient import TestClient
from src.main import app

def test_explain_prediction_api_success():
    with TestClient(app) as client:
        pred_service = getattr(client.app.state, "prediction_service", None)
        assert pred_service is not None

        quote_id = next(iter(pred_service.quotations_map.keys()))

        # 1. Test POST /api/v1/explanations/prediction
        resp = client.post("/api/v1/explanations/prediction", json={"quotation_id": quote_id})
        assert resp.status_code == 200

        data = resp.json()
        assert data["quotation_id"] == quote_id
        assert data["decision_type"] == "PREDICTION"
        assert "summary" in data
        assert "positive_drivers" in data
        assert "negative_drivers" in data
        assert "explanation_confidence" in data
        assert "method" in data
        assert "metadata" in data
        assert data["metadata"]["model_name"] == pred_service.model_name

def test_explain_prediction_api_not_found():
    with TestClient(app) as client:
        resp = client.post("/api/v1/explanations/prediction", json={"quotation_id": "nonexistent_quote_xyz"})
        assert resp.status_code == 404

def test_get_global_importance_api_success():
    with TestClient(app) as client:
        resp = client.get("/api/v1/explanations/prediction/global")
        assert resp.status_code == 200

        data = resp.json()
        assert "model_name" in data
        assert "feature_importance" in data
        assert len(data["feature_importance"]) > 0
        assert data["feature_importance"][0]["rank"] == 1
        assert "label" in data["feature_importance"][0]

def test_explain_deal_unified_api_success():
    with TestClient(app) as client:
        pred_service = getattr(client.app.state, "prediction_service", None)
        quote_id = next(iter(pred_service.quotations_map.keys()))

        resp = client.post("/api/v1/explanations/deal", json={"quotation_id": quote_id})
        assert resp.status_code == 200

        data = resp.json()
        assert data["quotation_id"] == quote_id
        assert "executive_summary" in data
        assert "module_summaries" in data
        assert "overall_explanation_confidence" in data
