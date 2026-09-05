import pytest
from unittest.mock import MagicMock
from src.deal_intelligence.orchestrator import DealIntelligenceOrchestrator
from src.deal_intelligence.context_builder import UnifiedDealContext
from src.schemas.deal_intelligence import ModuleAvailability

def test_orchestrator_all_modules_available():
    rec_mock = MagicMock()
    rec_mock.is_initialized = True
    rec_mock.get_recommendations.return_value = {
        "recommendations": [{"product_id": "P-1", "product_name": "Support Plus", "score": 0.8, "expected_margin": 0.5, "reason": "Good fit"}]
    }

    anomaly_mock = MagicMock()
    anomaly_mock.is_initialized = True
    anomaly_mock.analyze_quotation.return_value = {
        "is_anomaly": False,
        "anomaly_score": 0.15,
        "risk_level": "LOW",
        "summary": "Low risk quotation",
        "deviations": []
    }

    health_mock = MagicMock()
    health_mock.is_initialized = True
    health_mock.evaluate_deal_health.return_value = {
        "health_score": 82.0,
        "classification": "EXCELLENT",
        "momentum": {"label": "POSITIVE", "score": 0.85},
        "strengths": ["Strong engagement"],
        "concerns": [],
        "recommended_actions": []
    }

    pred_mock = MagicMock()
    pred_mock.is_initialized = True
    pred_mock.predict_deal_outcome.return_value = {
        "conversion_probability": 0.88,
        "predicted_outcome": "LIKELY_TO_CONVERT",
        "revenue_forecast": {"expected_revenue": 88000.0, "quotation_value": 100000.0},
        "priority": {"score": 85.0, "classification": "HIGH_PRIORITY"},
        "top_positive_factors": [],
        "top_negative_factors": []
    }

    orchestrator = DealIntelligenceOrchestrator(
        recommendation_service=rec_mock,
        anomaly_service=anomaly_mock,
        deal_health_service=health_mock,
        prediction_service=pred_mock
    )

    ctx = UnifiedDealContext(
        quotation_id="Q-TEST",
        quotation={"quotation_id": "Q-TEST", "total_amount": 100000.0, "product_ids": ["P-BASE"]},
        deal_events=[]
    )

    response = orchestrator.orchestrate(ctx)

    assert response.quotation_id == "Q-TEST"
    assert response.overall_assessment.intelligence_score >= 80.0
    for mod_name, status_detail in response.module_status.items():
        assert status_detail.status == ModuleAvailability.AVAILABLE

def test_orchestrator_graceful_degradation_prediction_unavailable():
    anomaly_mock = MagicMock()
    anomaly_mock.is_initialized = True
    anomaly_mock.analyze_quotation.return_value = {
        "is_anomaly": False,
        "anomaly_score": 0.20,
        "risk_level": "LOW",
        "summary": "Low risk",
        "deviations": []
    }

    health_mock = MagicMock()
    health_mock.is_initialized = True
    health_mock.evaluate_deal_health.return_value = {
        "health_score": 75.0,
        "classification": "HEALTHY",
        "momentum": {"label": "STABLE", "score": 0.60},
        "strengths": ["Consistent cadence"],
        "concerns": [],
        "recommended_actions": []
    }

    # Prediction service uninitialized
    pred_mock = MagicMock()
    pred_mock.is_initialized = False

    orchestrator = DealIntelligenceOrchestrator(
        anomaly_service=anomaly_mock,
        deal_health_service=health_mock,
        prediction_service=pred_mock,
        recommendation_service=None
    )

    ctx = UnifiedDealContext(
        quotation_id="Q-DEGRADE",
        quotation={"quotation_id": "Q-DEGRADE", "total_amount": 40000.0},
        deal_events=[]
    )

    response = orchestrator.orchestrate(ctx)
    assert response.quotation_id == "Q-DEGRADE"
    assert response.module_status["PREDICTION"].status == ModuleAvailability.UNAVAILABLE
    assert response.module_status["DEAL_HEALTH"].status == ModuleAvailability.AVAILABLE
    assert response.module_status["ANOMALY_DETECTION"].status == ModuleAvailability.AVAILABLE
    assert response.overall_assessment.intelligence_score > 0
