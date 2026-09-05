import pandas as pd
from src.features.temporal_features import TemporalFeatures

def test_extract_date_components():
    df = pd.DataFrame({'date': ['2023-01-15', '2023-02-25']})
    df_out = TemporalFeatures.extract_date_components(df, 'date')
    
    assert df_out['year'].tolist() == [2023, 2023]
    assert df_out['month'].tolist() == [1, 2]
    assert df_out['day_of_month'].tolist() == [15, 25]

def test_days_between():
    df = pd.DataFrame({
        'start': ['2023-01-01', '2023-01-01'],
        'end': ['2023-01-10', '2023-02-01']
    })
    df_out = TemporalFeatures.days_between(df, 'start', 'end', 'diff')
    assert df_out['diff'].tolist() == [9, 31]
