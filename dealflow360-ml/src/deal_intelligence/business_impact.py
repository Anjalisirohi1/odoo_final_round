from typing import Dict, Any, Optional, Tuple
from src.schemas.deal_intelligence import BusinessImpactLevel
from src.core.config import settings

class BusinessImpactEngine:
    """
    Evaluates commercial stakes and prioritizes business impact of intelligence findings
    based on expected revenue, total quotation value, risk severity, and conversion velocity.
    """

    def __init__(
        self,
        critical_revenue: Optional[float] = None,
        high_revenue: Optional[float] = None,
        medium_revenue: Optional[float] = None
    ):
        self.critical_revenue = critical_revenue or settings.BUSINESS_IMPACT_CRITICAL_REVENUE
        self.high_revenue = high_revenue or settings.BUSINESS_IMPACT_HIGH_REVENUE
        self.medium_revenue = medium_revenue or settings.BUSINESS_IMPACT_MEDIUM_REVENUE

    def evaluate_impact(
        self,
        quotation_value: float,
        expected_revenue: Optional[float] = None,
        risk_level: Optional[str] = None,
        health_classification: Optional[str] = None,
        conversion_probability: Optional[float] = None,
        priority_classification: Optional[str] = None
    ) -> Tuple[BusinessImpactLevel, str]:
        """
        Calculates business impact level and a human-readable justification.
        """
        revenue_at_stake = expected_revenue if expected_revenue is not None and expected_revenue > 0 else quotation_value
        risk = (risk_level or "LOW").upper()
        health = (health_classification or "HEALTHY").upper()
        p_class = (priority_classification or "MEDIUM_PRIORITY").upper()
        prob = conversion_probability if conversion_probability is not None else 0.5

        # 1. CRITICAL Impact conditions
        if revenue_at_stake >= self.critical_revenue:
            if risk in ["HIGH", "CRITICAL"]:
                return BusinessImpactLevel.CRITICAL, f"Major revenue exposure of ₹{revenue_at_stake:,.2f} with severe risk profile ({risk})."
            elif prob >= 0.65:
                return BusinessImpactLevel.CRITICAL, f"High-value strategic conversion opportunity of ₹{revenue_at_stake:,.2f}."
            return BusinessImpactLevel.CRITICAL, f"Enterprise tier deal representing ₹{revenue_at_stake:,.2f} in pipeline value."

        if p_class == "CRITICAL_ATTENTION" and revenue_at_stake >= self.high_revenue:
            return BusinessImpactLevel.CRITICAL, f"Critical priority pipeline deal with ₹{revenue_at_stake:,.2f} at stake."

        # 2. HIGH Impact conditions
        if revenue_at_stake >= self.high_revenue:
            if risk in ["HIGH", "CRITICAL"]:
                return BusinessImpactLevel.HIGH, f"High-tier commercial deal of ₹{revenue_at_stake:,.2f} facing elevated risk factors."
            return BusinessImpactLevel.HIGH, f"Significant revenue contribution of ₹{revenue_at_stake:,.2f}."

        if risk == "CRITICAL" and revenue_at_stake >= self.medium_revenue:
            return BusinessImpactLevel.HIGH, f"Moderate value deal (₹{revenue_at_stake:,.2f}) with critical anomalies requiring intervention."

        # 3. MEDIUM Impact conditions
        if revenue_at_stake >= self.medium_revenue:
            return BusinessImpactLevel.MEDIUM, f"Standard commercial opportunity valued at ₹{revenue_at_stake:,.2f}."

        if risk in ["HIGH", "CRITICAL"]:
            return BusinessImpactLevel.MEDIUM, f"Lower value transaction (₹{revenue_at_stake:,.2f}) exhibiting high anomaly risk."

        # 4. LOW Impact
        return BusinessImpactLevel.LOW, f"Low financial exposure deal valued at ₹{revenue_at_stake:,.2f}."
