import sys
import os

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_ML_DIR = os.path.join(_BASE_DIR, "dealflow360-ml")
_SRC_DIR = os.path.join(_ML_DIR, "src")

if _ML_DIR not in sys.path:
    sys.path.insert(0, _ML_DIR)

if os.path.exists(_SRC_DIR) and _SRC_DIR not in __path__:
    __path__.insert(0, _SRC_DIR)
