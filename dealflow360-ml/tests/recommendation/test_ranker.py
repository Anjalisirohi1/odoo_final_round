from src.recommendation.ranker import RecommendationRanker

def test_recommendation_ranker():
    ranker = RecommendationRanker()
    
    candidates = [
        {"product_id": "p1", "association_score": 1.0},
        {"product_id": "p2", "association_score": 0.8},
        {"product_id": "p3", "association_score": 0.5}
    ]
    
    margins = {"p1": 0.1, "p2": 0.5, "p3": 0.25} # p2 has best margin
    affinities = {"p1": 0.0, "p2": 1.0, "p3": 0.0} # p2 has best affinity
    popularities = {"p1": 1.0, "p2": 1.0, "p3": 0.5} 
    
    ranked = ranker.rank(candidates, margins, affinities, popularities)
    
    # p2 should beat p1 despite lower association score because of margin and affinity
    # p1 score: 0.45*1.0 + 0.20*(0.1/0.5=0.2) + 0.20*0.0 + 0.15*1.0 = 0.45 + 0.04 + 0 + 0.15 = 0.64
    # p2 score: 0.45*0.8 + 0.20*1.0 + 0.20*1.0 + 0.15*1.0 = 0.36 + 0.20 + 0.20 + 0.15 = 0.91
    
    assert len(ranked) == 3
    assert ranked[0]["product_id"] == "p2"
    assert ranked[1]["product_id"] == "p1"
    assert ranked[2]["product_id"] == "p3"
    
    assert abs(ranked[0]["final_score"] - 0.91) < 0.001
    assert abs(ranked[1]["final_score"] - 0.64) < 0.001
    assert ranked[0]["expected_margin"] == 0.5
