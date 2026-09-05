from fastapi.testclient import TestClient
from src.main import app
import pytest

@pytest.fixture
def client():
    # Uses TestClient inside lifespan context to initialize services properly
    with TestClient(app) as c:
        yield c

def test_get_quotation_anomaly_success(client):
    # This assumes quotation "quotation_0" exists from SyntheticDataProvider
    # But since we use UUIDs in SyntheticDataProvider, let's grab one from the app state
    service = app.state.anomaly_service
    q_id = list(service.historical_quotations.keys())[0]
    
    payload = {"quotation_id": q_id}
    response = client.post("/api/v1/anomalies/quotation", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["quotation_id"] == q_id
    assert "is_anomaly" in data
    assert "risk_level" in data

def test_get_quotation_anomaly_not_found(client):
    payload = {"quotation_id": "non_existent_q_id"}
    response = client.post("/api/v1/anomalies/quotation", json=payload)
    
    assert response.status_code == 404
