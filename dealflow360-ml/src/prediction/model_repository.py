import os
import json
import joblib
from typing import Dict, Any, Optional

class ModelRepository:
    """
    Manages persistence, serialization, and deserialization of trained
    model pipelines and structured metadata.
    """
    
    @staticmethod
    def save_artifacts(
        directory: str,
        best_model: Any,
        preprocessor: Any,
        best_model_name: str,
        best_metrics: Dict[str, Any],
        dataset_info: Dict[str, Any],
        all_evaluations: Dict[str, Any]
    ) -> str:
        os.makedirs(directory, exist_ok=True)
        
        # 1. Save pipeline
        model_path = os.path.join(directory, "best_model.joblib")
        pipeline_data = {
            "model": best_model,
            "preprocessor": preprocessor,
            "feature_names": preprocessor.feature_names_out,
            "model_name": best_model_name
        }
        joblib.dump(pipeline_data, model_path)
        
        # 2. Save metadata.json
        metadata = {
            "model_name": best_model_name,
            "model_version": "1.0.0",
            "trained_at": dataset_info.get("trained_at"),
            "dataset_info": dataset_info,
            "metrics": best_metrics
        }
        meta_path = os.path.join(directory, "metadata.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
            
        # 3. Save evaluation.json
        eval_path = os.path.join(directory, "evaluation.json")
        with open(eval_path, "w", encoding="utf-8") as f:
            json.dump(all_evaluations, f, indent=2)
            
        return model_path

    @staticmethod
    def load_artifacts(directory: str) -> Optional[Dict[str, Any]]:
        model_path = os.path.join(directory, "best_model.joblib")
        meta_path = os.path.join(directory, "metadata.json")
        
        if not os.path.exists(model_path) or not os.path.exists(meta_path):
            return None
            
        pipeline_data = joblib.load(model_path)
        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
            
        return {
            "model": pipeline_data["model"],
            "preprocessor": pipeline_data["preprocessor"],
            "feature_names": pipeline_data.get("feature_names", []),
            "model_name": pipeline_data.get("model_name", "SupervisedClassifier"),
            "metadata": metadata
        }
