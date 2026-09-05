import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

from src.schemas.deal_health import (
    DealHealthResponse, DimensionScores, MomentumResult,
    HealthClassification, MomentumLabel
)
from src.core.config import settings

from .context_builder import DealContextBuilder, DealContext
from .conversion_scorer import ConversionPotentialScorer
from .engagement_scorer import EngagementHealthScorer
from .financial_scorer import FinancialHealthScorer
from .momentum_analyzer import MomentumAnalyzer
from .risk_integrator import RiskIntegrator
from .health_aggregator import HealthAggregator
from .health_classifier import HealthClassifier
from .action_engine import ActionEngine
from .explainer import DealHealthExplainer

logger = logging.getLogger(__name__)

class DealHealthService:
    """
    Orchestration layer for Deal Health Intelligence.
    Coordinates multi-dimensional scoring, temporal momentum analysis,
    ML anomaly risk integration, prescriptive actions, and transparent explanations.
    """
    
    def __init__(
        self,
        anomaly_service: Optional[Any] = None,
        config: Optional[Dict[str, Any]] = None
    ):
        cfg = config or {}
        
        # Load weights from config or settings
        weights = {
            "conversion_potential": cfg.get("weight_conversion", settings.DEAL_HEALTH_WEIGHT_CONVERSION),
            "engagement": cfg.get("weight_engagement", settings.DEAL_HEALTH_WEIGHT_ENGAGEMENT),
            "financial_health": cfg.get("weight_financial", settings.DEAL_HEALTH_WEIGHT_FINANCIAL),
            "momentum": cfg.get("weight_momentum", settings.DEAL_HEALTH_WEIGHT_MOMENTUM),
            "risk_safety": cfg.get("weight_risk_safety", settings.DEAL_HEALTH_WEIGHT_RISK_SAFETY)
        }
        
        self.context_builder: Optional[DealContextBuilder] = None
        self.conversion_scorer = ConversionPotentialScorer()
        self.engagement_scorer = EngagementHealthScorer()
        self.financial_scorer = FinancialHealthScorer()
        self.momentum_analyzer = MomentumAnalyzer()
        self.risk_integrator = RiskIntegrator(anomaly_service=anomaly_service)
        self.aggregator = HealthAggregator(weights=weights)
        self.classifier = HealthClassifier(
            excellent_threshold=cfg.get("excellent_threshold", settings.DEAL_HEALTH_EXCELLENT_THRESHOLD),
            healthy_threshold=cfg.get("healthy_threshold", settings.DEAL_HEALTH_HEALTHY_THRESHOLD),
            at_risk_threshold=cfg.get("at_risk_threshold", settings.DEAL_HEALTH_AT_RISK_THRESHOLD)
        )
        self.action_engine = ActionEngine()
        self.explainer = DealHealthExplainer()
        
        self.is_initialized = False

    def initialize(
        self,
        quotations: List[Dict[str, Any]],
        customers: List[Dict[str, Any]],
        quotation_items: Optional[List[Dict[str, Any]]] = None,
        orders: Optional[List[Dict[str, Any]]] = None,
        deal_events: Optional[List[Dict[str, Any]]] = None,
        sales_reps: Optional[List[Dict[str, Any]]] = None
    ):
        """
        Initializes the context builder with business datasets.
        """
        logger.info("Initializing Deal Health Intelligence Service...")
        self.context_builder = DealContextBuilder(
            quotations=quotations,
            customers=customers,
            quotation_items=quotation_items or [],
            orders=orders or [],
            deal_events=deal_events or [],
            sales_reps=sales_reps or []
        )
        self.is_initialized = True
        logger.info(f"Deal Health Service initialized with {len(quotations)} quotations and {len(customers)} customers.")

    def evaluate_deal_health(self, quotation_id: str, custom_now: Optional[datetime] = None) -> Optional[Dict[str, Any]]:
        """
        Executes end-to-end Deal Health Intelligence analysis for a quotation.
        Returns None if quotation_id does not exist in context.
        """
        if not self.is_initialized or self.context_builder is None:
            raise RuntimeError("DealHealthService is not initialized.")
            
        context = self.context_builder.build_context(quotation_id, custom_now=custom_now)
        if context is None:
            return None
            
        # 1. Conversion Potential
        conv_score, conv_evidence, conv_strengths, conv_concerns = self.conversion_scorer.score(context)
        
        # 2. Engagement Health
        eng_score, eng_evidence, eng_strengths, eng_concerns = self.engagement_scorer.score(context)
        
        # 3. Financial Health
        fin_score, fin_evidence, fin_strengths, fin_concerns = self.financial_scorer.score(context)
        
        # 4. Deal Momentum
        mom_score, mom_label, mom_evidence, mom_strengths, mom_concerns = self.momentum_analyzer.analyze(context)
        
        # 5. Risk Safety (Phase 4 Integration)
        risk_score, risk_evidence, risk_strengths, risk_concerns = self.risk_integrator.evaluate_risk(context)
        
        # 6. Aggregate Health Score
        health_result = self.aggregator.aggregate(
            conversion_potential=conv_score,
            engagement=eng_score,
            financial_health=fin_score,
            momentum=mom_score,
            risk_safety=risk_score
        )
        
        # 7. Classification
        classification = self.classifier.classify(health_result.health_score)
        
        dim_scores = DimensionScores(
            conversion_potential=round(conv_score, 4),
            engagement=round(eng_score, 4),
            financial_health=round(fin_score, 4),
            momentum=round(mom_score, 4),
            risk_safety=round(risk_score, 4)
        )
        
        momentum_result = MomentumResult(
            label=mom_label,
            score=round(mom_score, 4),
            evidence=mom_evidence
        )
        
        # 8. Prescriptive Action Intelligence
        recommended_actions = self.action_engine.generate_actions(
            health_score=health_result.health_score,
            classification=classification,
            dimension_scores=dim_scores,
            momentum=momentum_result,
            risk_evidence=risk_evidence,
            financial_evidence=fin_evidence,
            engagement_evidence=eng_evidence,
            conversion_evidence=conv_evidence,
            context=context
        )
        
        # 9. Explainability
        all_strengths = conv_strengths + eng_strengths + fin_strengths + mom_strengths + risk_strengths
        all_concerns = conv_concerns + eng_concerns + fin_concerns + mom_concerns + risk_concerns
        
        strengths, concerns = self.explainer.compile_explanation(
            health_score=health_result.health_score,
            classification=classification,
            momentum_label=mom_label,
            all_strengths=all_strengths,
            all_concerns=all_concerns
        )
        
        return {
            "quotation_id": quotation_id,
            "health_score": health_result.health_score,
            "classification": classification,
            "dimension_scores": dim_scores,
            "momentum": momentum_result,
            "strengths": strengths,
            "concerns": concerns,
            "recommended_actions": recommended_actions,
            "calculated_at": datetime.now(timezone.utc)
        }
