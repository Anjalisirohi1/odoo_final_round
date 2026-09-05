from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from src.schemas.explainability import (
    LocalExplanationResponse, ModuleExplanationSummary, DecisionDriver,
    ExplanationConfidence, ExplanationMethod, ExplanationMetadata
)

class PredictionExplanationAdapter:
    """
    Standardizes prediction explanations into unified schemas.
    """

    def adapt_local_response(
        self,
        quotation_id: str,
        summary: str,
        positive_drivers: List[DecisionDriver],
        negative_drivers: List[DecisionDriver],
        feature_contributions: Optional[List[Any]],
        explanation_confidence: ExplanationConfidence,
        method: ExplanationMethod,
        model_name: str,
        model_version: str,
        feature_count: int,
        significant_feature_count: int,
        fallback_used: bool = False
    ) -> LocalExplanationResponse:
        metadata = ExplanationMetadata(
            model_name=model_name,
            model_version=model_version,
            explanation_method=method,
            generated_at=datetime.now(timezone.utc).isoformat(),
            feature_count=feature_count,
            significant_feature_count=significant_feature_count,
            fallback_used=fallback_used
        )

        return LocalExplanationResponse(
            quotation_id=quotation_id,
            decision_type="PREDICTION",
            summary=summary,
            positive_drivers=positive_drivers,
            negative_drivers=negative_drivers,
            feature_contributions=feature_contributions,
            explanation_confidence=explanation_confidence,
            method=method,
            metadata=metadata
        )

    def adapt_module_summary(
        self,
        prediction_result: Dict[str, Any],
        local_explanation: LocalExplanationResponse
    ) -> ModuleExplanationSummary:
        prob = prediction_result.get("conversion_probability", 0.0)
        outcome = prediction_result.get("predicted_outcome", "UNKNOWN")
        drivers = [d.reason for d in local_explanation.positive_drivers if d.feature != "baseline_commercial_terms"]
        drivers += [d.reason for d in local_explanation.negative_drivers if d.feature != "no_adverse_drivers"]

        return ModuleExplanationSummary(
            module_name="Outcome Prediction",
            summary=local_explanation.summary,
            method=local_explanation.method.value,
            key_drivers=drivers[:3],
            confidence=local_explanation.explanation_confidence.value
        )
