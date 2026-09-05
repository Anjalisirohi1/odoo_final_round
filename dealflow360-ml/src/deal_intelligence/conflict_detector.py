from typing import Dict, List, Any, Optional
from src.schemas.deal_intelligence import (
    SignalConflict, InsightImportance, ModuleName
)
from src.core.config import settings

class ConflictDetector:
    """
    Detects contradictory or mismatched cross-module intelligence signals
    using deterministic, configurable business rules.
    """

    def __init__(
        self,
        high_prediction_threshold: Optional[float] = None,
        low_prediction_threshold: Optional[float] = None,
        healthy_threshold: Optional[float] = None,
        high_value_threshold: Optional[float] = None
    ):
        self.high_prediction_threshold = high_prediction_threshold or settings.CONFLICT_HIGH_PREDICTION_THRESHOLD
        self.low_prediction_threshold = low_prediction_threshold or settings.CONFLICT_LOW_PREDICTION_THRESHOLD
        self.healthy_threshold = healthy_threshold or settings.CONFLICT_HEALTHY_THRESHOLD
        self.high_value_threshold = high_value_threshold or settings.BUSINESS_IMPACT_HIGH_REVENUE

    def detect_conflicts(
        self,
        anomaly_data: Optional[Dict[str, Any]] = None,
        health_data: Optional[Dict[str, Any]] = None,
        prediction_data: Optional[Dict[str, Any]] = None,
        context_data: Optional[Dict[str, Any]] = None
    ) -> List[SignalConflict]:
        conflicts: List[SignalConflict] = []

        # Extract primary metrics safely
        conv_prob: Optional[float] = None
        predicted_outcome: Optional[str] = None
        expected_revenue: Optional[float] = None
        if prediction_data:
            conv_prob = prediction_data.get("conversion_probability")
            predicted_outcome = str(prediction_data.get("predicted_outcome", ""))
            rev_f = prediction_data.get("revenue_forecast")
            if rev_f:
                expected_revenue = float(getattr(rev_f, "expected_revenue", 0.0) if not isinstance(rev_f, dict) else rev_f.get("expected_revenue", 0.0))

        health_score: Optional[float] = None
        health_classification: Optional[str] = None
        momentum_label: Optional[str] = None
        if health_data:
            health_score = health_data.get("health_score")
            health_classification = str(health_data.get("classification", "")).upper()
            mom = health_data.get("momentum")
            if mom:
                momentum_label = str(getattr(mom, "label", "") if not isinstance(mom, dict) else mom.get("label", "")).upper()

        risk_level: Optional[str] = None
        anomaly_score: Optional[float] = None
        if anomaly_data:
            risk_level = str(anomaly_data.get("risk_level", "")).upper()
            anomaly_score = anomaly_data.get("anomaly_score")

        quote_value = float(context_data.get("total_amount", 0.0)) if context_data else 0.0
        effective_value = expected_revenue if expected_revenue is not None and expected_revenue > 0 else quote_value

        # RULE 1: High Prediction + Poor Deal Health
        if conv_prob is not None and conv_prob >= self.high_prediction_threshold:
            if health_classification in ["AT_RISK", "CRITICAL"] or (health_score is not None and health_score < 40.0):
                severity = InsightImportance.CRITICAL if health_classification == "CRITICAL" else InsightImportance.HIGH
                conflicts.append(SignalConflict(
                    type="HEALTH_PREDICTION_MISMATCH",
                    severity=severity,
                    description=(
                        f"The predictive model estimates a strong conversion probability ({conv_prob*100:.0f}%), "
                        f"while behavioural health signals indicate the deal is deteriorating ({health_classification})."
                    ),
                    participating_modules=[ModuleName.PREDICTION.value, ModuleName.DEAL_HEALTH.value]
                ))

        # RULE 2: High Value + Critical Anomaly Risk
        if effective_value >= self.high_value_threshold and risk_level == "CRITICAL":
            conflicts.append(SignalConflict(
                type="HIGH_VALUE_CRITICAL_RISK",
                severity=InsightImportance.CRITICAL,
                description=(
                    f"High-value deal (₹{effective_value:,.2f}) contains critical quotation anomalies "
                    f"and severe risk deviations requiring immediate managerial review."
                ),
                participating_modules=[ModuleName.ANOMALY_DETECTION.value, ModuleName.PREDICTION.value]
            ))

        # RULE 3: Healthy Deal + Low Conversion Prediction
        if health_score is not None and health_score >= self.healthy_threshold:
            if conv_prob is not None and conv_prob <= self.low_prediction_threshold:
                conflicts.append(SignalConflict(
                    type="HEALTH_CONVERSION_MISMATCH",
                    severity=InsightImportance.MEDIUM,
                    description=(
                        f"Deal health indicators are strong ({health_score:.1f}/100), yet predictive models "
                        f"estimate a low conversion likelihood ({conv_prob*100:.0f}%)."
                    ),
                    participating_modules=[ModuleName.DEAL_HEALTH.value, ModuleName.PREDICTION.value]
                ))

        # RULE 4: Strong Positive Momentum + Low Conversion Outcome
        if momentum_label in ["STRONG_POSITIVE", "POSITIVE"]:
            if conv_prob is not None and conv_prob <= 0.35:
                conflicts.append(SignalConflict(
                    type="MOMENTUM_PREDICTION_MISMATCH",
                    severity=InsightImportance.MEDIUM,
                    description=(
                        f"Deal momentum is currently {momentum_label.replace('_', ' ').lower()}, but statistical outcome "
                        f"prediction projects high probability of deal loss ({conv_prob*100:.0f}%)."
                    ),
                    participating_modules=[ModuleName.DEAL_HEALTH.value, ModuleName.PREDICTION.value]
                ))

        # RULE 5: Abnormal Discount Anomaly + Strong Financial Health Dimension
        if risk_level in ["HIGH", "CRITICAL"] and health_data:
            dim_scores = health_data.get("dimension_scores")
            fin_score = getattr(dim_scores, "financial_health", 0.0) if dim_scores and not isinstance(dim_scores, dict) else (dim_scores.get("financial_health", 0.0) if isinstance(dim_scores, dict) else 0.0)
            if fin_score >= 0.70:
                conflicts.append(SignalConflict(
                    type="DISCOUNT_FINANCIAL_DIVERGENCE",
                    severity=InsightImportance.LOW,
                    description=(
                        f"Quotation risk module flagged {risk_level.lower()} deviations, although aggregated "
                        f"financial health score remains high ({fin_score:.2f})."
                    ),
                    participating_modules=[ModuleName.ANOMALY_DETECTION.value, ModuleName.DEAL_HEALTH.value]
                ))

        return conflicts
