import pytest
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from src.explainability.global_importance import GlobalImportanceService
from src.schemas.explainability import ExplanationMethod

def test_global_importance_linear():
    service = GlobalImportanceService()

    clf = LogisticRegression()
    X = np.array([[1.0, 2.0], [2.0, 1.0], [0.5, 3.0], [3.0, 0.5]])
    y = np.array([1, 1, 0, 1])
    clf.fit(X, y)

    res = service.get_global_importance(
        model=clf,
        feature_names=["discount_percentage", "customer_historical_conversion_rate"],
        model_name="TestLinearModel",
        model_version="1.0.0"
    )

    assert res.method == ExplanationMethod.LINEAR_COEFFICIENT
    assert len(res.feature_importance) == 2
    assert res.feature_importance[0].rank == 1
    assert res.feature_importance[1].rank == 2

    # Test caching
    res_cached = service.get_global_importance(
        model=clf,
        feature_names=["discount_percentage", "customer_historical_conversion_rate"],
        model_name="TestLinearModel",
        model_version="1.0.0"
    )
    assert res_cached == res

def test_global_importance_tree():
    service = GlobalImportanceService()

    rf = RandomForestClassifier(n_estimators=10, random_state=42)
    X = np.array([[1.0, 2.0], [2.0, 1.0], [0.5, 3.0], [3.0, 0.5]])
    y = np.array([1, 1, 0, 1])
    rf.fit(X, y)

    res = service.get_global_importance(
        model=rf,
        feature_names=["discount_percentage", "customer_historical_conversion_rate"],
        model_name="TestTreeModel",
        model_version="1.0.0"
    )

    assert res.method == ExplanationMethod.TREE_FEATURE_IMPORTANCE
    assert len(res.feature_importance) == 2
