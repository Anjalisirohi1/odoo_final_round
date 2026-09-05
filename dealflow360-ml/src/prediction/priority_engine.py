from typing import Dict, Any, Optional
from src.schemas.prediction import PriorityClassification, PriorityResult
from src.core.config import settings

class PriorityEngine:
    """
    Ranks deals dynamically based on conversion probability, expected revenue,
    health stability, momentum trajectory, and risk mitigation.
    """
    
    def __init__(
        self,
        reference_deal_value: float = 10000.0,
        weight_conversion: float = None,
        weight_revenue: float = None,
        weight_health: float = None,
        weight_momentum: float = None,
        weight_risk: float = None
    ):
        self.reference_deal_value = reference_deal_value
        self.w_conv = weight_conversion if weight_conversion is not None else settings.PRIORITY_WEIGHT_CONVERSION
        self.w_rev = weight_revenue if weight_revenue is not None else settings.PRIORITY_WEIGHT_REVENUE
        self.w_health = weight_health if weight_health is not None else settings.PRIORITY_WEIGHT_HEALTH
        self.w_mom = weight_momentum if weight_momentum is not None else settings.PRIORITY_WEIGHT_MOMENTUM
        self.w_risk = weight_risk if weight_risk is not None else settings.PRIORITY_WEIGHT_RISK_PENALTY

    def calculate_priority(
        self,
        conversion_probability: float,
        quotation_value: float,
        health_score: Optional[float] = None,
        momentum_score: Optional[float] = None,
        anomaly_score: Optional[float] = None
    ) -> PriorityResult:
        p_conv = min(1.0, max(0.0, float(conversion_probability)))
        rev_factor = min(1.0, max(0.0, float(quotation_value) / self.reference_deal_value))
        
        health_factor = (min(100.0, max(0.0, float(health_score))) / 100.0) if health_score is not None else 0.50
        mom_factor = min(1.0, max(0.0, float(momentum_score))) if momentum_score is not None else 0.50
        risk_penalty = min(1.0, max(0.0, float(anomaly_score))) if anomaly_score is not None else 0.0
        
        raw_score = (
            self.w_conv * p_conv
            + self.w_rev * rev_factor
            + self.w_health * health_factor
            + self.w_mom * mom_factor
            - self.w_risk * risk_penalty
        )
        
        normalized_score = min(1.0, max(0.0, raw_score))
        priority_score = round(normalized_score * 100.0, 2)
        
        if priority_score >= settings.PRIORITY_CRITICAL_THRESHOLD:
            classification = PriorityClassification.CRITICAL_ATTENTION
        elif priority_score >= settings.PRIORITY_HIGH_THRESHOLD:
            classification = PriorityClassification.HIGH_PRIORITY
        elif priority_score >= settings.PRIORITY_MEDIUM_THRESHOLD:
            classification = PriorityClassification.MEDIUM_PRIORITY
        else:
            classification = PriorityClassification.LOW_PRIORITY
            
        components = {
            "conversion_contribution": round(self.w_conv * p_conv, 4),
            "revenue_contribution": round(self.w_rev * rev_factor, 4),
            "health_contribution": round(self.w_health * health_factor, 4),
            "momentum_contribution": round(self.w_mom * mom_factor, 4),
            "risk_penalty": round(self.w_risk * risk_penalty, 4)
        }
        
        return PriorityResult(
            score=priority_score,
            classification=classification,
            components=components
        )
