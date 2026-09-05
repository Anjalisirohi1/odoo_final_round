import pandas as pd
from src.data.validation.data_validator import DataValidator

def test_data_validator_valid():
    validator = DataValidator()
    df_products = pd.DataFrame([{'selling_price': 100, 'cost_price': 50}])
    df_qi = pd.DataFrame([{'quantity': 2, 'discount_percentage': 10}])
    report = validator.validate({'products': df_products, 'quotation_items': df_qi})
    assert report['valid'] is True
    assert len(report['errors']) == 0

def test_data_validator_invalid_business_rules():
    validator = DataValidator()
    df_products = pd.DataFrame([{'selling_price': 40, 'cost_price': 50}])
    df_qi = pd.DataFrame([{'quantity': 0, 'discount_percentage': 110}])
    report = validator.validate({'products': df_products, 'quotation_items': df_qi})
    assert report['valid'] is False
    assert len(report['errors']) >= 3

def test_data_validator_referential_integrity():
    validator = DataValidator()
    df_q = pd.DataFrame([{'quotation_id': 'q1', 'customer_id': 'c2'}]) # c2 doesn't exist
    df_c = pd.DataFrame([{'customer_id': 'c1'}])
    report = validator.validate({'quotations': df_q, 'customers': df_c})
    assert report['valid'] is False
    assert any("reference non-existent" in err for err in report['errors'])
