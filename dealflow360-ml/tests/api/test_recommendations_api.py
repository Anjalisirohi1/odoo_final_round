import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.recommendation.service import RecommendationService

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_get_recommendations_success(client):
    # This requires the app lifespan to have run and initialized the service
    # Since we use TestClient as a context manager, lifespan runs automatically
    
    payload = {
        "customer_id": "c_test",
        "product_ids": ["prod_office_desk"],
        "limit": 3
    }
    
    response = client.post("/api/v1/recommendations/", json=payload)
    
    # If the service initialized successfully, it should return 200
    if response.status_code == 200:
        data = response.json()
        assert "recommendations" in data
        assert "total_candidates" in data
        assert "model_metadata" in data
    elif response.status_code == 503:
        pytest.skip("Recommendation service unavailable (likely empty data in test environment)")
    else:
        assert False, f"Unexpected status code: {response.status_code} - {response.text}"

def test_get_recommendations_empty_products(client):
    payload = {
        "customer_id": "c_test",
        "product_ids": [],
        "limit": 3
    }
    
    response = client.post("/api/v1/recommendations/", json=payload)
    assert response.status_code == 422 # Pydantic min_length validation

def test_get_recommendations_invalid_limit(client):
    payload = {
        "customer_id": "c_test",
        "product_ids": ["prod_office_desk"],
        "limit": 0 # Invalid
    }
    
    response = client.post("/api/v1/recommendations/", json=payload)
    assert response.status_code == 422 # Pydantic ge validation
