import pytest
import pandas as pd
from src.prediction.target_builder import TargetBuilder

def test_target_builder_status_converted():
    builder = TargetBuilder()
    quotations = [
        {"quotation_id": "q1", "status": "CONVERTED"},
        {"quotation_id": "q2", "status": "REJECTED"},
        {"quotation_id": "q3", "status": "EXPIRED"}
    ]
    targets = builder.build_targets(quotations)
    assert len(targets) == 3
    assert targets["q1"] == 1
    assert targets["q2"] == 0
    assert targets["q3"] == 0

def test_target_builder_order_lookup():
    builder = TargetBuilder()
    quotations = [
        {"quotation_id": "q1", "status": "PENDING"},
        {"quotation_id": "q2", "status": "PENDING"}
    ]
    orders = [{"order_id": "o1", "quotation_id": "q1"}]
    targets = builder.build_targets(quotations, orders)
    assert targets["q1"] == 1
    assert targets["q2"] == 0

def test_target_builder_empty():
    builder = TargetBuilder()
    targets = builder.build_targets([])
    assert targets.empty
