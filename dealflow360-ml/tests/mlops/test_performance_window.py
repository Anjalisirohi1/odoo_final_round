import pytest
from src.mlops.performance_window import PerformanceWindow
from src.schemas.mlops import PredictionObservation, ActualOutcome

def test_performance_window_filters_pending():
    obs_list = [
        PredictionObservation(prediction_id="p1", model_name="m", model_version="1", quotation_id="q1", predicted_outcome="WON", conversion_probability=0.8, confidence="HIGH", expected_revenue=100, timestamp="t", actual_outcome=ActualOutcome.WON),
        PredictionObservation(prediction_id="p2", model_name="m", model_version="1", quotation_id="q2", predicted_outcome="LOST", conversion_probability=0.2, confidence="HIGH", expected_revenue=100, timestamp="t", actual_outcome=ActualOutcome.PENDING),
        PredictionObservation(prediction_id="p3", model_name="m", model_version="1", quotation_id="q3", predicted_outcome="LOST", conversion_probability=0.3, confidence="HIGH", expected_revenue=100, timestamp="t", actual_outcome=ActualOutcome.LOST),
    ]

    resolved = PerformanceWindow.filter_resolved_observations(obs_list)
    assert len(resolved) == 2
    assert all(o.actual_outcome in [ActualOutcome.WON, ActualOutcome.LOST] for o in resolved)

    windowed = PerformanceWindow.filter_resolved_observations(obs_list, window_size=1)
    assert len(windowed) == 1
    assert windowed[0].prediction_id == "p3"
