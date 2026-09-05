import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.schemas.mlops import ModelRegistryEntry, ModelStatus

def test_mlops_api_endpoints():
    with TestClient(app) as client:
        mlops_service = getattr(client.app.state, "mlops_service", None)
        assert mlops_service is not None

        # Register a test model if none present
        if not mlops_service.list_models("deal_outcome_prediction"):
            entry = ModelRegistryEntry(
                model_name="deal_outcome_prediction",
                model_version="1.0.0",
                status=ModelStatus.ACTIVE,
                created_at="2026-09-01T10:00:00Z",
                trained_at="2026-09-01T10:00:00Z",
                metrics={"roc_auc": 0.85, "f1": 0.80, "accuracy": 0.82},
                is_active=True
            )
            mlops_service.registry.register_model(entry)

        # 1. GET /api/v1/mlops/models
        res_list = client.get("/api/v1/mlops/models")
        assert res_list.status_code == 200
        assert isinstance(res_list.json(), list)
        assert len(res_list.json()) >= 1

        # 2. GET /api/v1/mlops/models/deal_outcome_prediction
        res_versions = client.get("/api/v1/mlops/models/deal_outcome_prediction")
        assert res_versions.status_code == 200
        assert len(res_versions.json()) >= 1

        # 3. GET /api/v1/mlops/models/deal_outcome_prediction/active
        res_active = client.get("/api/v1/mlops/models/deal_outcome_prediction/active")
        assert res_active.status_code == 200
        assert res_active.json()["model_version"] == "1.0.0"

        # 4. GET /api/v1/mlops/models/deal_outcome_prediction/health
        res_health = client.get("/api/v1/mlops/models/deal_outcome_prediction/health")
        assert res_health.status_code == 200
        assert "health_score" in res_health.json()
        assert "classification" in res_health.json()

        # 5. GET /api/v1/mlops/models/deal_outcome_prediction/performance
        res_perf = client.get("/api/v1/mlops/models/deal_outcome_prediction/performance")
        assert res_perf.status_code == 200
        assert "status" in res_perf.json()

        # 6. GET /api/v1/mlops/models/deal_outcome_prediction/drift
        res_drift = client.get("/api/v1/mlops/models/deal_outcome_prediction/drift")
        assert res_drift.status_code == 200
        assert "overall_drift" in res_drift.json()

        # 7. GET /api/v1/mlops/models/deal_outcome_prediction/retraining-advice
        res_advice = client.get("/api/v1/mlops/models/deal_outcome_prediction/retraining-advice")
        assert res_advice.status_code == 200
        assert "recommendation" in res_advice.json()

        # 8. POST /api/v1/mlops/feedback
        # First log a prediction observation
        mlops_service.log_prediction(
            model_name="deal_outcome_prediction",
            model_version="1.0.0",
            quotation_id="quote_api_test",
            predicted_outcome="LIKELY_TO_CONVERT",
            conversion_probability=0.85,
            confidence="HIGH",
            expected_revenue=50000.0
        )
        res_feedback = client.post("/api/v1/mlops/feedback", json={
            "quotation_id": "quote_api_test",
            "actual_outcome": "WON",
            "actual_revenue": 52000.0
        })
        assert res_feedback.status_code == 200
        assert res_feedback.json()["actual_outcome"] == "WON"
