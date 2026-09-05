import pandas as pd
from typing import Dict

class DataCleaner:
    def __init__(self):
        pass

    def clean(self, datasets: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """
        Conservatively cleans the datasets:
        - Removes duplicates
        - Trims strings
        - Parses dates where applicable
        """
        cleaned_datasets = {}
        for name, df in datasets.items():
            if df.empty:
                cleaned_datasets[name] = df
                continue
                
            df_clean = df.copy()
            
            # Deduplicate - only use hashable columns to avoid TypeError for dict columns
            hashable_cols = [c for c in df_clean.columns if df_clean[c].apply(lambda x: isinstance(x, dict)).sum() == 0]
            if hashable_cols:
                df_clean = df_clean.drop_duplicates(subset=hashable_cols)
            
            # Trim strings
            str_cols = df_clean.select_dtypes(include=['object', 'string']).columns
            for col in str_cols:
                df_clean[col] = df_clean[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
                
            # Parse dates
            for col in df_clean.columns:
                if 'date' in col.lower() or 'at' in col.lower() or pd.api.types.is_datetime64_any_dtype(df_clean[col]):
                    if not pd.api.types.is_datetime64_any_dtype(df_clean[col]):
                        try:
                            df_clean[col] = pd.to_datetime(df_clean[col], format='ISO8601')
                        except Exception:
                            # Fallback if format is not strict ISO8601
                            try:
                                df_clean[col] = pd.to_datetime(df_clean[col])
                            except Exception:
                                pass
                        
            cleaned_datasets[name] = df_clean
            
        return cleaned_datasets
