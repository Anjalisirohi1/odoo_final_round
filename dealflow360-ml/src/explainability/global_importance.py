import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import numpy as np
import pandas as pd

from src.core.config import settings
from src.schemas.explainability import (
    GlobalFeatureImportance, GlobalImportanceResponse, ExplanationMethod
)
from .feature_mapper import FeatureMapper

logger = logging.getLogger(__name__)

class GlobalImportanceService:
    """
    Computes, ranks, translates, and caches global feature importance for the active prediction model.
    """

    def __init__(self, feature_mapper: Optional[FeatureMapper] = None):
        self.mapper = feature_mapper or FeatureMapper()
        self._cache: Dict[str, GlobalImportanceResponse] = {}

    def get_global_importance(
        self,
        model: Any,
        feature_names: List[str],
        model_name: str = "SupervisedModel",
        model_version: str = "1.0.0",
        force_refresh: bool = False
    ) -> GlobalImportanceResponse:
        cache_key = f"{model_name}:{model_version}"
        if not force_refresh and settings.XAI_GLOBAL_IMPORTANCE_CACHE_ENABLED and cache_key in self._cache:
            return self._cache[cache_key]

        method = ExplanationMethod.RULE_BASED
        importances: np.ndarray

        if model is not None and hasattr(model, "coef_"):
            coef = model.coef_[0] if model.coef_.ndim > 1 else model.coef_
            abs_coef = np.abs(coef)
            total = np.sum(abs_coef)
            importances = abs_coef / total if total > 0 else np.zeros_like(abs_coef)
            method = ExplanationMethod.LINEAR_COEFFICIENT
        elif model is not None and hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            total = np.sum(importances)
            importances = importances / total if total > 0 else np.zeros_like(importances)
            method = ExplanationMethod.TREE_FEATURE_IMPORTANCE
        else:
            # Fallback default importance
            n = len(feature_names) if feature_names else 5
            importances = np.array([1.0 / n] * n)
            method = ExplanationMethod.RULE_BASED

        names = feature_names if feature_names and len(feature_names) == len(importances) else [f"feature_{i}" for i in range(len(importances))]

        pairs = list(zip(names, importances))
        # Sort descending by importance
        pairs.sort(key=lambda x: x[1], reverse=True)

        feature_items: List[GlobalFeatureImportance] = []
        for rank, (name, imp) in enumerate(pairs, start=1):
            meta = self.mapper.get_metadata(name)
            feature_items.append(GlobalFeatureImportance(
                feature=name,
                label=meta["label"],
                category=meta["category"],
                importance=round(float(imp), 4),
                rank=rank,
                description=f"Global influence of {meta['label']} across historical deal evaluations."
            ))

        response = GlobalImportanceResponse(
            model_name=model_name,
            model_version=model_version,
            method=method,
            feature_importance=feature_items,
            generated_at=datetime.now(timezone.utc).isoformat()
        )

        if settings.XAI_GLOBAL_IMPORTANCE_CACHE_ENABLED:
            self._cache[cache_key] = response

        return response
