import numpy as np

class AnomalyScorer:
    """
    Converts raw Isolation Forest scores into intuitive [0.0, 1.0] anomaly scores.
    0.0 -> Normal
    1.0 -> Highly Anomalous
    """
    
    def __init__(self):
        self.min_score = 0.0
        self.max_score = 0.0
        self.is_fitted = False

    def fit(self, raw_scores: np.ndarray):
        """
        Learns the distribution of raw scores from the training dataset.
        Sklearn's decision_function returns negative values for anomalies,
        and positive values for normal points.
        """
        if len(raw_scores) == 0:
            return
            
        # We invert the scores because in sklearn, lower = more anomalous.
        # So inverted_scores: higher = more anomalous.
        inverted_scores = -1 * raw_scores
        
        self.min_score = float(np.min(inverted_scores))
        self.max_score = float(np.max(inverted_scores))
        
        # If all scores are exactly identical (e.g. identical data), prevent division by zero.
        if np.isclose(self.min_score, self.max_score):
            self.max_score = self.min_score + 1.0
            
        self.is_fitted = True

    def score(self, raw_scores: np.ndarray) -> np.ndarray:
        """
        Converts inference raw scores into [0.0, 1.0] normalized scores.
        """
        if not self.is_fitted:
            raise ValueError("AnomalyScorer must be fitted before scoring.")
            
        if len(raw_scores) == 0:
            return np.array([])
            
        inverted_scores = -1 * raw_scores
        
        # Min-Max Scaling
        normalized = (inverted_scores - self.min_score) / (self.max_score - self.min_score)
        
        # Clip to [0.0, 1.0] to handle outliers unseen during training gracefully
        normalized = np.clip(normalized, 0.0, 1.0)
        
        return normalized
