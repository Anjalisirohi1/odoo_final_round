import pytest
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression

from src.explainability.service import ExplainabilityService
from src.schemas.explainability import ExplanationMethod, ExplanationConfidence

def test_explainability_service_explain_prediction():
    service = ExplainabilityService()

    clf = LogisticRegression()
    X = np.array([[1.0, 2.0], [2.0, 1.0], [0.5, 3.0], [3.0, 0.5]])
    y = np.array([1, 1, 0, 1])
    clf.fit(X, y)

    df_sample = pd.DataFrame({
        "customer_historical_conversion_rate": [0.70],
        "discount_percentage": [10.0]
    })

    explanation = service.explain_prediction(
        quotation_id="quote_123",
        features_df=df_sample,
        model=clf,
        preprocessor=None,
        feature_names=["customer_historical_conversion_rate", "discount_percentage"],
        model_name="LogisticRegression",
        model_version="1.0.0",
        conversion_probability=0.82,
        predicted_outcome="LIKELY_TO_CONVERT"
    )

    assert explanation.quotation_id == "quote_123"
    assert explanation.decision_type == "PREDICTION"
    assert len(explanation.positive_drivers) > 0
    assert explanation.method in [ExplanationMethod.LINEAR_COEFFICIENT, ExplanationMethod.SHAP, ExplanationMethod.RULE_BASED]
    assert explanation.metadata is not None
    assert explanation.metadata.model_name == "LogisticRegression"

def test_explainability_service_unified_explanation():
    service = ExplainabilityService()

    pred_res = {"conversion_probability": 0.85, "predicted_outcome": "LIKELY_TO_CONVERT"}
    health_res = {"health_score": 82.0, "classification": "EXCELLENT", "strengths": ["High engagement"], "concerns": []}
    anomaly_res = {"anomaly_score": 0.15, "risk_level": "LOW", "deviations": []}

    unified = service.explain_deal_unified(
        quotation_id="quote_999",
        prediction_result=pred_res,
        anomaly_result=anomaly_res,
        deal_health_result=health_res
    )

    assert unified.quotation_id == "quote_999"
    assert len(unified.ai_consensus) > 0
    assert len(unified.module_summaries) == 2
    assert "deal_health" in unified.module_summaries
    assert "anomaly_detection" in unified.module_summaries
