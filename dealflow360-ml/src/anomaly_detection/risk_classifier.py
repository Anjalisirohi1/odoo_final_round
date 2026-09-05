class RiskClassifier:
    """
    Categorizes numerical anomaly scores into discrete business risk levels.
    """
    
    def __init__(self, medium_threshold: float = 0.30, high_threshold: float = 0.55, critical_threshold: float = 0.75):
        self.medium_threshold = medium_threshold
        self.high_threshold = high_threshold
        self.critical_threshold = critical_threshold

    def classify(self, anomaly_score: float) -> str:
        """
        Maps a 0.0 - 1.0 anomaly score to a risk category.
        """
        if anomaly_score >= self.critical_threshold:
            return "CRITICAL"
        elif anomaly_score >= self.high_threshold:
            return "HIGH"
        elif anomaly_score >= self.medium_threshold:
            return "MEDIUM"
        else:
            return "LOW"
