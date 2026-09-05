import pytest
from src.mlops.model_registry import ModelRegistry
from src.mlops.registry_repository import ModelRegistryRepository
from src.schemas.mlops import ModelRegistryEntry, ModelStatus

class InMemoryRegistryRepo(ModelRegistryRepository):
    def __init__(self):
        self.entries = []
    def load_entries(self):
        return list(self.entries)
    def save_entries(self, entries):
        self.entries = list(entries)

def test_model_registry_lifecycle():
    repo = InMemoryRegistryRepo()
    registry = ModelRegistry(repository=repo)

    # 1. Register v1.0.0 as Active
    entry_v1 = ModelRegistryEntry(
        model_name="deal_predictor",
        model_version="1.0.0",
        status=ModelStatus.ACTIVE,
        created_at="2026-09-01T10:00:00Z",
        metrics={"roc_auc": 0.82},
        is_active=True
    )
    registry.register_model(entry_v1)
    
    active = registry.get_active_model("deal_predictor")
    assert active is not None
    assert active.model_version == "1.0.0"
    assert active.is_active is True

    # 2. Prevent duplicate version
    with pytest.raises(ValueError, match="already registered"):
        registry.register_model(entry_v1)

    # 3. Register v1.1.0 as Candidate
    entry_v2 = ModelRegistryEntry(
        model_name="deal_predictor",
        model_version="1.1.0",
        status=ModelStatus.CANDIDATE,
        created_at="2026-09-02T10:00:00Z",
        metrics={"roc_auc": 0.86},
        is_active=False
    )
    registry.register_model(entry_v2)

    # Active model remains v1.0.0
    active = registry.get_active_model("deal_predictor")
    assert active.model_version == "1.0.0"

    # 4. Explicitly activate v1.1.0
    activated, previous = registry.activate_model("deal_predictor", "1.1.0")
    assert activated.model_version == "1.1.0"
    assert activated.status == ModelStatus.ACTIVE
    assert activated.is_active is True
    assert previous.model_version == "1.0.0"
    assert previous.status == ModelStatus.ARCHIVED
    assert previous.is_active is False

    # Check updated active
    assert registry.get_active_model("deal_predictor").model_version == "1.1.0"

def test_activate_nonexistent_model():
    repo = InMemoryRegistryRepo()
    registry = ModelRegistry(repository=repo)
    with pytest.raises(ValueError, match="not found"):
        registry.activate_model("deal_predictor", "9.9.9")
