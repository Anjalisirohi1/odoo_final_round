import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

class AnomalyFeatureBuilder:
    """
    Constructs numerical ML features from raw quotations and contextual business data.
    Maintains historical baselines for Customers and Sales Reps.
    """
    
    def __init__(self):
        self.customer_baselines: Dict[str, Dict[str, float]] = {}
        self.rep_baselines: Dict[str, Dict[str, float]] = {}
        self.global_baselines: Dict[str, float] = {
            'avg_discount_pct': 0.0,
            'avg_margin_pct': 0.0,
            'avg_deal_value': 0.0,
            'deal_count': 0.0
        }

    def _calculate_discount_pct(self, total_amount: float, total_discount: float) -> float:
        original_value = total_amount + total_discount
        if original_value > 0:
            return (total_discount / original_value) * 100.0
        return 0.0

    def _calculate_margin_pct(self, total_amount: float, total_margin: float) -> float:
        if total_amount > 0:
            return (total_margin / total_amount) * 100.0
        return 0.0

    def fit_baselines(self, quotations_df: pd.DataFrame):
        """
        Calculate historical averages for customers and sales reps.
        """
        if quotations_df.empty:
            return

        df = quotations_df.copy()
        
        # Calculate derived metrics for baselines
        df['discount_pct'] = df.apply(
            lambda row: self._calculate_discount_pct(row.get('total_amount', 0), row.get('total_discount', 0)), 
            axis=1
        )
        df['margin_pct'] = df.apply(
            lambda row: self._calculate_margin_pct(row.get('total_amount', 0), row.get('total_margin', 0)), 
            axis=1
        )

        # Global baselines
        self.global_baselines['avg_discount_pct'] = df['discount_pct'].mean()
        self.global_baselines['avg_margin_pct'] = df['margin_pct'].mean()
        self.global_baselines['avg_deal_value'] = df['total_amount'].mean()

        # Customer baselines
        for cust_id, group in df.groupby('customer_id'):
            self.customer_baselines[cust_id] = {
                'avg_discount_pct': group['discount_pct'].mean(),
                'avg_margin_pct': group['margin_pct'].mean(),
                'avg_deal_value': group['total_amount'].mean(),
                'deal_count': float(len(group))
            }
            
        # Sales Rep baselines
        for rep_id, group in df.groupby('sales_rep_id'):
            self.rep_baselines[rep_id] = {
                'avg_discount_pct': group['discount_pct'].mean(),
                'avg_margin_pct': group['margin_pct'].mean(),
                'avg_deal_value': group['total_amount'].mean(),
                'deal_count': float(len(group))
            }

    def build_features(self, quotations: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Convert a list of quotation dictionaries into an ML-ready feature matrix.
        Assumes quotations contain: quotation_id, customer_id, sales_rep_id, total_amount, total_discount, total_margin.
        """
        features_list = []
        
        for quote in quotations:
            q_id = quote.get('quotation_id', 'unknown')
            c_id = quote.get('customer_id', 'unknown')
            r_id = quote.get('sales_rep_id', 'unknown')
            
            amount = float(quote.get('total_amount', 0.0))
            discount = float(quote.get('total_discount', 0.0))
            margin = float(quote.get('total_margin', 0.0))

            discount_pct = self._calculate_discount_pct(amount, discount)
            margin_pct = self._calculate_margin_pct(amount, margin)
            
            # Contextual baselines
            c_base = self.customer_baselines.get(c_id, self.global_baselines)
            r_base = self.rep_baselines.get(r_id, self.global_baselines)

            # Deviations
            c_discount_dev = discount_pct - c_base['avg_discount_pct']
            r_discount_dev = discount_pct - r_base['avg_discount_pct']
            
            # Safe log value (using log1p to avoid log(0))
            log_amount = np.log1p(amount)
            
            # Margin risk (Discount to Margin Ratio)
            discount_margin_ratio = discount_pct / margin_pct if margin_pct > 0 else (discount_pct if discount_pct > 0 else 0)

            features_list.append({
                'quotation_id': q_id,
                'discount_percentage': discount_pct,
                'quotation_total_value': amount,
                'log_quotation_value': log_amount,
                'margin_percentage': margin_pct,
                'discount_to_margin_ratio': discount_margin_ratio,
                
                # Contextual Baselines
                'customer_avg_discount': c_base['avg_discount_pct'],
                'rep_avg_discount': r_base['avg_discount_pct'],
                
                # Deviations
                'discount_customer_deviation': c_discount_dev,
                'discount_rep_deviation': r_discount_dev,
                
                # Deal counts
                'customer_deal_count': c_base.get('deal_count', 0.0),
                'rep_deal_count': r_base.get('deal_count', 0.0)
            })
            
        return pd.DataFrame(features_list)
