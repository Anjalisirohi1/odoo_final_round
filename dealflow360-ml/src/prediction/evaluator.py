import numpy as np
from typing import Dict, Any
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix
)

class ModelEvaluator:
    """
    Computes comprehensive classification metrics for candidate models.
    """
    
    @staticmethod
    def evaluate(model: Any, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        y_pred = model.predict(X_test)
        
        # Probabilities for positive class (1)
        if hasattr(model, "predict_proba"):
            y_proba = model.predict_proba(X_test)[:, 1]
        elif hasattr(model, "decision_function"):
            y_proba = model.decision_function(X_test)
        else:
            y_proba = y_pred
            
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        
        try:
            roc_auc = float(roc_auc_score(y_test, y_proba))
        except Exception:
            roc_auc = 0.5
            
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        return {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "confusion_matrix": cm
        }
