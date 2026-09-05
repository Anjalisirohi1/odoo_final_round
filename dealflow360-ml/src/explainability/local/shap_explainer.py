import logging
from typing import List, Any, Optional
import numpy as np
import pandas as pd

from src.schemas.explainability import ExplanationMethod
from ..base import BaseLocalExplainer, RawContribution

logger = logging.getLogger(__name__)

class ShapLocalExplainer(BaseLocalExplainer):
    """
    SHAP-based local explainer with dynamic model introspection.
    Wraps shap library safely, raising an exception if shap is missing or incompatible,
    allowing caller to seamlessly delegate to ModelExplainer or FallbackExplainer.
    """

    def __init__(self):
        self._shap_module = None
        self._is_available = self._check_shap_available()

    def _check_shap_available(self) -> bool:
        try:
            import shap
            self._shap_module = shap
            return True
        except ImportError:
            self._shap_module = None
            return False

    @property
    def is_available(self) -> bool:
        return self._is_available

    @property
    def method_name(self) -> ExplanationMethod:
        return ExplanationMethod.SHAP

    def explain_instance(
        self,
        features_df: pd.DataFrame,
        model: Any,
        preprocessor: Any,
        feature_names: List[str]
    ) -> List[RawContribution]:
        if not self._is_available or self._shap_module is None:
            raise RuntimeError("SHAP library is not installed or available.")

        shap = self._shap_module
        X_trans = preprocessor.transform(features_df) if preprocessor else features_df.values

        # Select appropriate SHAP explainer
        model_type = type(model).__name__
        if "Forest" in model_type or "Boosting" in model_type or "Tree" in model_type:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X_trans)
        elif "Logistic" in model_type or "Linear" in model_type:
            explainer = shap.LinearExplainer(model, X_trans)
            shap_values = explainer.shap_values(X_trans)
        else:
            explainer = shap.Explainer(model, X_trans)
            shap_values = explainer(X_trans).values

        # Handle binary classification output formats (array of 2 classes or 1D)
        if isinstance(shap_values, list) and len(shap_values) == 2:
            # Class 1 (conversion)
            instance_values = shap_values[1][0]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            instance_values = shap_values[0, :, 1]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 2:
            instance_values = shap_values[0]
        else:
            instance_values = np.array(shap_values).flatten()

        names = feature_names if feature_names and len(feature_names) == len(instance_values) else [f"f_{i}" for i in range(len(instance_values))]
        raw_row = features_df.iloc[0].to_dict()

        contributions: List[RawContribution] = []
        for name, val in zip(names, instance_values):
            raw_val = raw_row.get(name, features_df.iloc[0].get(name, None))
            contributions.append(RawContribution(
                feature_name=name,
                feature_value=raw_val,
                contribution=float(val)
            ))

        return contributions
