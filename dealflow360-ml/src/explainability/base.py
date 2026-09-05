from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from src.schemas.explainability import ExplanationMethod

@dataclass
class RawContribution:
    feature_name: str
    feature_value: Any
    contribution: float
    base_value: Optional[float] = None

@dataclass
class GlobalImportanceItem:
    feature_name: str
    importance: float

class BaseLocalExplainer(ABC):
    """
    Abstract base class for local prediction explainers.
    """
    
    @abstractmethod
    def explain_instance(
        self,
        features_df: pd.DataFrame,
        model: Any,
        preprocessor: Any,
        feature_names: List[str]
    ) -> List[RawContribution]:
        """
        Calculates raw feature contributions for a single instance.
        """
        pass

    @property
    @abstractmethod
    def method_name(self) -> ExplanationMethod:
        pass

class BaseGlobalExplainer(ABC):
    """
    Abstract base class for global feature importance explainers.
    """

    @abstractmethod
    def compute_global_importance(
        self,
        model: Any,
        preprocessor: Any,
        feature_names: List[str],
        background_df: Optional[pd.DataFrame] = None
    ) -> List[GlobalImportanceItem]:
        """
        Computes aggregated feature importance scores across features.
        """
        pass

    @property
    @abstractmethod
    def method_name(self) -> ExplanationMethod:
        pass
