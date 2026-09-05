import pytest
from src.prediction.revenue_forecaster import RevenueForecaster

def test_revenue_forecaster_values():
    forecaster = RevenueForecaster()
    
    res = forecaster.forecast(quotation_value=100000.0, conversion_probability=0.70)
    assert res.quotation_value == 100000.0
    assert res.conversion_probability == 0.70
    assert res.expected_revenue == 70000.0
    
    # Zero probability
    res_zero = forecaster.forecast(quotation_value=50000.0, conversion_probability=0.0)
    assert res_zero.expected_revenue == 0.0
    
    # Zero quotation value
    res_zero_val = forecaster.forecast(quotation_value=0.0, conversion_probability=0.85)
    assert res_zero_val.expected_revenue == 0.0
