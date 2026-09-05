import pandas as pd
from src.data.preprocessing.cleaner import DataCleaner

def test_cleaner():
    cleaner = DataCleaner()
    df = pd.DataFrame({
        'name': [' Alice ', 'Bob', ' Alice '],
        'date_col': ['2023-01-01', '2023-01-02', '2023-01-01'],
        'val': [1, 2, 1]
    })
    
    cleaned = cleaner.clean({'test': df})['test']
    
    # Should have removed duplicate 3rd row
    assert len(cleaned) == 2
    
    # Strings should be trimmed
    assert cleaned.iloc[0]['name'] == 'Alice'
    
    # Dates should be parsed (dtype is datetime64)
    assert pd.api.types.is_datetime64_any_dtype(cleaned['date_col'])
