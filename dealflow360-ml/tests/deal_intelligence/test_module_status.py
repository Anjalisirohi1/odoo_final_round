import pytest
from src.deal_intelligence.module_status import ModuleStatusTracker
from src.schemas.deal_intelligence import ModuleAvailability, ModuleName

def test_module_status_tracker():
    tracker = ModuleStatusTracker()

    tracker.start_module(ModuleName.PREDICTION.value)
    tracker.record_success(ModuleName.PREDICTION.value)

    tracker.record_unavailable(ModuleName.RECOMMENDATION.value, "No recommendations mined")
    tracker.record_failure(ModuleName.ANOMALY_DETECTION.value, "Division by zero")

    status_dict = tracker.get_status_dict()
    assert status_dict[ModuleName.PREDICTION.value].status == ModuleAvailability.AVAILABLE
    assert status_dict[ModuleName.PREDICTION.value].latency_ms is not None

    assert status_dict[ModuleName.RECOMMENDATION.value].status == ModuleAvailability.UNAVAILABLE
    assert "No recommendations" in status_dict[ModuleName.RECOMMENDATION.value].reason

    assert status_dict[ModuleName.ANOMALY_DETECTION.value].status == ModuleAvailability.FAILED
    assert "Division by zero" in status_dict[ModuleName.ANOMALY_DETECTION.value].reason
