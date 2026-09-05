import pytest
import numpy as np
from sklearn.linear_model import LogisticRegression
from src.prediction.evaluator import ModelEvaluator

def test_evaluator_metrics():
    X = np.array([[1.0, 2.0], [2.0, 3.0], [3.0, 1.0], [5.0, 6.0], [6.0, 7.0], [7.0, 8.0]])
    y = np.array([0, 0, 0, 1, 1, 1])
    
    clf = LogisticRegression(random_state=42)
    clf.fit(X, y)
    
    metrics = ModelEvaluator.evaluate(clf, X, y)
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1" in metrics
    assert "roc_auc" in metrics
    assert "confusion_matrix" in metrics
    assert metrics["accuracy"] >= 0.80
