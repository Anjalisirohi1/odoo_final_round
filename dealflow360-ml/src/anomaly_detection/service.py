import logging
import pandas as pd
from typing import List, Dict, Any

from .feature_builder import AnomalyFeatureBuilder
from .preprocessor import AnomalyPreprocessor
from .isolation_forest_model import IsolationForestModel
from .scorer import AnomalyScorer
from .risk_classifier import RiskClassifier
from .deviation_analyzer import DeviationAnalyzer
from .explainer import AnomalyExplainer

logger = logging.getLogger(__name__)

class AnomalyDetectionService:
    """
    Orchestration layer for Quotation Anomaly Detection.
    Coordinates feature building, preprocessing, modeling, scoring, and explaining.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.feature_builder = AnomalyFeatureBuilder()
        self.preprocessor = AnomalyPreprocessor()
        
        n_estimators = config.get("n_estimators", 200)
        contamination = config.get("contamination", 0.05)
        random_state = config.get("random_state", 42)
        
        self.model = IsolationForestModel(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=random_state
        )
        self.scorer = AnomalyScorer()
        
        self.risk_classifier = RiskClassifier(
            medium_threshold=config.get("medium_threshold", 0.30),
            high_threshold=config.get("high_threshold", 0.55),
            critical_threshold=config.get("critical_threshold", 0.75)
        )
        self.deviation_analyzer = DeviationAnalyzer()
        self.explainer = AnomalyExplainer()
        
        self.is_initialized = False

    def initialize(self, historical_quotations: List[Dict[str, Any]]):
        """
        Trains the anomaly detection system on historical quotations.
        """
        logger.info("Initializing Anomaly Detection Service...")
        
        if not historical_quotations:
            logger.warning("No historical quotations provided. Initialization aborted.")
            return
            
        try:
            df = pd.DataFrame(historical_quotations)
            
            # 1. Fit baselines
            self.feature_builder.fit_baselines(df)
            
            # 2. Build training features
            features_df = self.feature_builder.build_features(historical_quotations)
            
            # 3. Fit Preprocessor
            scaled_features = self.preprocessor.fit_transform(features_df)
            
            # 4. Train Isolation Forest
            self.model.fit(scaled_features)
            
            # 5. Fit Scorer (to learn raw score distribution)
            raw_scores = self.model.decision_function(scaled_features)
            self.scorer.fit(raw_scores)
            
            self.is_initialized = True
            
            # Store historical quotations for lookup during inference
            self.historical_quotations = {q['quotation_id']: q for q in historical_quotations}
            
            # Logging diagnostics
            num_quotes = len(historical_quotations)
            num_features = len(self.preprocessor.FEATURE_COLUMNS)
            predictions = self.model.predict(scaled_features)
            num_anomalies = (predictions == -1).sum()
            
            logger.info(f"Anomaly Detection Service initialized successfully.")
            logger.info(f"Training dataset: {num_quotes} quotations.")
            logger.info(f"Features used: {num_features}.")
            logger.info(f"Anomalies detected in training set: {num_anomalies} ({(num_anomalies/num_quotes)*100:.1f}%).")
            
        except Exception as e:
            logger.error(f"Failed to initialize Anomaly Detection Service: {str(e)}")

    def analyze_quotation(self, quotation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Inference on a single quotation.
        """
        if not self.is_initialized:
            raise RuntimeError("AnomalyDetectionService is not initialized.")
            
        quotation_id = quotation.get('quotation_id', 'unknown')
        
        # 1. Feature Building
        features_df = self.feature_builder.build_features([quotation])
        
        # 2. Preprocessing
        scaled_features = self.preprocessor.transform(features_df)
        
        # 3. Inference
        prediction = self.model.predict(scaled_features)[0] # 1 or -1
        raw_score = self.model.decision_function(scaled_features)
        
        # 4. Scoring
        anomaly_score = float(self.scorer.score(raw_score)[0])
        
        # 5. Risk Classification
        risk_level = self.risk_classifier.classify(anomaly_score)
        
        # Determine final is_anomaly flag based on prediction (-1) or risk level threshold
        is_anomaly = bool(prediction == -1 or risk_level in ["HIGH", "CRITICAL"])
        
        # 6. Deviation Analysis
        # We pass the raw features back to the analyzer
        raw_feature_dict = features_df.iloc[0].to_dict()
        deviations = self.deviation_analyzer.analyze(raw_feature_dict)
        
        # 7. Explanation
        summary, primary_reasons = self.explainer.explain(anomaly_score, risk_level, deviations)
        
        return {
            "quotation_id": quotation_id,
            "is_anomaly": is_anomaly,
            "anomaly_score": anomaly_score,
            "risk_level": risk_level,
            "summary": summary,
            "primary_reasons": primary_reasons,
            "deviations": deviations,
            "model_metadata": {
                "algorithm": "Isolation Forest",
                "version": "in-memory-v1"
            }
        }
