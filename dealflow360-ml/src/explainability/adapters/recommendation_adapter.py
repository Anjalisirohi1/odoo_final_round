from typing import Dict, Any, List
from src.schemas.explainability import ModuleExplanationSummary

class RecommendationExplanationAdapter:
    """
    Standardizes Smart Product Recommendation explanations into unified XAI schemas
    without duplicating FP-growth rule calculations.
    """

    def adapt_module_summary(self, recommendation_result: Dict[str, Any]) -> ModuleExplanationSummary:
        recommendations = recommendation_result.get("recommendations", [])
        if not recommendations:
            return ModuleExplanationSummary(
                module_name="Product Recommendations",
                summary="No cross-sell or bundle recommendations generated for current quotation items.",
                method="ASSOCIATION_RULE_ANALYSIS",
                key_drivers=["No strong frequent itemset association found."],
                confidence="LOW"
            )

        top_rec = recommendations[0]
        p_name = top_rec.get("product_name", top_rec.get("product_id", "Product"))
        reason = top_rec.get("reason", "Frequently purchased with current basket.")
        conf = top_rec.get("confidence", "MEDIUM")

        drivers = [f"Recommend {r.get('product_name', r.get('product_id'))}: {r.get('reason')}" for r in recommendations[:2]]

        return ModuleExplanationSummary(
            module_name="Product Recommendations",
            summary=f"Top recommendation is {p_name}: {reason}",
            method="ASSOCIATION_RULE_ANALYSIS",
            key_drivers=drivers,
            confidence=conf
        )
