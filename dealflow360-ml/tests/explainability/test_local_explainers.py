import pytest
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from src.explainability.local.model_explainer import LinearModelExplainer, TreeModelExplainer
from src.explainability.local.fallback_explainer import FallbackLocalExplainer
from src.explainability.local.shap_explainer import ShapLocalExplainer
from src.schemas.explainability import ExplanationMethod

def test_linear_model_explainer():
    explainer = LinearModelExplainer()
    assert explainer.method_name == ExplanationMethod.LINEAR_COEFFICIENT

    # Mock fitted logistic regression
    clf = LogisticRegression()
    X = np.array([[1.0, 2.0], [2.0, 1.0], [0.5, 3.0], [3.0, 0.5]])
    y = np.array([1, 1, 0, 1])
    clf.fit(X, y)

    df_sample = pd.DataFrame({"feat_a": [1.5], "feat_b": [2.5]})
    contributions = explainer.explain_instance(
        features_df=df_sample,
        model=clf,
        preprocessor=None,
        feature_names=["feat_a", "feat_b"]
    )
    assert len(contributions) == 2
    assert contributions[0].feature_name == "feat_a"
    assert isinstance(contributions[0].contribution, float)

def test_tree_model_explainer():
    explainer = TreeModelExplainer()
    assert explainer.method_name == ExplanationMethod.TREE_FEATURE_IMPORTANCE

    rf = RandomForestClassifier(n_estimators=10, random_state=42)
    X = np.array([[1.0, 2.0], [2.0, 1.0], [0.5, 3.0], [3.0, 0.5]])
    y = np.array([1, 1, 0, 1])
    rf.fit(X, y)

    df_sample = pd.DataFrame({"feat_a": [1.5], "feat_b": [2.5]})
    contributions = explainer.explain_instance(
        features_df=df_sample,
        model=rf,
        preprocessor=None,
        feature_names=["feat_a", "feat_b"]
    )
    assert len(contributions) == 2
    assert isinstance(contributions[0].contribution, float)

def test_fallback_explainer():
    explainer = FallbackLocalExplainer()
    assert explainer.method_name == ExplanationMethod.RULE_BASED

    df_sample = pd.DataFrame({
        "customer_historical_conversion_rate": [0.65],
        "discount_percentage": [10.0],
        "margin_percentage": [30.0],
        "customer_interaction_count": [3],
        "customer_total_prior_orders": [5],
        "early_event_count": [2]
    })
    contributions = explainer.explain_instance(features_df=df_sample)
    assert len(contributions) == 6
    # 0.65 conversion rate should have positive contribution
    conv_c = next(c for c in contributions if c.feature_name == "customer_historical_conversion_rate")
    assert conv_c.contribution > 0

def test_shap_explainer_handling():
    explainer = ShapLocalExplainer()
    # If shap is not installed, explain_instance raises error cleanly so fallback can take over
    if not explainer.is_available:
        with pytest.raises(RuntimeError):
            explainer.explain_instance(pd.DataFrame(), None, None, [])
