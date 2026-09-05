from typing import Dict, List, Any, Optional
from src.schemas.deal_intelligence import (
    ModuleName, SignalDirection, InsightImportance
)
from .normalizer import NormalizedSignal, SignalNormalizer

class AnomalyAdapter:
    """Adapts raw Anomaly Detection Service outputs into NormalizedSignal objects."""

    @staticmethod
    def adapt(anomaly_output: Optional[Dict[str, Any]]) -> List[NormalizedSignal]:
        if not anomaly_output:
            return []

        signals: List[NormalizedSignal] = []
        is_anomaly = anomaly_output.get("is_anomaly", False)
        anomaly_score = float(anomaly_output.get("anomaly_score", 0.0))
        risk_level = str(anomaly_output.get("risk_level", "LOW")).upper()
        summary = anomaly_output.get("summary", "")
        deviations = anomaly_output.get("deviations", [])

        # Overall Anomaly / Risk Signal
        direction = SignalDirection.NEGATIVE if (is_anomaly or risk_level in ["HIGH", "CRITICAL"]) else SignalDirection.POSITIVE
        importance = SignalNormalizer.map_risk_level_to_importance(risk_level)

        signals.append(NormalizedSignal(
            source=ModuleName.ANOMALY_DETECTION.value,
            category="RISK",
            signal_type="OVERALL_ANOMALY_RISK",
            direction=direction,
            severity=importance,
            title=f"Quotation Risk Level: {risk_level}",
            description=summary or f"Quotation exhibits {risk_level.lower()} anomaly risk score ({anomaly_score:.2f}).",
            raw_score=anomaly_score,
            normalized_score=round(anomaly_score, 4),
            evidence={
                "is_anomaly": is_anomaly,
                "risk_level": risk_level,
                "deviations_count": len(deviations)
            }
        ))

        # Deviation-level signals
        for dev in deviations:
            feature = dev.get("feature", "Unknown")
            dev_sev = str(dev.get("severity", "MEDIUM")).upper()
            dev_desc = dev.get("description", "")
            signals.append(NormalizedSignal(
                source=ModuleName.ANOMALY_DETECTION.value,
                category="RISK",
                signal_type="FEATURE_DEVIATION",
                direction=SignalDirection.NEGATIVE,
                severity=SignalNormalizer.map_risk_level_to_importance(dev_sev),
                title=f"Deviation in {feature.replace('_', ' ').title()}",
                description=dev_desc or f"Significant deviation detected in {feature}.",
                raw_score=None,
                normalized_score=None,
                evidence=dev
            ))

        return signals


class DealHealthAdapter:
    """Adapts raw Deal Health Intelligence Service outputs into NormalizedSignal objects."""

    @staticmethod
    def adapt(health_output: Optional[Dict[str, Any]]) -> List[NormalizedSignal]:
        if not health_output:
            return []

        signals: List[NormalizedSignal] = []
        health_score = float(health_output.get("health_score", 50.0))
        classification = str(health_output.get("classification", "HEALTHY")).upper()
        dim_scores = health_output.get("dimension_scores")
        momentum = health_output.get("momentum")
        strengths = health_output.get("strengths", [])
        concerns = health_output.get("concerns", [])

        # Overall Health Signal
        if health_score >= 60.0:
            direction = SignalDirection.POSITIVE
            importance = InsightImportance.HIGH if health_score >= 80.0 else InsightImportance.MEDIUM
        elif health_score >= 40.0:
            direction = SignalDirection.NEUTRAL
            importance = InsightImportance.MEDIUM
        else:
            direction = SignalDirection.NEGATIVE
            importance = InsightImportance.CRITICAL if health_score < 20.0 else InsightImportance.HIGH

        signals.append(NormalizedSignal(
            source=ModuleName.DEAL_HEALTH.value,
            category="HEALTH",
            signal_type="OVERALL_HEALTH_SCORE",
            direction=direction,
            severity=importance,
            title=f"Deal Health: {classification}",
            description=f"Overall deal health is scored at {health_score:.1f}/100 ({classification}).",
            raw_score=health_score,
            normalized_score=SignalNormalizer.normalize_health_score(health_score),
            evidence={"classification": classification, "health_score": health_score}
        ))

        # Momentum Signal
        if momentum:
            mom_label = str(getattr(momentum, "label", "") or (momentum.get("label") if isinstance(momentum, dict) else "")).upper()
            mom_score = float(getattr(momentum, "score", 0.5) if not isinstance(momentum, dict) else momentum.get("score", 0.5))
            
            if mom_label in ["STRONG_POSITIVE", "POSITIVE"]:
                mom_dir = SignalDirection.POSITIVE
                mom_imp = InsightImportance.HIGH if mom_label == "STRONG_POSITIVE" else InsightImportance.MEDIUM
            elif mom_label in ["DECLINING", "STAGNANT"]:
                mom_dir = SignalDirection.NEGATIVE
                mom_imp = InsightImportance.HIGH if mom_label == "DECLINING" else InsightImportance.MEDIUM
            else:
                mom_dir = SignalDirection.NEUTRAL
                mom_imp = InsightImportance.LOW

            signals.append(NormalizedSignal(
                source=ModuleName.DEAL_HEALTH.value,
                category="MOMENTUM",
                signal_type="DEAL_MOMENTUM",
                direction=mom_dir,
                severity=mom_imp,
                title=f"Deal Momentum: {mom_label.replace('_', ' ').title()}",
                description=f"Deal velocity and recent engagement trajectory is {mom_label.lower().replace('_', ' ')}.",
                raw_score=mom_score,
                normalized_score=round(mom_score, 4),
                evidence={"momentum_label": mom_label, "momentum_score": mom_score}
            ))

        # Strengths & Concerns
        for s in strengths:
            signals.append(NormalizedSignal(
                source=ModuleName.DEAL_HEALTH.value,
                category="HEALTH_STRENGTH",
                signal_type="STRENGTH",
                direction=SignalDirection.POSITIVE,
                severity=InsightImportance.MEDIUM,
                title="Deal Strength",
                description=s
            ))

        for c in concerns:
            signals.append(NormalizedSignal(
                source=ModuleName.DEAL_HEALTH.value,
                category="HEALTH_CONCERN",
                signal_type="CONCERN",
                direction=SignalDirection.NEGATIVE,
                severity=InsightImportance.HIGH,
                title="Deal Concern",
                description=c
            ))

        return signals


class PredictionAdapter:
    """Adapts raw Deal Outcome Prediction Service outputs into NormalizedSignal objects."""

    @staticmethod
    def adapt(prediction_output: Optional[Dict[str, Any]]) -> List[NormalizedSignal]:
        if not prediction_output:
            return []

        signals: List[NormalizedSignal] = []
        conv_prob = float(prediction_output.get("conversion_probability", 0.5))
        outcome = str(prediction_output.get("predicted_outcome", "UNCERTAIN")).upper()
        confidence = prediction_output.get("confidence")
        rev_forecast = prediction_output.get("revenue_forecast")
        priority = prediction_output.get("priority")
        pos_factors = prediction_output.get("top_positive_factors", [])
        neg_factors = prediction_output.get("top_negative_factors", [])

        # Prediction Outcome Signal
        if conv_prob >= 0.60:
            dir_pred = SignalDirection.POSITIVE
            imp_pred = InsightImportance.HIGH if conv_prob >= 0.75 else InsightImportance.MEDIUM
        elif conv_prob >= 0.40:
            dir_pred = SignalDirection.NEUTRAL
            imp_pred = InsightImportance.MEDIUM
        else:
            dir_pred = SignalDirection.NEGATIVE
            imp_pred = InsightImportance.HIGH if conv_prob <= 0.25 else InsightImportance.MEDIUM

        signals.append(NormalizedSignal(
            source=ModuleName.PREDICTION.value,
            category="PREDICTION",
            signal_type="CONVERSION_PROBABILITY",
            direction=dir_pred,
            severity=imp_pred,
            title=f"Predicted Outcome: {outcome.replace('_', ' ').title()}",
            description=f"Model estimates conversion probability of {conv_prob*100:.1f}% ({outcome.replace('_', ' ').lower()}).",
            raw_score=conv_prob,
            normalized_score=round(conv_prob, 4),
            evidence={"predicted_outcome": outcome, "conversion_probability": conv_prob}
        ))

        # Revenue Forecast Signal
        if rev_forecast:
            exp_rev = float(getattr(rev_forecast, "expected_revenue", 0.0) if not isinstance(rev_forecast, dict) else rev_forecast.get("expected_revenue", 0.0))
            quote_val = float(getattr(rev_forecast, "quotation_value", 0.0) if not isinstance(rev_forecast, dict) else rev_forecast.get("quotation_value", 0.0))
            signals.append(NormalizedSignal(
                source=ModuleName.PREDICTION.value,
                category="FINANCIAL",
                signal_type="REVENUE_FORECAST",
                direction=SignalDirection.POSITIVE,
                severity=InsightImportance.HIGH if exp_rev >= 100000 else InsightImportance.MEDIUM,
                title=f"Expected Revenue: ₹{exp_rev:,.2f}",
                description=f"Expected revenue forecast of ₹{exp_rev:,.2f} on quotation value of ₹{quote_val:,.2f}.",
                raw_score=exp_rev,
                normalized_score=None,
                evidence={"expected_revenue": exp_rev, "quotation_value": quote_val}
            ))

        # Priority Signal
        if priority:
            p_score = float(getattr(priority, "score", 50.0) if not isinstance(priority, dict) else priority.get("score", 50.0))
            p_class = str(getattr(priority, "classification", "MEDIUM_PRIORITY") if not isinstance(priority, dict) else priority.get("classification", "MEDIUM_PRIORITY")).upper()
            signals.append(NormalizedSignal(
                source=ModuleName.PREDICTION.value,
                category="PRIORITY",
                signal_type="DEAL_PRIORITY",
                direction=SignalDirection.POSITIVE if "HIGH" in p_class or "CRITICAL" in p_class else SignalDirection.NEUTRAL,
                severity=InsightImportance.CRITICAL if "CRITICAL" in p_class else InsightImportance.HIGH if "HIGH" in p_class else InsightImportance.MEDIUM,
                title=f"Deal Priority: {p_class.replace('_', ' ').title()}",
                description=f"Deal prioritization score is {p_score:.1f}/100 ({p_class.replace('_', ' ').lower()}).",
                raw_score=p_score,
                normalized_score=SignalNormalizer.normalize_priority_score(p_score),
                evidence={"priority_score": p_score, "priority_classification": p_class}
            ))

        # Positive & Negative Factors
        for f in pos_factors:
            f_desc = getattr(f, "description", "") if not isinstance(f, dict) else f.get("description", "")
            f_name = getattr(f, "feature", "") if not isinstance(f, dict) else f.get("feature", "")
            signals.append(NormalizedSignal(
                source=ModuleName.PREDICTION.value,
                category="PREDICTION_FACTOR",
                signal_type="POSITIVE_FACTOR",
                direction=SignalDirection.POSITIVE,
                severity=InsightImportance.MEDIUM,
                title=f"Positive Factor: {f_name.replace('_', ' ').title()}",
                description=f_desc
            ))

        for f in neg_factors:
            f_desc = getattr(f, "description", "") if not isinstance(f, dict) else f.get("description", "")
            f_name = getattr(f, "feature", "") if not isinstance(f, dict) else f.get("feature", "")
            signals.append(NormalizedSignal(
                source=ModuleName.PREDICTION.value,
                category="PREDICTION_FACTOR",
                signal_type="NEGATIVE_FACTOR",
                direction=SignalDirection.NEGATIVE,
                severity=InsightImportance.HIGH,
                title=f"Negative Factor: {f_name.replace('_', ' ').title()}",
                description=f_desc
            ))

        return signals


class RecommendationAdapter:
    """Adapts raw Product Recommendation Service outputs into NormalizedSignal objects."""

    @staticmethod
    def adapt(rec_output: Optional[Any]) -> List[NormalizedSignal]:
        if not rec_output:
            return []

        recs = []
        if isinstance(rec_output, dict):
            recs = rec_output.get("recommendations", [])
        elif hasattr(rec_output, "recommendations"):
            recs = rec_output.recommendations
        elif isinstance(rec_output, list):
            recs = rec_output

        signals: List[NormalizedSignal] = []
        for r in recs:
            p_name = getattr(r, "product_name", None) or (r.get("product_name") if isinstance(r, dict) else "Unknown Product")
            p_id = getattr(r, "product_id", None) or (r.get("product_id") if isinstance(r, dict) else "")
            reason = getattr(r, "reason", None) or (r.get("reason") if isinstance(r, dict) else "")
            score = float(getattr(r, "score", 0.5) if not isinstance(r, dict) else r.get("score", 0.5))
            margin = float(getattr(r, "expected_margin", 0.0) if not isinstance(r, dict) else r.get("expected_margin", 0.0))

            signals.append(NormalizedSignal(
                source=ModuleName.RECOMMENDATION.value,
                category="OPPORTUNITY",
                signal_type="CROSS_SELL_RECOMMENDATION",
                direction=SignalDirection.POSITIVE,
                severity=InsightImportance.MEDIUM if score >= 0.50 else InsightImportance.LOW,
                title=f"Cross-sell: {p_name}",
                description=reason or f"Frequently purchased together with current quote items ({margin*100:.1f}% expected margin).",
                raw_score=score,
                normalized_score=round(score, 4),
                evidence={"product_id": p_id, "product_name": p_name, "expected_margin": margin}
            ))

        return signals
