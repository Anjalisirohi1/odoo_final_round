from typing import List, Optional
from src.schemas.mlops import PredictionObservation, ActualOutcome

class PerformanceWindow:
    """
    Utilities for slicing and windowing prediction observations over recent resolved samples.
    """

    @staticmethod
    def filter_resolved_observations(
        observations: List[PredictionObservation],
        window_size: Optional[int] = None
    ) -> List[PredictionObservation]:
        """
        Filters observations strictly to those with verified outcomes (WON or LOST).
        Excludes unresolved (PENDING) records.
        """
        resolved = [
            obs for obs in observations
            if obs.actual_outcome in [ActualOutcome.WON, ActualOutcome.LOST]
        ]
        if window_size is not None and window_size > 0:
            return resolved[-window_size:]
        return resolved
