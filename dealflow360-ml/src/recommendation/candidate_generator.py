from typing import List, Dict, Any

class CandidateGenerator:
    def __init__(self):
        pass
        
    def generate_candidates(self, current_products: List[str], rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generates candidate products based on the current products in quotation and association rules.
        :param current_products: List of product IDs currently in the quotation.
        :param rules: List of association rules.
        :return: List of candidate dictionaries with aggregated association scores.
        """
        current_set = set(current_products)
        candidates_map = {}
        
        for rule in rules:
            antecedent_set = set(rule['antecedent'])
            
            # The rule applies if the antecedent is a subset of current products
            if antecedent_set.issubset(current_set):
                
                for consequent_product in rule['consequent']:
                    # We only recommend products NOT already in the quotation
                    if consequent_product not in current_set:
                        
                        if consequent_product not in candidates_map:
                            candidates_map[consequent_product] = {
                                "product_id": consequent_product,
                                "supporting_rules": [],
                                "max_confidence": 0.0,
                                "max_lift": 0.0
                            }
                            
                        # Update metrics
                        candidates_map[consequent_product]["supporting_rules"].append(rule)
                        candidates_map[consequent_product]["max_confidence"] = max(
                            candidates_map[consequent_product]["max_confidence"], 
                            rule['confidence']
                        )
                        candidates_map[consequent_product]["max_lift"] = max(
                            candidates_map[consequent_product]["max_lift"], 
                            rule['lift']
                        )
                        
        candidates = []
        for p_id, data in candidates_map.items():
            num_rules = len(data["supporting_rules"])
            
            # Simple aggregation logic: max_confidence plus a small bonus for each additional supporting rule
            base_score = data["max_confidence"]
            bonus = (num_rules - 1) * 0.05
            assoc_score = min(1.0, base_score + bonus)
            
            data["association_score"] = assoc_score
            candidates.append(data)
            
        return candidates
