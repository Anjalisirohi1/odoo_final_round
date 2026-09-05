from typing import Dict, Any, Tuple, List
from .context_builder import DealContext

class FinancialHealthScorer:
    """
    Evaluates the commercial and financial sustainability of a deal.
    Assesses gross margins, discount discipline, and discount-to-margin balance.
    """
    
    def __init__(
        self,
        target_margin_pct: float = 40.0,
        max_acceptable_discount_pct: float = 30.0,
        max_acceptable_discount_margin_ratio: float = 1.5
    ):
        self.target_margin_pct = target_margin_pct
        self.max_acceptable_discount_pct = max_acceptable_discount_pct
        self.max_acceptable_discount_margin_ratio = max_acceptable_discount_margin_ratio

    def score(self, context: DealContext) -> Tuple[float, Dict[str, Any], List[str], List[str]]:
        quotation = context.quotation
        
        total_amount = float(quotation.get("total_amount", 0.0))
        total_discount = float(quotation.get("total_discount", 0.0))
        total_margin = float(quotation.get("total_margin", 0.0))
        
        strengths = []
        concerns = []
        
        if total_amount <= 0.0:
            evidence = {
                "total_amount": total_amount,
                "total_discount": total_discount,
                "total_margin": total_margin,
                "discount_percentage": 0.0,
                "margin_percentage": 0.0,
                "calculated_score": 0.50
            }
            concerns.append("Zero or missing quotation monetary value.")
            return 0.50, evidence, strengths, concerns

        original_value = total_amount + total_discount
        discount_pct = (total_discount / original_value * 100.0) if original_value > 0 else 0.0
        margin_pct = (total_margin / total_amount * 100.0)
        
        # Discount to margin ratio
        if margin_pct > 0:
            discount_to_margin_ratio = discount_pct / margin_pct
        else:
            discount_to_margin_ratio = 5.0 if discount_pct > 0 else 0.0
            
        margin_score = min(1.0, max(0.0, margin_pct / self.target_margin_pct))
        discount_penalty = min(1.0, max(0.0, discount_pct / self.max_acceptable_discount_pct))
        ratio_penalty = min(1.0, max(0.0, discount_to_margin_ratio / self.max_acceptable_discount_margin_ratio))
        
        score = (
            0.50 * margin_score
            + 0.30 * (1.0 - discount_penalty)
            + 0.20 * (1.0 - ratio_penalty)
        )
        score = min(1.0, max(0.0, score))
        
        evidence = {
            "total_amount": round(total_amount, 2),
            "total_discount": round(total_discount, 2),
            "total_margin": round(total_margin, 2),
            "discount_percentage": round(discount_pct, 2),
            "margin_percentage": round(margin_pct, 2),
            "discount_to_margin_ratio": round(discount_to_margin_ratio, 2),
            "margin_score": round(margin_score, 4),
            "discount_penalty": round(discount_penalty, 4),
            "calculated_score": round(score, 4)
        }
        
        if margin_pct >= 30.0:
            strengths.append(f"Strong profit margin ({margin_pct:.1f}%).")
        elif margin_pct < 15.0:
            concerns.append(f"Compressed profit margin ({margin_pct:.1f}%).")
            
        if discount_pct <= 10.0:
            strengths.append(f"Disciplined discount rate ({discount_pct:.1f}%).")
        elif discount_pct >= 25.0:
            concerns.append(f"Excessive discount concession ({discount_pct:.1f}%).")
            
        if discount_to_margin_ratio > 1.2:
            concerns.append(f"Discount-to-margin ratio ({discount_to_margin_ratio:.2f}) indicates severe profitability erosion.")
            
        return score, evidence, strengths, concerns
