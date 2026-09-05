import pandas as pd

class TemporalFeatures:
    @staticmethod
    def extract_date_components(df: pd.DataFrame, date_column: str, prefix: str = '') -> pd.DataFrame:
        """
        Extracts year, month, quarter, day_of_week, day_of_month, is_weekend
        from a date column.
        """
        if date_column not in df.columns:
            return df
            
        df_out = df.copy()
        dt = pd.to_datetime(df_out[date_column])
        
        df_out[f'{prefix}year'] = dt.dt.year
        df_out[f'{prefix}month'] = dt.dt.month
        df_out[f'{prefix}quarter'] = dt.dt.quarter
        df_out[f'{prefix}day_of_month'] = dt.dt.day
        df_out[f'{prefix}day_of_week'] = dt.dt.dayofweek
        df_out[f'{prefix}is_weekend'] = dt.dt.dayofweek >= 5
        
        return df_out

    @staticmethod
    def days_between(df: pd.DataFrame, start_col: str, end_col: str, result_col: str) -> pd.DataFrame:
        """
        Calculates days between two date columns.
        """
        if start_col not in df.columns or end_col not in df.columns:
            return df
            
        df_out = df.copy()
        start = pd.to_datetime(df_out[start_col]).dt.tz_localize(None)
        end = pd.to_datetime(df_out[end_col]).dt.tz_localize(None)
        
        df_out[result_col] = (end - start).dt.days
        return df_out
