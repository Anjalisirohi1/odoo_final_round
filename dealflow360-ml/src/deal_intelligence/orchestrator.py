import logging
import time
from typing import Dict, List, Any, Optional
from datetime import datetime

from src.schemas.deal_intelligence import (
    DealIntelligenceResponse, ModuleAvailability, ModuleName
)
from src.schemas.recommendation import RecommendationRequest
from src.core.logging import logger

from .context_builder import UnifiedDealContext
from .module_status import ModuleStatusTracker
from .adapters import (
    AnomalyAdapter, DealHealthAdapter, PredictionAdapter, RecommendationAdapter
)
from .normalizer import NormalizedSignal
from .conflict_detector import ConflictDetector
from .agreement_detector import AgreementDetector
from .business_impact import BusinessImpactEngine
from .intelligence_score import IntelligenceScoreCalculator
from .action_consolidator import ActionConsolidator
from .insight_ranker import ExecutiveInsightRanker
from .timeline import IntelligenceTimelineBuilder
from .synthesizer import InsightSynthesizer

class DealIntelligenceOrchestrator:
    """
    Coordinates multi-modal intelligence execution across Recommendation, Anomaly,
    Health, and Prediction engines with graceful degradation and robust observability.
    """

    def __init__(
        self,
        recommendation_service: Optional[Any] = None,
        anomaly_service: Optional[Any] = None,
        deal_health_service: Optional[Any] = None,
        prediction_service: Optional[Any] = None
    ):
        self.recommendation_service = recommendation_service
        self.anomaly_service = anomaly_service
        self.deal_health_service = deal_health_service
        self.prediction_service = prediction_service

        self.conflict_detector = ConflictDetector()
        self.agreement_detector = AgreementDetector()
        self.business_impact_engine = BusinessImpactEngine()
        self.intelligence_score_calc = IntelligenceScoreCalculator()
        self.action_consolidator = ActionConsolidator()
        self.insight_ranker = ExecutiveInsightRanker()
        self.timeline_builder = IntelligenceTimelineBuilder()
        self.synthesizer = InsightSynthesizer()

    def orchestrate(self, context: UnifiedDealContext) -> DealIntelligenceResponse:
        """
        Executes unified deal intelligence pipeline on context with graceful error isolation.
        """
        start_time = time.perf_counter()
        tracker = ModuleStatusTracker()

        anomaly_output = None
        health_output = None
        prediction_output = None
        recommendation_output = None

        # 1. Anomaly Detection Module Execution
        tracker.start_module(ModuleName.ANOMALY_DETECTION.value)
        if self.anomaly_service and getattr(self.anomaly_service, "is_initialized", False):
            try:
                anomaly_output = self.anomaly_service.analyze_quotation(context.quotation)
                tracker.record_success(ModuleName.ANOMALY_DETECTION.value)
            except Exception as e:
                logger.warning(f"Anomaly module execution error for quote {context.quotation_id}: {e}")
                tracker.record_failure(ModuleName.ANOMALY_DETECTION.value, str(e))
        else:
            tracker.record_unavailable(ModuleName.ANOMALY_DETECTION.value, "Anomaly service not initialized")

        # 2. Deal Health Intelligence Module Execution
        tracker.start_module(ModuleName.DEAL_HEALTH.value)
        if self.deal_health_service and getattr(self.deal_health_service, "is_initialized", False):
            try:
                health_output = self.deal_health_service.evaluate_deal_health(
                    context.quotation_id, custom_now=context.now
                )
                if health_output is not None:
                    tracker.record_success(ModuleName.DEAL_HEALTH.value)
                else:
                    tracker.record_unavailable(ModuleName.DEAL_HEALTH.value, "Quotation not found in deal health context")
            except Exception as e:
                logger.warning(f"Deal health module execution error for quote {context.quotation_id}: {e}")
                tracker.record_failure(ModuleName.DEAL_HEALTH.value, str(e))
        else:
            tracker.record_unavailable(ModuleName.DEAL_HEALTH.value, "Deal health service not initialized")

        # 3. Deal Outcome Prediction Module Execution
        tracker.start_module(ModuleName.PREDICTION.value)
        if self.prediction_service and getattr(self.prediction_service, "is_initialized", False):
            try:
                prediction_output = self.prediction_service.predict_deal_outcome(
                    context.quotation_id, custom_now=context.now
                )
                if prediction_output is not None:
                    tracker.record_success(ModuleName.PREDICTION.value)
                else:
                    tracker.record_unavailable(ModuleName.PREDICTION.value, "Quotation not found in prediction context")
            except Exception as e:
                logger.warning(f"Prediction module execution error for quote {context.quotation_id}: {e}")
                tracker.record_failure(ModuleName.PREDICTION.value, str(e))
        else:
            tracker.record_unavailable(ModuleName.PREDICTION.value, "Prediction model not trained or service uninitialized")

        # 4. Recommendation Module Execution
        tracker.start_module(ModuleName.RECOMMENDATION.value)
        if self.recommendation_service and getattr(self.recommendation_service, "is_initialized", False):
            try:
                pids = context.product_ids
                if pids:
                    rec_req = RecommendationRequest(
                        customer_id=context.customer_id,
                        product_ids=pids,
                        limit=5
                    )
                    recommendation_output = self.recommendation_service.get_recommendations(rec_req)
                    tracker.record_success(ModuleName.RECOMMENDATION.value)
                else:
                    tracker.record_unavailable(ModuleName.RECOMMENDATION.value, "No products in quotation to base recommendations on")
            except Exception as e:
                logger.warning(f"Recommendation module execution error for quote {context.quotation_id}: {e}")
                tracker.record_failure(ModuleName.RECOMMENDATION.value, str(e))
        else:
            tracker.record_unavailable(ModuleName.RECOMMENDATION.value, "Recommendation service not initialized")

        # 5. Adapt raw signals into normalized representations
        signals: List[NormalizedSignal] = []
        signals.extend(AnomalyAdapter.adapt(anomaly_output))
        signals.extend(DealHealthAdapter.adapt(health_output))
        signals.extend(PredictionAdapter.adapt(prediction_output))
        signals.extend(RecommendationAdapter.adapt(recommendation_output))

        # 6. Detect Signal Conflicts and Agreements
        context_data = {
            "quotation_id": context.quotation_id,
            "total_amount": context.total_amount,
            "discount_percentage": context.discount_percentage
        }
        conflicts = self.conflict_detector.detect_conflicts(
            anomaly_data=anomaly_output,
            health_data=health_output,
            prediction_data=prediction_output,
            context_data=context_data
        )

        agreements = self.agreement_detector.detect_agreements(
            anomaly_data=anomaly_output,
            health_data=health_output,
            prediction_data=prediction_output
        )

        # 7. Calculate Business Impact
        conv_prob = prediction_output.get("conversion_probability") if prediction_output else None
        expected_rev = None
        priority_class = None
        if prediction_output:
            rev_f = prediction_output.get("revenue_forecast")
            if rev_f:
                expected_rev = float(getattr(rev_f, "expected_revenue", 0.0) if not isinstance(rev_f, dict) else rev_f.get("expected_revenue", 0.0))
            prio = prediction_output.get("priority")
            if prio:
                priority_class = str(getattr(prio, "classification", "") if not isinstance(prio, dict) else prio.get("classification", ""))

        risk_lvl = anomaly_output.get("risk_level") if anomaly_output else None
        health_cls = health_output.get("classification") if health_output else None

        impact_level, impact_reason = self.business_impact_engine.evaluate_impact(
            quotation_value=context.total_amount,
            expected_revenue=expected_rev,
            risk_level=risk_lvl,
            health_classification=health_cls,
            conversion_probability=conv_prob,
            priority_classification=priority_class
        )

        # 8. Compute Unified Deal Intelligence Score
        h_score = health_output.get("health_score") if health_output else None
        a_score = anomaly_output.get("anomaly_score") if anomaly_output else None

        score_result = self.intelligence_score_calc.calculate_score(
            conversion_probability=conv_prob,
            health_score=h_score,
            anomaly_score=a_score,
            agreements=agreements
        )

        # 9. Consolidate Actions and Rank Top Insights
        actions = self.action_consolidator.consolidate_actions(
            health_data=health_output,
            anomaly_data=anomaly_output,
            prediction_data=prediction_output,
            recommendation_data=recommendation_output,
            conflicts=conflicts
        )

        top_insights = self.insight_ranker.rank_insights(
            signals=signals,
            conflicts=conflicts,
            agreements=agreements
        )

        # 10. Build Chronological Timeline
        timeline = self.timeline_builder.build_timeline(
            context=context,
            anomaly_data=anomaly_output,
            health_data=health_output
        )

        # 11. Synthesize Executive Response
        module_statuses = tracker.get_status_dict()
        response = self.synthesizer.synthesize(
            context=context,
            signals=signals,
            score_result=score_result,
            business_impact_level=impact_level,
            business_impact_reason=impact_reason,
            conflicts=conflicts,
            agreements=agreements,
            actions=actions,
            top_insights=top_insights,
            timeline=timeline,
            module_statuses=module_statuses
        )

        total_duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        avail_count = sum(1 for s in module_statuses.values() if s.status == ModuleAvailability.AVAILABLE)
        unavail_count = len(module_statuses) - avail_count

        logger.info(
            f"deal_intelligence_completed quotation_id={context.quotation_id} "
            f"modules_available={avail_count} modules_unavailable={unavail_count} "
            f"insights={len(top_insights)} conflicts={len(conflicts)} agreements={len(agreements)} "
            f"duration_ms={total_duration_ms}"
        )

        return response
