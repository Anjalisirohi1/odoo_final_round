from typing import Dict, List, Any, Optional
from src.schemas.deal_intelligence import IntelligenceClassification, SignalAgreement
from src.core.config import settings
from src.core.constants import DEFAULT_INTELLIGENCE_WEIGHTS

class IntelligenceScoreCalculator:
    """
    Computes a deterministic executive Deal Intelligence Score (0–100)
    combining opportunity factors, health state, anomaly risk penalties,
    and cross-module consensus adjustments. Handles dynamic weight rebalancing
    when one or more modules are unavailable.
    """

    def __init__(
        self,
        weight_conversion: Optional[float] = None,
        weight_health: Optional[float] = None,
        weight_risk_penalty: Optional[float] = None,
        agreement_bonus: Optional[float] = None,
        agreement_penalty: Optional[float] = None
    ):
        self.w_conv = weight_conversion if weight_conversion is not None else settings.INTELLIGENCE_WEIGHT_CONVERSION
        self.w_health = weight_health if weight_health is not None else settings.INTELLIGENCE_WEIGHT_HEALTH
        self.w_risk = weight_risk_penalty if weight_risk_penalty is not None else settings.INTELLIGENCE_WEIGHT_RISK_PENALTY
        self.agreement_bonus = agreement_bonus if agreement_bonus is not None else settings.INTELLIGENCE_AGREEMENT_BONUS
        self.agreement_penalty = agreement_penalty if agreement_penalty is not None else settings.INTELLIGENCE_AGREEMENT_PENALTY

    def calculate_score(
        self,
        conversion_probability: Optional[float] = None,
        health_score: Optional[float] = None,
        anomaly_score: Optional[float] = None,
        agreements: Optional[List[SignalAgreement]] = None
    ) -> Dict[str, Any]:
        """
        Calculates the unified score, classification, and breakdown components.
        """
        # Identify available components
        active_weights = {}
        values = {}

        if conversion_probability is not None:
            active_weights["conv"] = self.w_conv
            values["conv"] = min(1.0, max(0.0, float(conversion_probability))) * 100.0

        if health_score is not None:
            active_weights["health"] = self.w_health
            values["health"] = min(100.0, max(0.0, float(health_score)))

        if anomaly_score is not None:
            active_weights["risk"] = self.w_risk
            # Invert anomaly score for positive baseline, or calculate risk penalty
            values["risk_penalty"] = min(1.0, max(0.0, float(anomaly_score))) * 100.0

        # Fallback if no modules available
        if not active_weights:
            return {
                "intelligence_score": 50.0,
                "classification": IntelligenceClassification.MIXED,
                "components": {"default": 50.0},
                "agreement_adjustment": 0.0
            }

        # Dynamically normalize weights over available modules
        # Base formula: Score = (w_conv*conv + w_health*health) / (w_conv + w_health) - (w_risk * risk_penalty)
        opp_weight_sum = active_weights.get("conv", 0.0) + active_weights.get("health", 0.0)
        
        if opp_weight_sum > 0:
            opp_score = (
                (active_weights.get("conv", 0.0) * values.get("conv", 0.0))
                + (active_weights.get("health", 0.0) * values.get("health", 0.0))
            ) / opp_weight_sum
        else:
            # If only risk is available
            opp_score = 50.0

        risk_penalty = 0.0
        if "risk" in active_weights:
            # Risk penalty scales with anomaly severity
            risk_penalty = (values["risk_penalty"] * self.w_risk)

        base_score = opp_score - (risk_penalty if opp_weight_sum > 0 else (values.get("risk_penalty", 0.0) * 0.5))

        # Agreement adjustments
        adj = 0.0
        if agreements:
            for agr in agreements:
                if "POSITIVE" in agr.type:
                    adj += self.agreement_bonus if agr.confidence == "HIGH" else (self.agreement_bonus * 0.5)
                elif "NEGATIVE" in agr.type:
                    adj -= self.agreement_penalty if agr.confidence == "HIGH" else (self.agreement_penalty * 0.5)

        final_score = round(max(0.0, min(100.0, base_score + adj)), 2)

        # Classification
        if final_score >= settings.INTELLIGENCE_STRONG_OPPORTUNITY_THRESHOLD:
            classification = IntelligenceClassification.STRONG_OPPORTUNITY
        elif final_score >= settings.INTELLIGENCE_POSITIVE_THRESHOLD:
            classification = IntelligenceClassification.POSITIVE
        elif final_score >= settings.INTELLIGENCE_MIXED_THRESHOLD:
            classification = IntelligenceClassification.MIXED
        elif final_score >= settings.INTELLIGENCE_AT_RISK_THRESHOLD:
            classification = IntelligenceClassification.AT_RISK
        else:
            classification = IntelligenceClassification.CRITICAL

        return {
            "intelligence_score": final_score,
            "classification": classification,
            "components": {
                "opportunity_score": round(opp_score, 2),
                "risk_penalty": round(risk_penalty, 2),
                "agreement_adjustment": round(adj, 2)
            }
        }
