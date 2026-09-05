import pytest
from src.mlops.artifact_integrity import ArtifactIntegrity

def test_artifact_integrity_checksum(tmp_path):
    artifact_file = tmp_path / "model.joblib"
    artifact_file.write_bytes(b"dummy model artifact bytes")

    checksum = ArtifactIntegrity.compute_checksum(str(artifact_file))
    assert checksum is not None
    assert len(checksum) == 64

    # Verify checksum matches
    assert ArtifactIntegrity.verify_checksum(str(artifact_file), checksum) is True
    assert ArtifactIntegrity.verify_checksum(str(artifact_file), "invalid_checksum") is False
