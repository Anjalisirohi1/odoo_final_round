import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split

from .preprocessor import PredictionPreprocessor
from .model_factory import ModelFactory
from .evaluator import ModelEvaluator

class ModelTrainer:
    """
    Orchestrates candidate model training, evaluation, comparison,
    and selection of the optimal supervised predictor.
    """
    
    def __init__(
        self,
        test_size: float = 0.20,
        random_state: int = 42,
        selection_metric: str = "roc_auc"
    ):
        self.test_size = test_size
        self.random_state = random_state
        self.selection_metric = selection_metric

    def train_and_evaluate(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        if len(X) < 10:
            raise ValueError(f"Insufficient training samples: got {len(X)}, minimum required is 10.")
            
        # Stratified train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=self.test_size,
            random_state=self.random_state,
            stratify=y if len(np.unique(y)) > 1 else None
        )
        
        # Fit preprocessor
        preprocessor = PredictionPreprocessor()
        X_train_trans = preprocessor.fit_transform(X_train)
        X_test_trans = preprocessor.transform(X_test)
        
        candidates = ModelFactory.get_candidate_models(random_state=self.random_state)
        eval_results = {}
        fitted_models = {}
        
        best_model_name = None
        best_score = -1.0
        
        for name, model in candidates.items():
            model.fit(X_train_trans, y_train)
            metrics = ModelEvaluator.evaluate(model, X_test_trans, y_test.values)
            
            eval_results[name] = metrics
            fitted_models[name] = model
            
            score = metrics.get(self.selection_metric, metrics.get("f1", 0.0))
            if score > best_score:
                best_score = score
                best_model_name = name
                
        best_model = fitted_models[best_model_name]
        best_metrics = eval_results[best_model_name]
        
        dataset_info = {
            "total_samples": len(X),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "positive_class_rate": float(np.mean(y)),
            "feature_count": len(preprocessor.feature_names_out),
            "trained_at": datetime.now(timezone.utc).isoformat()
        }
        
        return {
            "best_model_name": best_model_name,
            "best_model": best_model,
            "preprocessor": preprocessor,
            "evaluation_results": eval_results,
            "best_metrics": best_metrics,
            "feature_names": preprocessor.feature_names_out,
            "dataset_info": dataset_info
        }
