from typing import List, Optional
import numpy as np

from src.schemas.explainability import ExplanationConfidence, ExplanationMethod
from .base import RawContribution

class ExplanationConfidenceEstimator:
    """
    Estimates the confidence and attribution reliability of an explanation.
    Distinguishes explanation reliability from model prediction certainty.
    """

    def estimate_confidence(
        self,
        method: ExplanationMethod,
        raw_contributions: List[RawContribution],
        fallback_used: bool = False
    ) -> ExplanationConfidence:
        if fallback_used or method == ExplanationMethod.RULE_BASED:
            return ExplanationConfidence.MEDIUM

        if not raw_contributions:
            return ExplanationConfidence.LOW

        magnitudes = np.array([abs(c.contribution) for c in raw_contributions])
        total_mag = float(np.sum(magnitudes))

        if total_mag < 1e-5:
            return ExplanationConfidence.LOW

        significant_count = int(np.sum(magnitudes >= 0.02))

        # Check attribution concentration (top 3 features share of total magnitude)
        sorted_mags = np.sort(magnitudes)[::-1]
        top3_share = float(np.sum(sorted_mags[:3])) / total_mag if total_mag > 0 else 0.0

        if method in [ExplanationMethod.SHAP, ExplanationMethod.LINEAR_COEFFICIENT, ExplanationMethod.TREE_FEATURE_IMPORTANCE]:
            if significant_count >= 2 and top3_share >= 0.50:
                return ExplanationConfidence.HIGH
            elif significant_count >= 1:
                return ExplanationConfidence.MEDIUM
            else:
                return ExplanationConfidence.LOW
        else:
            return ExplanationConfidence.MEDIUM
