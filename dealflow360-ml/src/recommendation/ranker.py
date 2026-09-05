from typing import List, Dict, Any

class RecommendationRanker:
    def __init__(self, weights: Dict[str, float] = None):
        """
        Initializes the RecommendationRanker with optional custom weights.
        """
        self.weights = weights or {
            "association": 0.45,
            "margin": 0.20,
            "customer": 0.20,
            "popularity": 0.15
        }
        
    def rank(
        self, 
        candidates: List[Dict[str, Any]], 
        product_margins: Dict[str, float], 
        customer_affinity: Dict[str, float], 
        product_popularity: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """
        Applies a business-aware ranking formula to a list of candidates.
        """
        for candidate in candidates:
            p_id = candidate["product_id"]
            
            # Scores expected to be 0.0 - 1.0
            assoc_score = candidate.get("association_score", 0.0)
            
            # Margin score: assume 50% margin (0.50) is excellent (score 1.0)
            margin_val = product_margins.get(p_id, 0.0)
            margin_score = min(1.0, max(0.0, margin_val / 0.50)) 
            
            cust_score = min(1.0, max(0.0, customer_affinity.get(p_id, 0.0)))
            pop_score = min(1.0, max(0.0, product_popularity.get(p_id, 0.0)))
            
            final_score = (
                self.weights["association"] * assoc_score +
                self.weights["margin"] * margin_score +
                self.weights["customer"] * cust_score +
                self.weights["popularity"] * pop_score
            )
            
            # Ensure final score is cleanly bound between 0 and 1
            final_score = min(1.0, max(0.0, final_score))
            
            candidate["final_score"] = final_score
            candidate["expected_margin"] = margin_val
            
        # Sort descending by final score
        candidates.sort(key=lambda x: x["final_score"], reverse=True)
        return candidates
