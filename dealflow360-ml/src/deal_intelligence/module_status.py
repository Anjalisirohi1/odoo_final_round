from typing import Dict, Optional
import time
from src.schemas.deal_intelligence import ModuleAvailability, ModuleStatusDetail, ModuleName

class ModuleStatusTracker:
    """
    Tracks and records the lifecycle, availability, execution time, and error
    status of each intelligence module during unified deal intelligence processing.
    """
    def __init__(self):
        self._statuses: Dict[str, ModuleStatusDetail] = {
            ModuleName.RECOMMENDATION.value: ModuleStatusDetail(status=ModuleAvailability.UNAVAILABLE, reason="Not invoked"),
            ModuleName.ANOMALY_DETECTION.value: ModuleStatusDetail(status=ModuleAvailability.UNAVAILABLE, reason="Not invoked"),
            ModuleName.DEAL_HEALTH.value: ModuleStatusDetail(status=ModuleAvailability.UNAVAILABLE, reason="Not invoked"),
            ModuleName.PREDICTION.value: ModuleStatusDetail(status=ModuleAvailability.UNAVAILABLE, reason="Not invoked"),
        }
        self._start_times: Dict[str, float] = {}

    def start_module(self, module_name: str) -> None:
        self._start_times[module_name] = time.perf_counter()

    def record_success(self, module_name: str, status: ModuleAvailability = ModuleAvailability.AVAILABLE) -> None:
        latency = None
        if module_name in self._start_times:
            latency = round((time.perf_counter() - self._start_times[module_name]) * 1000, 2)
        self._statuses[module_name] = ModuleStatusDetail(
            status=status,
            reason=None,
            latency_ms=latency
        )

    def record_unavailable(self, module_name: str, reason: str) -> None:
        self._statuses[module_name] = ModuleStatusDetail(
            status=ModuleAvailability.UNAVAILABLE,
            reason=reason,
            latency_ms=None
        )

    def record_failure(self, module_name: str, error_message: str) -> None:
        latency = None
        if module_name in self._start_times:
            latency = round((time.perf_counter() - self._start_times[module_name]) * 1000, 2)
        self._statuses[module_name] = ModuleStatusDetail(
            status=ModuleAvailability.FAILED,
            reason=error_message,
            latency_ms=latency
        )

    def get_status_dict(self) -> Dict[str, ModuleStatusDetail]:
        return dict(self._statuses)
