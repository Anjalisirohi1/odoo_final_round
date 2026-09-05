import pytest
from src.mlops.versioning import ModelVersioning

def test_parse_and_validate_version():
    assert ModelVersioning.is_valid_version("1.0.0") is True
    assert ModelVersioning.is_valid_version("2.14.3") is True
    assert ModelVersioning.is_valid_version("v1.0.0") is False
    assert ModelVersioning.is_valid_version("invalid") is False

    major, minor, patch = ModelVersioning.parse_version("3.2.1")
    assert major == 3
    assert minor == 2
    assert patch == 1

def test_increment_versions():
    assert ModelVersioning.increment_major("1.2.3") == "2.0.0"
    assert ModelVersioning.increment_minor("1.2.3") == "1.3.0"
    assert ModelVersioning.increment_patch("1.2.3") == "1.2.4"

def test_compare_versions():
    assert ModelVersioning.compare_versions("1.0.0", "1.1.0") == -1
    assert ModelVersioning.compare_versions("2.0.0", "1.9.9") == 1
    assert ModelVersioning.compare_versions("1.5.2", "1.5.2") == 0

def test_invalid_version_error():
    with pytest.raises(ValueError, match="Invalid semantic version"):
        ModelVersioning.parse_version("beta-1")
