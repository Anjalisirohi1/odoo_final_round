import pytest
import os
import shutil
from src.mlops.training_tracker import TrainingTracker
from src.schemas.mlops import TrainingRunStatus

def test_training_tracker_lifecycle(tmp_path):
    tracker_dir = str(tmp_path / "training_runs")
    tracker = TrainingTracker(tracker_dir=tracker_dir)

    # 1. Start run
    run = tracker.start_run(
        model_name="deal_predictor",
        model_version="1.0.0",
        dataset_version="v1",
        training_samples=500
    )
    assert run.run_id.startswith("run_")
    assert run.status == TrainingRunStatus.STARTED

    # 2. Complete run
    completed = tracker.complete_run(
        run_id=run.run_id,
        candidate_models={"RandomForest": {"roc_auc": 0.85}},
        selected_model="RandomForest",
        metrics={"roc_auc": 0.85},
        artifact_path="/path/to/artifact",
        validation_samples=100
    )
    assert completed.status == TrainingRunStatus.COMPLETED
    assert completed.duration_seconds is not None
    assert completed.selected_model == "RandomForest"

    # 3. List and get runs
    saved_run = tracker.get_run(run.run_id)
    assert saved_run is not None
    assert saved_run.status == TrainingRunStatus.COMPLETED

    all_runs = tracker.list_runs("deal_predictor")
    assert len(all_runs) == 1

def test_training_tracker_fail_run(tmp_path):
    tracker_dir = str(tmp_path / "training_runs")
    tracker = TrainingTracker(tracker_dir=tracker_dir)

    run = tracker.start_run("deal_predictor", "1.0.0")
    failed = tracker.fail_run(run.run_id, "Out of memory error")
    assert failed.status == TrainingRunStatus.FAILED
    assert "Out of memory" in failed.error_message
