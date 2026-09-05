import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import pandas as pd

from src.core.config import settings
from src.schemas.explainability import (
    LocalExplanationResponse, GlobalImportanceResponse,
    UnifiedDealExplanationResponse, ModuleExplanationSummary,
    ExplanationConfidence, ExplanationMethod
)
from .feature_mapper import FeatureMapper
from .contribution_analyzer import ContributionAnalyzer
from .confidence import ExplanationConfidenceEstimator
from .global_importance import GlobalImportanceService
from .local.shap_explainer import ShapLocalExplainer
from .local.model_explainer import LinearModelExplainer, TreeModelExplainer
from .local.fallback_explainer import FallbackLocalExplainer
from .adapters.prediction_adapter import PredictionExplanationAdapter
from .adapters.anomaly_adapter import AnomalyExplanationAdapter
from .adapters.deal_health_adapter import DealHealthExplanationAdapter
from .adapters.recommendation_adapter import RecommendationExplanationAdapter

logger = logging.getLogger(__name__)

class ExplainabilityService:
    """
    Unified facade for Explainable AI (XAI) across DealFlow360.
    Provides local prediction explanations, global feature importance, module adapters,
    and unified executive decision explanations.
    """

    def __init__(
        self,
        feature_mapper: Optional[FeatureMapper] = None,
        contribution_analyzer: Optional[ContributionAnalyzer] = None,
        confidence_estimator: Optional[ExplanationConfidenceEstimator] = None,
        global_service: Optional[GlobalImportanceService] = None
    ):
        self.feature_mapper = feature_mapper or FeatureMapper()
        self.contribution_analyzer = contribution_analyzer or ContributionAnalyzer(self.feature_mapper)
        self.confidence_estimator = confidence_estimator or ExplanationConfidenceEstimator()
        self.global_service = global_service or GlobalImportanceService(self.feature_mapper)

        # Local explainers
        self.shap_explainer = ShapLocalExplainer()
        self.linear_explainer = LinearModelExplainer()
        self.tree_explainer = TreeModelExplainer()
        self.fallback_explainer = FallbackLocalExplainer()

        # Adapters
        self.prediction_adapter = PredictionExplanationAdapter()
        self.anomaly_adapter = AnomalyExplanationAdapter()
        self.deal_health_adapter = DealHealthExplanationAdapter()
        self.recommendation_adapter = RecommendationExplanationAdapter()

    def explain_prediction(
        self,
        quotation_id: str,
        features_df: pd.DataFrame,
        model: Any,
        preprocessor: Any,
        feature_names: List[str],
        model_name: str = "SupervisedModel",
        model_version: str = "1.0.0",
        conversion_probability: float = 0.5,
        predicted_outcome: str = "UNCERTAIN"
    ) -> LocalExplanationResponse:
        """
        Generates local explanation for a single prediction instance.
        """
        raw_contributions = []
        method_used = ExplanationMethod.RULE_BASED
        fallback_used = False

        # 1. Try SHAP if available
        if self.shap_explainer.is_available:
            try:
                raw_contributions = self.shap_explainer.explain_instance(
                    features_df=features_df,
                    model=model,
                    preprocessor=preprocessor,
                    feature_names=feature_names
                )
                method_used = ExplanationMethod.SHAP
            except Exception as e:
                logger.warning(f"SHAP local explanation failed: {e}. Falling back to model-native explainer.")

        # 2. Try model-native attribution if SHAP was not used or failed
        if not raw_contributions:
            model_type = type(model).__name__ if model is not None else ""
            if model is not None and hasattr(model, "coef_"):
                try:
                    raw_contributions = self.linear_explainer.explain_instance(
                        features_df=features_df,
                        model=model,
                        preprocessor=preprocessor,
                        feature_names=feature_names
                    )
                    method_used = ExplanationMethod.LINEAR_COEFFICIENT
                except Exception as e:
                    logger.warning(f"Linear explanation failed: {e}. Using fallback.")
            elif model is not None and hasattr(model, "feature_importances_"):
                try:
                    raw_contributions = self.tree_explainer.explain_instance(
                        features_df=features_df,
                        model=model,
                        preprocessor=preprocessor,
                        feature_names=feature_names
                    )
                    method_used = ExplanationMethod.TREE_FEATURE_IMPORTANCE
                except Exception as e:
                    logger.warning(f"Tree explanation failed: {e}. Using fallback.")

        # 3. Fallback explainer
        if not raw_contributions:
            fallback_used = True
            raw_contributions = self.fallback_explainer.explain_instance(
                features_df=features_df,
                model=model,
                preprocessor=preprocessor,
                feature_names=feature_names
            )
            method_used = ExplanationMethod.RULE_BASED

        # 4. Analyze contributions & classify impact
        pos_drivers, neg_drivers, structured_all = self.contribution_analyzer.analyze_contributions(raw_contributions)

        # 5. Estimate explanation confidence
        expl_confidence = self.confidence_estimator.estimate_confidence(
            method=method_used,
            raw_contributions=raw_contributions,
            fallback_used=fallback_used
        )

        # 6. Generate natural language summary
        summary = self.contribution_analyzer.generate_summary(
            predicted_outcome=predicted_outcome,
            conversion_probability=conversion_probability,
            positive_drivers=pos_drivers,
            negative_drivers=neg_drivers
        )

        sig_count = len([c for c in structured_all if abs(c.contribution) >= settings.XAI_MIN_CONTRIBUTION_THRESHOLD])

        return self.prediction_adapter.adapt_local_response(
            quotation_id=quotation_id,
            summary=summary,
            positive_drivers=pos_drivers,
            negative_drivers=neg_drivers,
            feature_contributions=structured_all,
            explanation_confidence=expl_confidence,
            method=method_used,
            model_name=model_name,
            model_version=model_version,
            feature_count=len(structured_all),
            significant_feature_count=sig_count,
            fallback_used=fallback_used
        )

    def get_global_feature_importance(
        self,
        model: Any,
        feature_names: List[str],
        model_name: str = "SupervisedModel",
        model_version: str = "1.0.0",
        force_refresh: bool = False
    ) -> GlobalImportanceResponse:
        return self.global_service.get_global_importance(
            model=model,
            feature_names=feature_names,
            model_name=model_name,
            model_version=model_version,
            force_refresh=force_refresh
        )

    def explain_deal_unified(
        self,
        quotation_id: str,
        prediction_result: Optional[Dict[str, Any]] = None,
        local_prediction_expl: Optional[LocalExplanationResponse] = None,
        anomaly_result: Optional[Dict[str, Any]] = None,
        deal_health_result: Optional[Dict[str, Any]] = None,
        recommendation_result: Optional[Dict[str, Any]] = None
    ) -> UnifiedDealExplanationResponse:
        """
        Synthesizes multi-modal explanations into an executive explanation
        highlighting AI Consensus and AI Conflicts.
        """
        module_summaries: Dict[str, ModuleExplanationSummary] = {}
        ai_consensus: List[str] = []
        ai_conflicts: List[str] = []

        # 1. Prediction summary
        if local_prediction_expl:
            module_summaries["prediction"] = self.prediction_adapter.adapt_module_summary(
                prediction_result or {}, local_prediction_expl
            )

        # 2. Anomaly summary
        if anomaly_result:
            module_summaries["anomaly_detection"] = self.anomaly_adapter.adapt_module_summary(anomaly_result)

        # 3. Deal Health summary
        if deal_health_result:
            module_summaries["deal_health"] = self.deal_health_adapter.adapt_module_summary(deal_health_result)

        # 4. Recommendation summary
        if recommendation_result:
            module_summaries["recommendations"] = self.recommendation_adapter.adapt_module_summary(recommendation_result)

        # 5. Cross-Module Consensus & Conflict Detection
        conv_prob = prediction_result.get("conversion_probability") if prediction_result else None
        health_score = deal_health_result.get("health_score") if deal_health_result else None
        anomaly_score = anomaly_result.get("anomaly_score") if anomaly_result else None
        risk_level = anomaly_result.get("risk_level") if anomaly_result else "LOW"

        # Consensus checks
        if conv_prob is not None and health_score is not None:
            if conv_prob >= 0.60 and health_score >= 60.0:
                ai_consensus.append("Prediction and Deal Health models agree that the deal demonstrates strong commercial momentum and positive win probability.")
            elif conv_prob < 0.40 and health_score < 40.0:
                ai_consensus.append("Prediction and Deal Health models agree that the deal faces severe conversion headwinds and operational risks.")

        if anomaly_score is not None and anomaly_score < 0.30:
            ai_consensus.append("Commercial terms and discounting are aligned with historical baseline patterns.")

        # Conflict checks
        if conv_prob is not None and risk_level in ["HIGH", "CRITICAL"] and conv_prob >= 0.60:
            ai_conflicts.append("While conversion probability is high, anomaly detection identified high discounting and margin risk that may impair deal profitability.")

        if conv_prob is not None and health_score is not None:
            if conv_prob >= 0.70 and health_score < 50.0:
                ai_conflicts.append("Supervised conversion probability indicates strong historical win potential, but real-time engagement and operational health have deteriorated.")
            elif conv_prob <= 0.35 and health_score >= 70.0:
                ai_conflicts.append("Deal health indicators are strong, yet conversion model predicts low win probability due to account-level historical factors.")

        # Executive synthesis
        if ai_conflicts:
            exec_summary = f"Executive Review Required for Quotation {quotation_id}: Divergent signals detected between AI modules. " + " ".join(ai_conflicts)
        elif ai_consensus:
            exec_summary = f"Executive Assessment for Quotation {quotation_id}: High multi-model alignment. " + ai_consensus[0]
        else:
            exec_summary = f"Executive Assessment for Quotation {quotation_id}: Commercial terms evaluated across active intelligence modules."

        return UnifiedDealExplanationResponse(
            quotation_id=quotation_id,
            executive_summary=exec_summary,
            module_summaries=module_summaries,
            ai_consensus=ai_consensus,
            ai_conflicts=ai_conflicts,
            overall_explanation_confidence=ExplanationConfidence.HIGH if not ai_conflicts else ExplanationConfidence.MEDIUM,
            generated_at=datetime.now(timezone.utc).isoformat()
        )
