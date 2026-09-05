import os
import json
from abc import ABC, abstractmethod
from typing import List, Optional
from src.schemas.mlops import PredictionObservation
from src.core.config import settings

class PredictionObservationRepository(ABC):
    @abstractmethod
    def append_observation(self, obs: PredictionObservation) -> None:
        pass

    @abstractmethod
    def get_observation(self, prediction_id: str) -> Optional[PredictionObservation]:
        pass

    @abstractmethod
    def get_observation_by_quotation(self, quotation_id: str) -> Optional[PredictionObservation]:
        pass

    @abstractmethod
    def list_observations(self, model_name: Optional[str] = None, limit: Optional[int] = None) -> List[PredictionObservation]:
        pass

    @abstractmethod
    def update_observation(self, obs: PredictionObservation) -> bool:
        pass

class FilePredictionObservationRepository(PredictionObservationRepository):
    """
    JSON Lines implementation of PredictionObservationRepository for local file logging.
    """
    def __init__(self, logs_dir: Optional[str] = None, filename: str = "predictions.jsonl"):
        self.logs_dir = logs_dir or settings.MLOPS_PREDICTION_LOGS_DIR
        self.file_path = os.path.join(self.logs_dir, filename)

    def append_observation(self, obs: PredictionObservation) -> None:
        os.makedirs(self.logs_dir, exist_ok=True)
        with open(self.file_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(obs.model_dump()) + "\n")

    def get_observation(self, prediction_id: str) -> Optional[PredictionObservation]:
        if not os.path.exists(self.file_path):
            return None
        with open(self.file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    if data.get("prediction_id") == prediction_id:
                        return PredictionObservation(**data)
                except Exception:
                    continue
        return None

    def get_observation_by_quotation(self, quotation_id: str) -> Optional[PredictionObservation]:
        if not os.path.exists(self.file_path):
            return None
        latest = None
        with open(self.file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    if data.get("quotation_id") == quotation_id:
                        latest = PredictionObservation(**data)
                except Exception:
                    continue
        return latest

    def list_observations(self, model_name: Optional[str] = None, limit: Optional[int] = None) -> List[PredictionObservation]:
        if not os.path.exists(self.file_path):
            return []
        records = []
        with open(self.file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    obs = PredictionObservation(**data)
                    if model_name is None or obs.model_name == model_name:
                        records.append(obs)
                except Exception:
                    continue

        # Return most recent observations first if limit is set
        if limit is not None:
            return records[-limit:]
        return records

    def update_observation(self, obs: PredictionObservation) -> bool:
        if not os.path.exists(self.file_path):
            return False

        updated = False
        all_lines = []
        with open(self.file_path, "r", encoding="utf-8") as f:
            for line in f:
                line_str = line.strip()
                if not line_str:
                    continue
                try:
                    data = json.loads(line_str)
                    if data.get("prediction_id") == obs.prediction_id:
                        all_lines.append(json.dumps(obs.model_dump()) + "\n")
                        updated = True
                    else:
                        all_lines.append(line)
                except Exception:
                    all_lines.append(line)

        if updated:
            with open(self.file_path, "w", encoding="utf-8") as f:
                f.writelines(all_lines)

        return updated
