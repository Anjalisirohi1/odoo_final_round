import logging
from typing import List, Any, Optional
import numpy as np
import pandas as pd

from src.schemas.explainability import ExplanationMethod
from ..base import BaseLocalExplainer, RawContribution

logger = logging.getLogger(__name__)

class LinearModelExplainer(BaseLocalExplainer):
    """
    Local feature attribution for linear models (e.g. LogisticRegression).
    Computes exact log-odds contribution: contribution_i = w_i * x_i.
    """

    @property
    def method_name(self) -> ExplanationMethod:
        return ExplanationMethod.LINEAR_COEFFICIENT

    def explain_instance(
        self,
        features_df: pd.DataFrame,
        model: Any,
        preprocessor: Any,
        feature_names: List[str]
    ) -> List[RawContribution]:
        if not hasattr(model, "coef_"):
            raise ValueError("Model does not have 'coef_' attribute for linear attribution.")

        X_trans = preprocessor.transform(features_df) if preprocessor else features_df.values
        if hasattr(X_trans, "toarray"):
            X_trans = X_trans.toarray()

        coef = model.coef_[0] if model.coef_.ndim > 1 else model.coef_
        row_vec = X_trans[0]

        # Element-wise contribution to the linear decision score
        contributions_raw = coef * row_vec

        names = feature_names if feature_names and len(feature_names) == len(contributions_raw) else [f"feature_{i}" for i in range(len(contributions_raw))]
        raw_row = features_df.iloc[0].to_dict()

        results: List[RawContribution] = []
        for name, cont, x_val in zip(names, contributions_raw, row_vec):
            raw_val = raw_row.get(name, x_val)
            results.append(RawContribution(
                feature_name=name,
                feature_value=raw_val,
                contribution=float(cont)
            ))

        return results


class TreeModelExplainer(BaseLocalExplainer):
    """
    Local feature attribution for tree models (RandomForest, GradientBoosting).
    Combines global feature importances with standardized deviation directionality.
    """

    @property
    def method_name(self) -> ExplanationMethod:
        return ExplanationMethod.TREE_FEATURE_IMPORTANCE

    def explain_instance(
        self,
        features_df: pd.DataFrame,
        model: Any,
        preprocessor: Any,
        feature_names: List[str]
    ) -> List[RawContribution]:
        if not hasattr(model, "feature_importances_"):
            raise ValueError("Model does not have 'feature_importances_' attribute for tree attribution.")

        X_trans = preprocessor.transform(features_df) if preprocessor else features_df.values
        if hasattr(X_trans, "toarray"):
            X_trans = X_trans.toarray()

        importances = model.feature_importances_
        row_vec = X_trans[0]

        # Scale importance by the standardized deviation (positive if above mean, negative if below mean)
        contributions_raw = importances * np.tanh(row_vec)

        names = feature_names if feature_names and len(feature_names) == len(contributions_raw) else [f"feature_{i}" for i in range(len(contributions_raw))]
        raw_row = features_df.iloc[0].to_dict()

        results: List[RawContribution] = []
        for name, cont, x_val in zip(names, contributions_raw, row_vec):
            raw_val = raw_row.get(name, x_val)
            results.append(RawContribution(
                feature_name=name,
                feature_value=raw_val,
                contribution=float(cont)
            ))

        return results
