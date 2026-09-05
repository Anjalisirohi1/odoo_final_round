import pandas as pd
import numpy as np
from src.anomaly_detection.preprocessor import AnomalyPreprocessor

def test_preprocessor_fit_transform():
    preprocessor = AnomalyPreprocessor()
    df = pd.DataFrame({
        'discount_percentage': [10.0, 20.0, 30.0],
        'quotation_total_value': [100.0, 200.0, 300.0],
    })
    
    scaled = preprocessor.fit_transform(df)
    assert scaled.shape == (3, len(preprocessor.FEATURE_COLUMNS))
    assert preprocessor.is_fitted
    
    new_df = pd.DataFrame({'discount_percentage': [15.0]})
    scaled_new = preprocessor.transform(new_df)
    assert scaled_new.shape == (1, len(preprocessor.FEATURE_COLUMNS))
