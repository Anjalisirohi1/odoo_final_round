import pytest
import os
import shutil
import numpy as np
from sklearn.linear_model import LogisticRegression
from src.prediction.preprocessor import PredictionPreprocessor
from src.prediction.model_repository import ModelRepository

def test_model_repository_save_load(tmp_path):
    test_dir = str(tmp_path / "model_artifacts")
    
    # Train dummy model & preprocessor
    clf = LogisticRegression()
    X = np.array([[1.0, 2.0], [2.0, 3.0], [5.0, 6.0], [7.0, 8.0]])
    y = np.array([0, 0, 1, 1])
    clf.fit(X, y)
    
    preprocessor = PredictionPreprocessor(numeric_features=["f1", "f2"], categorical_features=[])
    
    saved_path = ModelRepository.save_artifacts(
        directory=test_dir,
        best_model=clf,
        preprocessor=preprocessor,
        best_model_name="LogisticRegression",
        best_metrics={"roc_auc": 0.95, "f1": 0.92},
        dataset_info={"total_samples": 4, "trained_at": "2026-09-05T00:00:00Z"},
        all_evaluations={"LogisticRegression": {"roc_auc": 0.95}}
    )
    
    assert os.path.exists(saved_path)
    
    loaded = ModelRepository.load_artifacts(test_dir)
    assert loaded is not None
    assert loaded["model_name"] == "LogisticRegression"
    assert loaded["metadata"]["metrics"]["roc_auc"] == 0.95
    assert hasattr(loaded["model"], "predict")

def test_model_repository_missing_dir(tmp_path):
    missing_dir = str(tmp_path / "nonexistent")
    loaded = ModelRepository.load_artifacts(missing_dir)
    assert loaded is None
