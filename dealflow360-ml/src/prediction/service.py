import os
import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

from src.schemas.prediction import (
    PredictionResponse, PredictionOutcome, ConfidenceResult,
    RevenueForecast, PriorityResult, ModelMetadata
)
from src.core.config import settings

from .feature_builder import PredictionFeatureBuilder
from .confidence import ConfidenceEstimator
from .revenue_forecaster import RevenueForecaster
from .priority_engine import PriorityEngine
from .explainer import PredictionExplainer
from .model_repository import ModelRepository

logger = logging.getLogger(__name__)

class DealPredictionService:
    """
    Supervised predictive service for B2B deal conversion outcome,
    probability estimation, revenue forecasting, and deal prioritization.
    """
    
    def __init__(
        self,
        deal_health_service: Optional[Any] = None,
        anomaly_service: Optional[Any] = None
    ):
        self.deal_health_service = deal_health_service
        self.anomaly_service = anomaly_service
        
        self.feature_builder = PredictionFeatureBuilder()
        self.confidence_estimator = ConfidenceEstimator()
        self.revenue_forecaster = RevenueForecaster()
        self.priority_engine = PriorityEngine()
        self.explainer = PredictionExplainer()
        
        self.model: Optional[Any] = None
        self.preprocessor: Optional[Any] = None
        self.feature_names: List[str] = []
        self.model_name: str = "Uninitialized"
        self.metadata: Dict[str, Any] = {}
        self.is_initialized: bool = False
        
        # In-memory context stores for inference lookup
        self.quotations_map: Dict[str, Dict[str, Any]] = {}
        self.customers_map: Dict[str, Dict[str, Any]] = {}
        self.items_by_quote: Dict[str, List[Dict[str, Any]]] = {}
        self.orders_by_customer: Dict[str, List[Dict[str, Any]]] = {}
        self.quotes_by_customer: Dict[str, List[Dict[str, Any]]] = {}
        self.events_by_quote: Dict[str, List[Dict[str, Any]]] = {}

    def set_context_data(
        self,
        quotations: List[Dict[str, Any]],
        customers: List[Dict[str, Any]],
        quotation_items: Optional[List[Dict[str, Any]]] = None,
        orders: Optional[List[Dict[str, Any]]] = None,
        deal_events: Optional[List[Dict[str, Any]]] = None
    ):
        """
        Stores business collections in memory for low-latency inference lookup.
        """
        self.quotations_map = {q["quotation_id"]: q for q in quotations}
        self.customers_map = {c["customer_id"]: c for c in customers}
        
        self.items_by_quote = {}
        for item in (quotation_items or []):
            q_id = item.get("quotation_id")
            if q_id:
                self.items_by_quote.setdefault(q_id, []).append(item)
                
        self.events_by_quote = {}
        for evt in (deal_events or []):
            q_id = evt.get("quotation_id")
            if q_id:
                self.events_by_quote.setdefault(q_id, []).append(evt)
                
        self.orders_by_customer = {}
        for o in (orders or []):
            c_id = o.get("customer_id")
            if c_id:
                self.orders_by_customer.setdefault(c_id, []).append(o)
                
        self.quotes_by_customer = {}
        for q in quotations:
            c_id = q.get("customer_id")
            if c_id:
                self.quotes_by_customer.setdefault(c_id, []).append(q)

    def load_model(self, artifact_dir: Optional[str] = None) -> bool:
        """
        Loads the trained model pipeline and metadata from disk.
        """
        directory = artifact_dir or settings.PREDICTION_MODEL_DIR
        artifacts = ModelRepository.load_artifacts(directory)
        
        if artifacts is None:
            logger.warning(f"No trained prediction model artifact found at {directory}.")
            self.is_initialized = False
            return False
            
        self.model = artifacts["model"]
        self.preprocessor = artifacts["preprocessor"]
        self.feature_names = artifacts.get("feature_names", [])
        self.model_name = artifacts.get("model_name", "SupervisedModel")
        self.metadata = artifacts.get("metadata", {})
        self.is_initialized = True
        logger.info(f"Loaded prediction model {self.model_name} successfully from {directory}.")
        return True

    def set_model(
        self,
        model: Any,
        preprocessor: Any,
        model_name: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Directly injects an in-memory trained model and preprocessor.
        """
        self.model = model
        self.preprocessor = preprocessor
        self.model_name = model_name
        self.metadata = metadata or {}
        self.feature_names = getattr(preprocessor, "feature_names_out", [])
        self.is_initialized = True

    def predict_deal_outcome(
        self,
        quotation_id: str,
        custom_now: Optional[datetime] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Executes end-to-end deal outcome prediction and forecasting.
        """
        if not self.is_initialized or self.model is None or self.preprocessor is None:
            raise RuntimeError("DealPredictionService is not initialized with a trained model.")
            
        quotation = self.quotations_map.get(quotation_id)
        if not quotation:
            return None
            
        # 1. Build leakage-safe features
        df_features = self.feature_builder.build_features_for_quotations(
            quotations=[quotation],
            customers_map=self.customers_map,
            items_by_quote=self.items_by_quote,
            orders_by_customer=self.orders_by_customer,
            quotes_by_customer=self.quotes_by_customer,
            events_by_quote=self.events_by_quote,
            custom_now=custom_now
        )
        
        if df_features.empty:
            return None
            
        # 2. Preprocess
        X_trans = self.preprocessor.transform(df_features)
        
        # 3. Model Inference (Probabilities)
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X_trans)
            # Probability of conversion (class 1)
            conv_prob = float(probs[0, 1])
        elif hasattr(self.model, "decision_function"):
            decision = float(self.model.decision_function(X_trans)[0])
            conv_prob = 1.0 / (1.0 + np.exp(-decision))
        else:
            conv_prob = float(self.model.predict(X_trans)[0])
            
        conv_prob = min(1.0, max(0.0, conv_prob))
        
        # 4. Predicted Outcome Label
        if conv_prob >= 0.60:
            outcome = PredictionOutcome.LIKELY_TO_CONVERT
        elif conv_prob >= 0.40:
            outcome = PredictionOutcome.UNCERTAIN
        else:
            outcome = PredictionOutcome.LIKELY_TO_LOSE
            
        # 5. Confidence
        confidence = self.confidence_estimator.estimate(conv_prob)
        
        # 6. Revenue Forecast
        quotation_val = float(quotation.get("total_amount", 0.0))
        revenue_forecast = self.revenue_forecaster.forecast(quotation_val, conv_prob)
        
        # 7. Optional Phase 4/5 signals for priority ranking
        health_score = None
        momentum_score = None
        anomaly_score = None
        
        if self.deal_health_service and getattr(self.deal_health_service, "is_initialized", False):
            try:
                health_res = self.deal_health_service.evaluate_deal_health(quotation_id, custom_now=custom_now)
                if health_res:
                    health_score = health_res.get("health_score")
                    momentum_score = health_res.get("momentum", {}).score if hasattr(health_res.get("momentum"), "score") else 0.5
            except Exception:
                pass
                
        if self.anomaly_service and getattr(self.anomaly_service, "is_initialized", False):
            try:
                anomaly_res = self.anomaly_service.analyze_quotation(quotation)
                if anomaly_res:
                    anomaly_score = anomaly_res.get("anomaly_score")
            except Exception:
                pass
                
        # 8. Priority Engine
        priority = self.priority_engine.calculate_priority(
            conversion_probability=conv_prob,
            quotation_value=quotation_val,
            health_score=health_score,
            momentum_score=momentum_score,
            anomaly_score=anomaly_score
        )
        
        # 9. Explanations
        raw_feature_dict = df_features.iloc[0].to_dict()
        top_pos, top_neg = self.explainer.explain(
            raw_feature_dict,
            self.model,
            self.feature_names
        )
        
        model_meta = ModelMetadata(
            model_name=self.model_name,
            model_version=str(self.metadata.get("model_version", "1.0.0")),
            trained_at=str(self.metadata.get("trained_at", datetime.now(timezone.utc).isoformat())),
            metrics=self.metadata.get("metrics", {})
        )
        
        return {
            "quotation_id": quotation_id,
            "conversion_probability": round(conv_prob, 4),
            "predicted_outcome": outcome,
            "confidence": confidence,
            "revenue_forecast": revenue_forecast,
            "priority": priority,
            "top_positive_factors": top_pos,
            "top_negative_factors": top_neg,
            "model_metadata": model_meta,
            "feature_snapshot": raw_feature_dict,
            "predicted_at": datetime.now(timezone.utc)
        }

