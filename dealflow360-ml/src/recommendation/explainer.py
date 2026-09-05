from typing import Dict, Any, Tuple

class RecommendationExplainer:
    def __init__(self):
        pass
        
    def generate_explanation(self, candidate: Dict[str, Any], product_names: Dict[str, str]) -> Tuple[str, str]:
        """
        Generates a human-readable reason and a confidence level (HIGH/MEDIUM/LOW).
        :param candidate: The candidate dictionary with scores and supporting rules.
        :param product_names: Mapping of product_id to product_name to provide readable reasons.
        :return: (reason_string, confidence_level)
        """
        rules = candidate.get("supporting_rules", [])
        num_rules = len(rules)
        
        if num_rules > 1:
            reason = "Frequently purchased with multiple products in the current quotation."
        elif num_rules == 1:
            antecedents = rules[0]["antecedent"]
            names = [product_names.get(p_id, p_id) for p_id in antecedents]
            names_str = " and ".join(names)
            reason = f"Frequently purchased with {names_str}."
        else:
            reason = "Recommended based on popular purchasing patterns."
            
        # Add a note if customer affinity was a strong factor (final score > assoc by a lot)
        assoc_score = candidate.get("association_score", 0.0)
        final_score = candidate.get("final_score", 0.0)
        
        # Determine confidence based primarily on association strength
        if assoc_score >= 0.7 or final_score >= 0.8:
            confidence = "HIGH"
        elif assoc_score >= 0.4 or final_score >= 0.5:
            confidence = "MEDIUM"
        else:
            confidence = "LOW"
            
        return reason, confidence
