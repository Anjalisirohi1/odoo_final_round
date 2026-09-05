import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

class IsolationForestModel:
    """
    Encapsulates the sklearn IsolationForest model.
    Provides clean fit, predict, and score_samples methods.
    """
    
    def __init__(self, n_estimators: int = 200, contamination: float = 0.05, random_state: int = 42):
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=random_state
        )
        self.is_fitted = False

    def fit(self, X: pd.DataFrame):
        """
        Fits the Isolation Forest on preprocessed historical features.
        """
        if X.empty:
            raise ValueError("Cannot fit Isolation Forest on an empty dataset.")
            
        self.model.fit(X)
        self.is_fitted = True

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict if a particular sample is an anomaly.
        Returns: 1 for normal, -1 for anomaly (sklearn standard).
        """
        self._check_is_fitted()
        if X.empty:
            return np.array([])
        return self.model.predict(X)

    def score_samples(self, X: pd.DataFrame) -> np.ndarray:
        """
        Returns the raw anomaly score of each sample.
        In sklearn, lower scores indicate more anomalous behavior.
        """
        self._check_is_fitted()
        if X.empty:
            return np.array([])
        return self.model.score_samples(X)
        
    def decision_function(self, X: pd.DataFrame) -> np.ndarray:
        """
        Returns the decision function score.
        Negative scores represent anomalies, positive represent normal.
        """
        self._check_is_fitted()
        if X.empty:
            return np.array([])
        return self.model.decision_function(X)

    def _check_is_fitted(self):
        if not self.is_fitted:
            raise ValueError("IsolationForestModel must be fitted before calling inference methods.")
