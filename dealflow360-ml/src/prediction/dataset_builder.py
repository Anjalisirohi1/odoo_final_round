import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from .target_builder import TargetBuilder
from .feature_builder import PredictionFeatureBuilder

class DatasetBuilder:
    """
    Builds aligned, leakage-safe training datasets (X, y)
    from raw business collections.
    """
    
    def __init__(self):
        self.target_builder = TargetBuilder()
        self.feature_builder = PredictionFeatureBuilder()

    def build_dataset(
        self,
        quotations: List[Dict[str, Any]],
        customers: List[Dict[str, Any]],
        quotation_items: Optional[List[Dict[str, Any]]] = None,
        orders: Optional[List[Dict[str, Any]]] = None,
        deal_events: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[pd.DataFrame, pd.Series]:
        if not quotations:
            return pd.DataFrame(), pd.Series(dtype=int)
            
        customers_map = {c["customer_id"]: c for c in (customers or [])}
        
        items_by_quote = {}
        for item in (quotation_items or []):
            q_id = item.get("quotation_id")
            if q_id:
                items_by_quote.setdefault(q_id, []).append(item)
                
        events_by_quote = {}
        for evt in (deal_events or []):
            q_id = evt.get("quotation_id")
            if q_id:
                events_by_quote.setdefault(q_id, []).append(evt)
                
        orders_by_customer = {}
        for o in (orders or []):
            c_id = o.get("customer_id")
            if c_id:
                orders_by_customer.setdefault(c_id, []).append(o)
                
        quotes_by_customer = {}
        for q in (quotations or []):
            c_id = q.get("customer_id")
            if c_id:
                quotes_by_customer.setdefault(c_id, []).append(q)
                
        # 1. Build features (X)
        X = self.feature_builder.build_features_for_quotations(
            quotations=quotations,
            customers_map=customers_map,
            items_by_quote=items_by_quote,
            orders_by_customer=orders_by_customer,
            quotes_by_customer=quotes_by_customer,
            events_by_quote=events_by_quote
        )
        
        # 2. Build target (y)
        y = self.target_builder.build_targets(quotations, orders)
        
        # Align index
        common_ids = X.index.intersection(y.index)
        X_aligned = X.loc[common_ids]
        y_aligned = y.loc[common_ids]
        
        return X_aligned, y_aligned
