import pandas as pd
import numpy as np
from typing import List, Tuple
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from .feature_builder import PredictionFeatureBuilder

class PredictionPreprocessor:
    """
    Unified feature preprocessing pipeline using scikit-learn ColumnTransformer.
    Ensures 100% parity between training and real-time inference transformations.
    """
    
    def __init__(
        self,
        numeric_features: List[str] = None,
        categorical_features: List[str] = None
    ):
        self.numeric_features = numeric_features or PredictionFeatureBuilder.NUMERIC_FEATURES
        self.categorical_features = categorical_features or PredictionFeatureBuilder.CATEGORICAL_FEATURES
        
        # Pipelines
        numeric_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ])
        
        categorical_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        ])
        
        self.transformer = ColumnTransformer(
            transformers=[
                ("num", numeric_pipeline, self.numeric_features),
                ("cat", categorical_pipeline, self.categorical_features)
            ],
            remainder="drop"
        )
        self.is_fitted = False
        self.feature_names_out: List[str] = []

    def fit(self, X: pd.DataFrame):
        self.transformer.fit(X)
        self.is_fitted = True
        self._extract_feature_names()
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("PredictionPreprocessor must be fitted before transforming.")
        return self.transformer.transform(X)

    def fit_transform(self, X: pd.DataFrame) -> np.ndarray:
        result = self.transformer.fit_transform(X)
        self.is_fitted = True
        self._extract_feature_names()
        return result

    def _extract_feature_names(self):
        try:
            self.feature_names_out = list(self.transformer.get_feature_names_out())
        except Exception:
            self.feature_names_out = self.numeric_features.copy()
