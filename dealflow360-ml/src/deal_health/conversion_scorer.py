from typing import Dict, Any, Tuple, List
from .context_builder import DealContext

TIER_MULTIPLIERS = {
    "PLATINUM": 1.15,
    "GOLD": 1.05,
    "SILVER": 0.95,
    "BRONZE": 0.85
}

COLD_START_TIER_PRIORS = {
    "PLATINUM": 0.60,
    "GOLD": 0.50,
    "SILVER": 0.40,
    "BRONZE": 0.30
}

DEFAULT_COLD_START_PRIOR = 0.40

class ConversionPotentialScorer:
    """
    Evaluates the historical propensity of the customer to convert.
    Combines empirical conversion rate with account tier calibration.
    """
    
    def score(self, context: DealContext) -> Tuple[float, Dict[str, Any], List[str], List[str]]:
        """
        Calculates conversion potential score in [0.0, 1.0], evidence, strengths, and concerns.
        """
        customer = context.customer or {}
        tier = str(customer.get("customer_tier", "BRONZE")).upper()
        
        total_orders = len(context.customer_orders)
        total_quotes = len(context.customer_quotations)
        
        strengths = []
        concerns = []
        
        # Cold start handling
        if total_quotes == 0:
            score = COLD_START_TIER_PRIORS.get(tier, DEFAULT_COLD_START_PRIOR)
            evidence = {
                "is_cold_start": True,
                "customer_tier": tier,
                "total_orders": total_orders,
                "total_quotes": total_quotes,
                "conversion_rate": None,
                "calculated_score": round(score, 4)
            }
            concerns.append(f"New customer profile without prior deal history; assigned {tier} baseline.")
            return score, evidence, strengths, concerns

        # Empirical conversion calculation
        raw_conversion_rate = total_orders / max(1, total_quotes)
        multiplier = TIER_MULTIPLIERS.get(tier, 1.0)
        
        # Calibration
        score = min(1.0, max(0.0, raw_conversion_rate * multiplier))
        
        evidence = {
            "is_cold_start": False,
            "customer_tier": tier,
            "total_orders": total_orders,
            "total_quotes": total_quotes,
            "conversion_rate": round(raw_conversion_rate, 4),
            "tier_multiplier": multiplier,
            "calculated_score": round(score, 4)
        }
        
        if raw_conversion_rate >= 0.60:
            strengths.append(f"Strong historical customer conversion rate ({raw_conversion_rate*100:.1f}%) across {total_quotes} previous quotations.")
        elif raw_conversion_rate <= 0.25 and total_quotes >= 3:
            concerns.append(f"Low historical conversion rate ({raw_conversion_rate*100:.1f}%) for this account.")
            
        if tier in ["PLATINUM", "GOLD"]:
            strengths.append(f"High-priority {tier} customer relationship.")
            
        return score, evidence, strengths, concerns
