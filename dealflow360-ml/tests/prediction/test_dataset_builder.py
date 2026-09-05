import pytest
from src.prediction.dataset_builder import DatasetBuilder

def test_dataset_builder_alignment():
    builder = DatasetBuilder()
    quotations = [
        {"quotation_id": "q1", "customer_id": "c1", "status": "CONVERTED", "total_amount": 500.0},
        {"quotation_id": "q2", "customer_id": "c2", "status": "REJECTED", "total_amount": 200.0}
    ]
    customers = [
        {"customer_id": "c1", "customer_tier": "PLATINUM"},
        {"customer_id": "c2", "customer_tier": "SILVER"}
    ]
    
    X, y = builder.build_dataset(quotations=quotations, customers=customers)
    
    assert len(X) == 2
    assert len(y) == 2
    assert list(X.index) == list(y.index)
    assert y["q1"] == 1
    assert y["q2"] == 0
