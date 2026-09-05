from src.anomaly_detection.explainer import AnomalyExplainer

def test_anomaly_explainer():
    explainer = AnomalyExplainer()
    deviations = [
        {"feature": "f1", "description": "High discount."},
        {"feature": "f2", "description": "Low margin."}
    ]
    summary, reasons = explainer.explain(0.8, "CRITICAL", deviations)
    
    assert len(reasons) == 2
    assert "margin or discount deviations" in summary
