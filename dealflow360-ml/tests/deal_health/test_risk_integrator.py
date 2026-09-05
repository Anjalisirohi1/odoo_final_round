import pytest
from src.deal_health.context_builder import DealContext
from src.deal_health.risk_integrator import RiskIntegrator

class MockAnomalyService:
    def __init__(self, anomaly_score=0.10, risk_level="LOW", is_anomaly=False):
        self.anomaly_score = anomaly_score
        self.risk_level = risk_level
        self.is_anomaly = is_anomaly
        self.is_initialized = True

    def analyze_quotation(self, quotation):
        return {
            "quotation_id": quotation.get("quotation_id"),
            "anomaly_score": self.anomaly_score,
            "risk_level": self.risk_level,
            "is_anomaly": self.is_anomaly,
            "deviations": [],
            "primary_reasons": ["Test reason"] if self.is_anomaly else []
        }

def test_risk_integrator_low_risk():
    mock_service = MockAnomalyService(anomaly_score=0.10, risk_level="LOW", is_anomaly=False)
    integrator = RiskIntegrator(anomaly_service=mock_service)
    context = DealContext(quotation_id="q1", quotation={"quotation_id": "q1"})
    
    score, evidence, strengths, concerns = integrator.evaluate_risk(context)
    assert score == 0.90
    assert evidence["anomaly_score"] == 0.10
    assert len(strengths) > 0
    assert len(concerns) == 0

def test_risk_integrator_high_risk():
    mock_service = MockAnomalyService(anomaly_score=0.85, risk_level="CRITICAL", is_anomaly=True)
    integrator = RiskIntegrator(anomaly_service=mock_service)
    context = DealContext(quotation_id="q1", quotation={"quotation_id": "q1"})
    
    score, evidence, strengths, concerns = integrator.evaluate_risk(context)
    assert abs(score - 0.15) < 1e-4
    assert evidence["risk_level"] == "CRITICAL"
    assert len(concerns) > 0

def test_risk_integrator_uninitialized_fallback():
    integrator = RiskIntegrator(anomaly_service=None)
    context = DealContext(quotation_id="q1", quotation={"quotation_id": "q1"})
    
    score, evidence, strengths, concerns = integrator.evaluate_risk(context)
    assert score == 0.80
    assert "note" in evidence
