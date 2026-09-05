import pandas as pd
import pytest
from src.recommendation.service import RecommendationService
from src.schemas.recommendation import RecommendationRequest

def test_recommendation_service_end_to_end():
    service = RecommendationService({
        "min_support": 0.2, # Very low since dataset is tiny
        "min_confidence": 0.4,
        "min_lift": 1.0,
        "max_results": 5
    })
    
    orders = pd.DataFrame([
        {'order_id': 'o1', 'customer_id': 'c1'},
        {'order_id': 'o2', 'customer_id': 'c2'},
        {'order_id': 'o3', 'customer_id': 'c1'},
    ])
    
    order_items = pd.DataFrame([
        {'order_id': 'o1', 'product_id': 'p1'},
        {'order_id': 'o1', 'product_id': 'p2'},
        {'order_id': 'o2', 'product_id': 'p1'},
        {'order_id': 'o2', 'product_id': 'p3'},
        {'order_id': 'o3', 'product_id': 'p1'},
        {'order_id': 'o3', 'product_id': 'p2'},
        {'order_id': 'o3', 'product_id': 'p4'},
    ])
    
    products = pd.DataFrame([
        {'product_id': 'p1', 'product_name': 'Desk', 'category': 'Furniture', 'selling_price': 100, 'cost_price': 80},
        {'product_id': 'p2', 'product_name': 'Chair', 'category': 'Furniture', 'selling_price': 50, 'cost_price': 30},
        {'product_id': 'p3', 'product_name': 'Lamp', 'category': 'Accessories', 'selling_price': 20, 'cost_price': 10},
        {'product_id': 'p4', 'product_name': 'Mat', 'category': 'Accessories', 'selling_price': 10, 'cost_price': 5},
    ])
    
    customers = pd.DataFrame([
        {'customer_id': 'c1'},
        {'customer_id': 'c2'}
    ])
    
    service.build_knowledge_base(orders, order_items, products, customers)
    assert service.is_initialized
    
    # p1 is in o1, o2, o3
    # p2 is in o1, o3
    # p3 is in o2
    # p4 is in o3
    # Rule p1 -> p2: p1 support is 3/3 (1.0). p1+p2 is 2/3 (0.66). Conf = 0.66.
    
    req = RecommendationRequest(
        customer_id='c1',
        product_ids=['p1'],
        limit=3
    )
    
    resp = service.get_recommendations(req)
    
    assert len(resp.recommendations) > 0
    assert resp.total_candidates > 0
    
    p2_rec = next((r for r in resp.recommendations if r.product_id == 'p2'), None)
    assert p2_rec is not None
    assert p2_rec.product_name == "Chair"
    assert p2_rec.category == "Furniture"
    
def test_service_uninitialized():
    service = RecommendationService()
    req = RecommendationRequest(product_ids=["p1"], limit=5)
    with pytest.raises(RuntimeError):
        service.get_recommendations(req)
