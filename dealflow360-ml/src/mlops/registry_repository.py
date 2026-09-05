import os
import json
from abc import ABC, abstractmethod
from typing import List, Optional
from src.schemas.mlops import ModelRegistryEntry

from src.core.config import settings

class ModelRegistryRepository(ABC):
    @abstractmethod
    def load_entries(self) -> List[ModelRegistryEntry]:
        pass

    @abstractmethod
    def save_entries(self, entries: List[ModelRegistryEntry]) -> None:
        pass

class FileModelRegistryRepository(ModelRegistryRepository):
    def __init__(self, registry_dir: Optional[str] = None, filename: str = "model_registry.json"):
        self.registry_dir = registry_dir or settings.MLOPS_REGISTRY_DIR
        self.file_path = os.path.join(self.registry_dir, filename)

    def load_entries(self) -> List[ModelRegistryEntry]:
        if not os.path.exists(self.file_path):
            return []
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return [ModelRegistryEntry(**item) for item in data]
        except Exception:
            return []

    def save_entries(self, entries: List[ModelRegistryEntry]) -> None:
        os.makedirs(self.registry_dir, exist_ok=True)
        data = [entry.model_dump() for entry in entries]
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
