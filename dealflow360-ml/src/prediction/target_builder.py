import pandas as pd
from typing import List, Dict, Any, Optional

class TargetBuilder:
    """
    Constructs the binary classification ground truth target:
    quotation_converted:
    1 = quotation converted to order / status is 'CONVERTED'
    0 = quotation rejected / expired / lost
    """
    
    def build_targets(
        self,
        quotations: List[Dict[str, Any]],
        orders: Optional[List[Dict[str, Any]]] = None
    ) -> pd.Series:
        if not quotations:
            return pd.Series(dtype=int)
            
        converted_quote_ids = set()
        if orders:
            for o in orders:
                q_id = o.get("quotation_id")
                if q_id:
                    converted_quote_ids.add(q_id)
                    
        targets = {}
        for q in quotations:
            q_id = q.get("quotation_id")
            if not q_id:
                continue
                
            status = str(q.get("status", "")).upper()
            is_converted = 1 if (status == "CONVERTED" or q_id in converted_quote_ids) else 0
            targets[q_id] = is_converted
            
        return pd.Series(targets, name="quotation_converted")
