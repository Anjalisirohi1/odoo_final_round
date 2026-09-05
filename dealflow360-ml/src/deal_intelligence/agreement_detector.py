from typing import Dict, List, Any, Optional
from src.schemas.deal_intelligence import (
    SignalAgreement, ModuleName
)
from src.core.config import settings

class AgreementDetector:
    """
    Detects cross-module consensus and alignment across AI intelligence modules.
    Identifies when multiple modules support the same positive or negative conclusion.
    """

    def __init__(
        self,
        high_prediction_threshold: Optional[float] = None,
        low_prediction_threshold: Optional[float] = None
    ):
        self.high_prediction_threshold = high_prediction_threshold or settings.CONFLICT_HIGH_PREDICTION_THRESHOLD
        self.low_prediction_threshold = low_prediction_threshold or settings.CONFLICT_LOW_PREDICTION_THRESHOLD

    def detect_agreements(
        self,
        anomaly_data: Optional[Dict[str, Any]] = None,
        health_data: Optional[Dict[str, Any]] = None,
        prediction_data: Optional[Dict[str, Any]] = None
    ) -> List[SignalAgreement]:
        agreements: List[SignalAgreement] = []

        conv_prob: Optional[float] = None
        if prediction_data:
            conv_prob = prediction_data.get("conversion_probability")

        health_classification: Optional[str] = None
        health_score: Optional[float] = None
        if health_data:
            health_classification = str(health_data.get("classification", "")).upper()
            health_score = health_data.get("health_score")

        risk_level: Optional[str] = None
        if anomaly_data:
            risk_level = str(anomaly_data.get("risk_level", "")).upper()

        is_pred_positive = conv_prob is not None and conv_prob >= self.high_prediction_threshold
        is_pred_negative = conv_prob is not None and conv_prob <= self.low_prediction_threshold
        is_health_positive = health_classification in ["EXCELLENT", "HEALTHY"] or (health_score is not None and health_score >= 60.0)
        is_health_negative = health_classification in ["AT_RISK", "CRITICAL"] or (health_score is not None and health_score < 40.0)
        is_risk_low = risk_level == "LOW"
        is_risk_high = risk_level in ["HIGH", "CRITICAL"]

        # 1. STRONG POSITIVE CONSENSUS (All 3 available modules positive)
        if is_pred_positive and is_health_positive and is_risk_low:
            agreements.append(SignalAgreement(
                type="STRONG_POSITIVE_CONSENSUS",
                confidence="HIGH",
                description="Cross-module consensus: Prediction, Deal Health, and Anomaly Detection all confirm high closing probability and low operational risk.",
                participating_modules=[ModuleName.PREDICTION.value, ModuleName.DEAL_HEALTH.value, ModuleName.ANOMALY_DETECTION.value]
            ))
        # 2. STRONG NEGATIVE CONSENSUS (All 3 available modules negative)
        elif is_pred_negative and is_health_negative and is_risk_high:
            agreements.append(SignalAgreement(
                type="STRONG_NEGATIVE_CONSENSUS",
                confidence="HIGH",
                description="Cross-module consensus: Prediction, Deal Health, and Anomaly Detection all confirm severe deal deterioration and high risk of loss.",
                participating_modules=[ModuleName.PREDICTION.value, ModuleName.DEAL_HEALTH.value, ModuleName.ANOMALY_DETECTION.value]
            ))
        else:
            # 3. MODERATE POSITIVE ALIGNMENT (2 modules positive)
            pos_modules = []
            if is_pred_positive:
                pos_modules.append(ModuleName.PREDICTION.value)
            if is_health_positive:
                pos_modules.append(ModuleName.DEAL_HEALTH.value)
            if is_risk_low and anomaly_data is not None:
                pos_modules.append(ModuleName.ANOMALY_DETECTION.value)

            if len(pos_modules) >= 2:
                agreements.append(SignalAgreement(
                    type="MODERATE_POSITIVE_ALIGNMENT",
                    confidence="MEDIUM",
                    description=f"Positive alignment across {', '.join(pos_modules)} supporting favorable deal progress.",
                    participating_modules=pos_modules
                ))

            # 4. MODERATE NEGATIVE ALIGNMENT (2 modules negative)
            neg_modules = []
            if is_pred_negative:
                neg_modules.append(ModuleName.PREDICTION.value)
            if is_health_negative:
                neg_modules.append(ModuleName.DEAL_HEALTH.value)
            if is_risk_high:
                neg_modules.append(ModuleName.ANOMALY_DETECTION.value)

            if len(neg_modules) >= 2:
                agreements.append(SignalAgreement(
                    type="MODERATE_NEGATIVE_ALIGNMENT",
                    confidence="MEDIUM",
                    description=f"Negative alignment across {', '.join(neg_modules)} indicating elevated vulnerability and risk.",
                    participating_modules=neg_modules
                ))

        return agreements
