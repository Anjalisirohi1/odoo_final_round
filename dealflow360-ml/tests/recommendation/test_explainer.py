from src.recommendation.explainer import RecommendationExplainer

def test_recommendation_explainer():
    explainer = RecommendationExplainer()
    
    product_names = {
        "p1": "Office Desk",
        "p2": "Ergonomic Chair"
    }
    
    # 1. High confidence, single rule
    c1 = {
        "product_id": "p3",
        "association_score": 0.8,
        "final_score": 0.75,
        "supporting_rules": [
            {"antecedent": ["p1"]}
        ]
    }
    reason, conf = explainer.generate_explanation(c1, product_names)
    assert conf == "HIGH"
    assert "Office Desk" in reason
    
    # 2. Medium confidence, multiple rules
    c2 = {
        "product_id": "p4",
        "association_score": 0.5,
        "final_score": 0.6,
        "supporting_rules": [
            {"antecedent": ["p1"]},
            {"antecedent": ["p2"]}
        ]
    }
    reason, conf = explainer.generate_explanation(c2, product_names)
    assert conf == "MEDIUM"
    assert "multiple products" in reason
    
    # 3. Low confidence, no rules (fallback)
    c3 = {
        "product_id": "p5",
        "association_score": 0.1,
        "final_score": 0.2,
        "supporting_rules": []
    }
    reason, conf = explainer.generate_explanation(c3, product_names)
    assert conf == "LOW"
    assert "popular" in reason
