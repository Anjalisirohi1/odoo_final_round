import pandas as pd
from sklearn.preprocessing import StandardScaler
from typing import List

class AnomalyPreprocessor:
    """
    Handles scaling, imputation, and feature ordering for the Anomaly Detection Engine.
    Only numerical features are processed and fed into the model.
    """
    
    # Define the exact features and order that the model expects.
    FEATURE_COLUMNS: List[str] = [
        'discount_percentage',
        'quotation_total_value',
        'log_quotation_value',
        'margin_percentage',
        'discount_to_margin_ratio',
        'customer_avg_discount',
        'rep_avg_discount',
        'discount_customer_deviation',
        'discount_rep_deviation',
        'customer_deal_count',
        'rep_deal_count'
    ]

    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False

    def _prepare_df(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Selects only the required feature columns and handles missing values.
        """
        if df.empty:
            return pd.DataFrame(columns=self.FEATURE_COLUMNS)

        # Ensure all required columns exist, filling missing with 0.0
        prepared_df = df.reindex(columns=self.FEATURE_COLUMNS, fill_value=0.0)
        
        # Fill any internal NaNs with 0.0 (graceful fallback)
        prepared_df = prepared_df.fillna(0.0)
        
        return prepared_df

    def fit_transform(self, features_df: pd.DataFrame) -> pd.DataFrame:
        """
        Fit the scaler on historical training data and return the scaled features.
        """
        prepared_df = self._prepare_df(features_df)
        
        if not prepared_df.empty:
            scaled_data = self.scaler.fit_transform(prepared_df)
            self.is_fitted = True
            return pd.DataFrame(scaled_data, columns=self.FEATURE_COLUMNS, index=features_df.index)
        
        return prepared_df

    def transform(self, features_df: pd.DataFrame) -> pd.DataFrame:
        """
        Scale new inference data using the already fitted scaler.
        """
        if not self.is_fitted:
            raise ValueError("AnomalyPreprocessor must be fitted before calling transform().")
            
        prepared_df = self._prepare_df(features_df)
        
        if not prepared_df.empty:
            scaled_data = self.scaler.transform(prepared_df)
            return pd.DataFrame(scaled_data, columns=self.FEATURE_COLUMNS, index=features_df.index)
            
        return prepared_df
