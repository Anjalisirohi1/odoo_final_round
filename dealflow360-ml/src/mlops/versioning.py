import re
from typing import Tuple

SEMVER_REGEX = re.compile(r"^(\d+)\.(\d+)\.(\d+)$")

class ModelVersioning:
    """
    Deterministic semantic versioning utilities for ML model lifecycle management.
    Formats: MAJOR.MINOR.PATCH (e.g., 1.0.0).
    """

    @staticmethod
    def is_valid_version(version: str) -> bool:
        if not isinstance(version, str):
            return False
        return bool(SEMVER_REGEX.match(version.strip()))

    @staticmethod
    def parse_version(version: str) -> Tuple[int, int, int]:
        match = SEMVER_REGEX.match(version.strip())
        if not match:
            raise ValueError(f"Invalid semantic version string: '{version}'. Expected format 'MAJOR.MINOR.PATCH'.")
        major, minor, patch = match.groups()
        return int(major), int(minor), int(patch)

    @staticmethod
    def increment_major(version: str) -> str:
        major, _, _ = ModelVersioning.parse_version(version)
        return f"{major + 1}.0.0"

    @staticmethod
    def increment_minor(version: str) -> str:
        major, minor, _ = ModelVersioning.parse_version(version)
        return f"{major}.{minor + 1}.0"

    @staticmethod
    def increment_patch(version: str) -> str:
        major, minor, patch = ModelVersioning.parse_version(version)
        return f"{major}.{minor}.{patch + 1}"

    @staticmethod
    def compare_versions(v1: str, v2: str) -> int:
        """
        Returns:
          -1 if v1 < v2
           0 if v1 == v2
           1 if v1 > v2
        """
        p1 = ModelVersioning.parse_version(v1)
        p2 = ModelVersioning.parse_version(v2)

        if p1 < p2:
            return -1
        elif p1 > p2:
            return 1
        return 0
