import pandas as pd
import numpy as np
from src.anomaly_detection.isolation_forest_model import IsolationForestModel

def test_isolation_forest_model():
    model = IsolationForestModel(n_estimators=10, contamination=0.1, random_state=42)
    X = pd.DataFrame(np.random.rand(100, 5))
    
    model.fit(X)
    assert model.is_fitted
    
    preds = model.predict(X)
    assert len(preds) == 100
    assert set(preds).issubset({1, -1})
    
    scores = model.decision_function(X)
    assert len(scores) == 100
