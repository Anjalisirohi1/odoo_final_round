import os
import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from src.schemas.mlops import TrainingRun, TrainingRunStatus
from src.core.config import settings

class TrainingTracker:
    """
    Tracks, records, and persists offline ML training experiments, candidate model
    comparisons, evaluation metrics, and artifacts.
    """

    def __init__(self, tracker_dir: Optional[str] = None):
        self.tracker_dir = tracker_dir or settings.MLOPS_TRAINING_RUNS_DIR

    def _get_run_path(self, run_id: str) -> str:
        return os.path.join(self.tracker_dir, f"{run_id}.json")

    def start_run(
        self,
        model_name: str,
        model_version: str,
        dataset_version: Optional[str] = None,
        training_samples: Optional[int] = None,
        features: Optional[List[str]] = None
    ) -> TrainingRun:
        os.makedirs(self.tracker_dir, exist_ok=True)
        now_utc = datetime.now(timezone.utc)
        run_id = f"run_{now_utc.strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"

        run = TrainingRun(
            run_id=run_id,
            model_name=model_name,
            model_version=model_version,
            started_at=now_utc.isoformat(),
            status=TrainingRunStatus.STARTED,
            dataset_version=dataset_version,
            training_samples=training_samples,
            features=features or []
        )

        with open(self._get_run_path(run_id), "w", encoding="utf-8") as f:
            json.dump(run.model_dump(), f, indent=2)

        return run

    def complete_run(
        self,
        run_id: str,
        candidate_models: Dict[str, Any],
        selected_model: str,
        metrics: Dict[str, Any],
        artifact_path: str,
        validation_samples: Optional[int] = None
    ) -> TrainingRun:
        run = self.get_run(run_id)
        if not run:
            raise ValueError(f"Training run '{run_id}' not found.")

        completed_at = datetime.now(timezone.utc)
        start_dt = datetime.fromisoformat(run.started_at)
        duration = round((completed_at - start_dt).total_seconds(), 2)

        run.completed_at = completed_at.isoformat()
        run.status = TrainingRunStatus.COMPLETED
        run.candidate_models = candidate_models
        run.selected_model = selected_model
        run.metrics = metrics
        run.artifact_path = artifact_path
        run.validation_samples = validation_samples
        run.duration_seconds = duration

        with open(self._get_run_path(run_id), "w", encoding="utf-8") as f:
            json.dump(run.model_dump(), f, indent=2)

        return run

    def fail_run(self, run_id: str, error_message: str) -> TrainingRun:
        run = self.get_run(run_id)
        if not run:
            raise ValueError(f"Training run '{run_id}' not found.")

        completed_at = datetime.now(timezone.utc)
        start_dt = datetime.fromisoformat(run.started_at)
        duration = round((completed_at - start_dt).total_seconds(), 2)

        run.completed_at = completed_at.isoformat()
        run.status = TrainingRunStatus.FAILED
        run.error_message = error_message
        run.duration_seconds = duration

        with open(self._get_run_path(run_id), "w", encoding="utf-8") as f:
            json.dump(run.model_dump(), f, indent=2)

        return run

    def get_run(self, run_id: str) -> Optional[TrainingRun]:
        path = self._get_run_path(run_id)
        if not os.path.exists(path):
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return TrainingRun(**data)
        except Exception:
            return None

    def list_runs(self, model_name: Optional[str] = None) -> List[TrainingRun]:
        if not os.path.exists(self.tracker_dir):
            return []
        runs = []
        for fname in os.listdir(self.tracker_dir):
            if fname.endswith(".json"):
                path = os.path.join(self.tracker_dir, fname)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    run = TrainingRun(**data)
                    if model_name is None or run.model_name == model_name:
                        runs.append(run)
                except Exception:
                    continue
        # Sort newest first
        return sorted(runs, key=lambda r: r.started_at, reverse=True)
