import pandas as pd
from typing import List, Dict, Any
from mlxtend.frequent_patterns import association_rules

class AssociationRuleEngine:
    def __init__(self, min_confidence: float = 0.3, min_lift: float = 1.0):
        """
        Initializes the AssociationRuleEngine.
        :param min_confidence: Minimum confidence threshold.
        :param min_lift: Minimum lift threshold.
        """
        self.min_confidence = min_confidence
        self.min_lift = min_lift
        
    def generate_rules(self, frequent_itemsets: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Generates association rules from frequent itemsets.
        Returns a list of structured dictionaries without frozensets.
        """
        if frequent_itemsets.empty:
            return []
            
        try:
            rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=self.min_confidence)
        except ValueError:
            # Raised if frequent_itemsets is too small to generate rules
            return []
            
        # Filter by lift
        rules = rules[rules['lift'] >= self.min_lift]
        
        structured_rules = []
        for _, row in rules.iterrows():
            antecedent = sorted(list(row['antecedents']))
            consequent = sorted(list(row['consequents']))
            
            structured_rules.append({
                "antecedent": antecedent,
                "consequent": consequent,
                "support": float(row['support']),
                "confidence": float(row['confidence']),
                "lift": float(row['lift'])
            })
            
        return structured_rules
