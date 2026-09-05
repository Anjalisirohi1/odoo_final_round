import os
import hashlib
from typing import Optional

class ArtifactIntegrity:
    """
    Computes and validates cryptographic SHA-256 checksums for serialized model artifacts.
    """

    @staticmethod
    def compute_checksum(file_path: str) -> Optional[str]:
        if not os.path.exists(file_path):
            return None
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @staticmethod
    def verify_checksum(file_path: str, expected_checksum: str) -> bool:
        actual = ArtifactIntegrity.compute_checksum(file_path)
        if actual is None or not expected_checksum:
            return False
        return actual.strip().lower() == expected_checksum.strip().lower()
