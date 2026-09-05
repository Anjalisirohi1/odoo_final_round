import numpy as np
from typing import Dict, Any, Tuple

class DriftMetrics:
    """
    Mathematical implementations of data and prediction drift statistics,
    featuring Population Stability Index (PSI) with zero-frequency epsilon protection.
    """

    @staticmethod
    def calculate_psi(
        expected: np.ndarray,
        actual: np.ndarray,
        num_buckets: int = 10,
        epsilon: float = 1e-4
    ) -> float:
        """
        Calculates Population Stability Index (PSI) between baseline (expected) and production (actual) arrays.
        """
        # Clean NaNs and Infinities
        exp_clean = expected[np.isfinite(expected)] if len(expected) > 0 else np.array([])
        act_clean = actual[np.isfinite(actual)] if len(actual) > 0 else np.array([])

        if len(exp_clean) == 0 or len(act_clean) == 0:
            return 0.0

        # Handle constant features
        if np.all(exp_clean == exp_clean[0]) and np.all(act_clean == act_clean[0]):
            if exp_clean[0] == act_clean[0]:
                return 0.0
            return 1.0  # Constant shifted completely

        # Determine quantile bin edges based on expected distribution
        percentiles = np.linspace(0, 100, num_buckets + 1)
        try:
            bin_edges = np.percentile(exp_clean, percentiles)
            bin_edges = np.unique(bin_edges)
            if len(bin_edges) < 2:
                # If duplicates caused collapsed bins, fall back to linear spacing
                bin_edges = np.linspace(min(exp_clean.min(), act_clean.min()), max(exp_clean.max(), act_clean.max()), num_buckets + 1)
                bin_edges = np.unique(bin_edges)
                if len(bin_edges) < 2:
                    return 0.0
        except Exception:
            return 0.0

        # Expand outer edges slightly to capture extremes
        bin_edges[0] = -np.inf
        bin_edges[-1] = np.inf

        # Calculate frequency counts in each bucket
        exp_counts, _ = np.histogram(exp_clean, bins=bin_edges)
        act_counts, _ = np.histogram(act_clean, bins=bin_edges)

        # Convert to percentages with epsilon smoothing
        exp_pct = (exp_counts + epsilon) / (len(exp_clean) + epsilon * len(exp_counts))
        act_pct = (act_counts + epsilon) / (len(act_clean) + epsilon * len(act_counts))

        # PSI formula: sum((Actual% - Expected%) * ln(Actual% / Expected%))
        psi_val = np.sum((act_pct - exp_pct) * np.log(act_pct / exp_pct))
        return float(round(max(0.0, psi_val), 4))

    @staticmethod
    def calculate_categorical_psi(
        expected_counts: Dict[str, int],
        actual_counts: Dict[str, int],
        epsilon: float = 1e-4
    ) -> float:
        """
        Calculates PSI for categorical discrete distributions across union of categories.
        """
        all_categories = sorted(list(set(expected_counts.keys()).union(set(actual_counts.keys()))))
        if not all_categories:
            return 0.0

        exp_total = sum(expected_counts.values())
        act_total = sum(actual_counts.values())

        if exp_total == 0 or act_total == 0:
            return 0.0

        num_cats = len(all_categories)
        psi_sum = 0.0

        for cat in all_categories:
            e_c = expected_counts.get(cat, 0)
            a_c = actual_counts.get(cat, 0)

            e_pct = (e_c + epsilon) / (exp_total + epsilon * num_cats)
            a_pct = (a_c + epsilon) / (act_total + epsilon * num_cats)

            psi_sum += (a_pct - e_pct) * np.log(a_pct / e_pct)

        return float(round(max(0.0, psi_sum), 4))
