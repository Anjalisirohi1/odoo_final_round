import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

from src.schemas.deal_intelligence import DealIntelligenceResponse
from .context_builder import UnifiedContextBuilder
from .orchestrator import DealIntelligenceOrchestrator

logger = logging.getLogger(__name__)

class DealIntelligenceService:
    """
    Unified Deal Intelligence Service (AI-05).
    Serves as the high-level orchestration interface for executive deal assessment,
    cross-module signal normalization, conflict/agreement synthesis, and prescriptive insights.
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

        self.context_builder: Optional[UnifiedContextBuilder] = None
        self.orchestrator = DealIntelligenceOrchestrator(
            recommendation_service=recommendation_service,
            anomaly_service=anomaly_service,
            deal_health_service=deal_health_service,
            prediction_service=prediction_service
        )
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
        Initializes the unified deal context builder with enterprise entity collections.
        """
        logger.info("Initializing Deal Intelligence Service Context Builder...")
        self.context_builder = UnifiedContextBuilder(
            quotations=quotations,
            customers=customers,
            quotation_items=quotation_items,
            orders=orders,
            deal_events=deal_events,
            sales_reps=sales_reps
        )
        self.is_initialized = True
        logger.info(f"Deal Intelligence Service initialized with {len(quotations)} quotations.")

    def analyze_deal(
        self,
        quotation_id: str,
        custom_now: Optional[datetime] = None
    ) -> Optional[DealIntelligenceResponse]:
        """
        Executes unified deal intelligence evaluation for a quotation.
        Returns None if quotation_id does not exist in context.
        """
        if not self.is_initialized or self.context_builder is None:
            raise RuntimeError("DealIntelligenceService is not initialized.")

        context = self.context_builder.build_context(quotation_id, custom_now=custom_now)
        if context is None:
            return None

        return self.orchestrator.orchestrate(context)
