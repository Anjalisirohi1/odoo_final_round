import logging
from typing import List, Optional, Tuple
from datetime import datetime, timezone

from src.schemas.mlops import ModelRegistryEntry, ModelStatus
from .registry_repository import ModelRegistryRepository, FileModelRegistryRepository
from .versioning import ModelVersioning

logger = logging.getLogger(__name__)

class ModelRegistry:
    """
    Lightweight, deterministic local model registry for model lifecycle governance,
    metadata tracking, versioning, and explicit champion promotion.
    """

    def __init__(self, repository: Optional[ModelRegistryRepository] = None):
        self.repository = repository or FileModelRegistryRepository()

    def register_model(self, entry: ModelRegistryEntry) -> ModelRegistryEntry:
        """
        Registers a new model version into the registry.
        Ensures strict version uniqueness per model_name and enforces single-active model policy.
        """
        if not ModelVersioning.is_valid_version(entry.model_version):
            raise ValueError(f"Invalid model version '{entry.model_version}'. Must follow MAJOR.MINOR.PATCH.")

        entries = self.repository.load_entries()

        # Check duplicate
        for e in entries:
            if e.model_name == entry.model_name and e.model_version == entry.model_version:
                raise ValueError(f"Model '{entry.model_name}' version '{entry.model_version}' is already registered.")

        # If incoming model is marked ACTIVE, archive previous active version
        if entry.is_active or entry.status == ModelStatus.ACTIVE:
            entry.is_active = True
            entry.status = ModelStatus.ACTIVE
            for e in entries:
                if e.model_name == entry.model_name and e.is_active:
                    e.is_active = False
                    e.status = ModelStatus.ARCHIVED

        entries.append(entry)
        self.repository.save_entries(entries)
        logger.info(f"Registered model {entry.model_name} v{entry.model_version} (status={entry.status.value}).")
        return entry

    def get_model(self, model_name: str, version: str) -> Optional[ModelRegistryEntry]:
        entries = self.repository.load_entries()
        for e in entries:
            if e.model_name == model_name and e.model_version == version:
                return e
        return None

    def get_active_model(self, model_name: str) -> Optional[ModelRegistryEntry]:
        entries = self.repository.load_entries()
        for e in entries:
            if e.model_name == model_name and (e.is_active or e.status == ModelStatus.ACTIVE):
                return e
        return None

    def list_models(self, model_name: Optional[str] = None) -> List[ModelRegistryEntry]:
        entries = self.repository.load_entries()
        if model_name:
            return [e for e in entries if e.model_name == model_name]
        return entries

    def activate_model(self, model_name: str, version: str) -> Tuple[ModelRegistryEntry, Optional[ModelRegistryEntry]]:
        """
        Explicitly activates/promotes a candidate or archived model to ACTIVE status.
        Transitions previously active model to ARCHIVED.
        """
        entries = self.repository.load_entries()
        target_entry = None
        previous_active = None

        for e in entries:
            if e.model_name == model_name:
                if e.model_version == version:
                    target_entry = e
                elif e.is_active or e.status == ModelStatus.ACTIVE:
                    previous_active = e

        if target_entry is None:
            raise ValueError(f"Model '{model_name}' version '{version}' not found in registry.")

        if target_entry.status == ModelStatus.DEPRECATED:
            raise ValueError(f"Cannot activate deprecated model '{model_name}' v{version}.")

        # Archive previous active
        if previous_active is not None:
            previous_active.is_active = False
            previous_active.status = ModelStatus.ARCHIVED

        # Promote target
        target_entry.is_active = True
        target_entry.status = ModelStatus.ACTIVE

        self.repository.save_entries(entries)
        logger.info(f"Activated model {model_name} v{version}. Previous active v{getattr(previous_active, 'model_version', None)} archived.")
        return target_entry, previous_active

    def deprecate_model(self, model_name: str, version: str) -> ModelRegistryEntry:
        entries = self.repository.load_entries()
        target_entry = None
        for e in entries:
            if e.model_name == model_name and e.model_version == version:
                target_entry = e
                break

        if target_entry is None:
            raise ValueError(f"Model '{model_name}' version '{version}' not found in registry.")

        target_entry.is_active = False
        target_entry.status = ModelStatus.DEPRECATED
        self.repository.save_entries(entries)
        logger.info(f"Deprecated model {model_name} v{version}.")
        return target_entry
