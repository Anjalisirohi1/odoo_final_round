from typing import Dict, Any
from sklearn.base import BaseEstimator
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

class ModelFactory:
    """
    Constructs candidate supervised classification models with deterministic random states.
    """
    
    @staticmethod
    def get_candidate_models(random_state: int = 42) -> Dict[str, BaseEstimator]:
        return {
            "LogisticRegression": LogisticRegression(
                max_iter=1000,
                random_state=random_state,
                class_weight="balanced"
            ),
            "RandomForest": RandomForestClassifier(
                n_estimators=100,
                max_depth=6,
                random_state=random_state,
                class_weight="balanced"
            ),
            "GradientBoosting": GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=3,
                random_state=random_state
            )
        }
