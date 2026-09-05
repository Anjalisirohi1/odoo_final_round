import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

EARLY_EVENT_TYPES = {
    "QUOTE_CREATED", "PRODUCT_ADDED", "DISCOUNT_APPLIED",
    "QUOTE_SENT", "CUSTOMER_VIEWED", "COUNTER_OFFER"
}

CUSTOMER_INTERACTION_EVENTS = {
    "CUSTOMER_VIEWED", "COUNTER_OFFER", "QUOTE_REVISED"
}

class PredictionFeatureBuilder:
    """
    Constructs supervised machine learning features strictly available
    at quotation prediction time. Enforces zero data leakage.
    """
    
    NUMERIC_FEATURES = [
        "quotation_value",
        "log_quotation_value",
        "discount_percentage",
        "margin_percentage",
        "discount_to_margin_ratio",
        "product_count",
        "total_quantity",
        "customer_historical_conversion_rate",
        "customer_total_prior_quotes",
        "customer_total_prior_orders",
        "customer_account_age_days",
        "quote_creation_day_of_week",
        "quote_creation_month",
        "early_event_count",
        "customer_interaction_count"
    ]
    
    CATEGORICAL_FEATURES = [
        "customer_tier",
        "customer_industry",
        "customer_region"
    ]

    def _calculate_discount_pct(self, total_amount: float, total_discount: float) -> float:
        original_value = total_amount + total_discount
        if original_value > 0:
            return (total_discount / original_value) * 100.0
        return 0.0

    def _calculate_margin_pct(self, total_amount: float, total_margin: float) -> float:
        if total_amount > 0:
            return (total_margin / total_amount) * 100.0
        return 0.0

    def build_features_for_quotations(
        self,
        quotations: List[Dict[str, Any]],
        customers_map: Dict[str, Dict[str, Any]],
        items_by_quote: Dict[str, List[Dict[str, Any]]],
        orders_by_customer: Dict[str, List[Dict[str, Any]]],
        quotes_by_customer: Dict[str, List[Dict[str, Any]]],
        events_by_quote: Dict[str, List[Dict[str, Any]]],
        custom_now: Optional[datetime] = None
    ) -> pd.DataFrame:
        """
        Extracts leakage-safe feature records for a batch of quotations.
        """
        now = custom_now or datetime.now(timezone.utc)
        records = []
        
        for q in quotations:
            q_id = q.get("quotation_id", "unknown")
            c_id = q.get("customer_id")
            
            customer = customers_map.get(c_id, {})
            items = items_by_quote.get(q_id, [])
            events = events_by_quote.get(q_id, [])
            
            total_amount = float(q.get("total_amount", 0.0))
            total_discount = float(q.get("total_discount", 0.0))
            total_margin = float(q.get("total_margin", 0.0))
            
            discount_pct = self._calculate_discount_pct(total_amount, total_discount)
            margin_pct = self._calculate_margin_pct(total_amount, total_margin)
            
            if margin_pct > 0:
                discount_to_margin_ratio = discount_pct / margin_pct
            else:
                discount_to_margin_ratio = 5.0 if discount_pct > 0 else 0.0
                
            product_count = len(items)
            total_quantity = sum(int(item.get("quantity", 1)) for item in items) if items else 1
            
            # Customer history prior to this quote
            cust_orders = orders_by_customer.get(c_id, [])
            cust_quotes = quotes_by_customer.get(c_id, [])
            
            total_prior_orders = len(cust_orders)
            total_prior_quotes = len(cust_quotes)
            
            if total_prior_quotes > 0:
                cust_conv_rate = total_prior_orders / total_prior_quotes
            else:
                # Cold-start tier prior
                tier = str(customer.get("customer_tier", "BRONZE")).upper()
                tier_priors = {"PLATINUM": 0.60, "GOLD": 0.50, "SILVER": 0.40, "BRONZE": 0.30}
                cust_conv_rate = tier_priors.get(tier, 0.40)
                
            # Customer account age
            created_at_dt = customer.get("created_at")
            if created_at_dt:
                if isinstance(created_at_dt, str):
                    created_at_dt = pd.to_datetime(created_at_dt).to_pydatetime()
                if created_at_dt.tzinfo is None:
                    created_at_dt = created_at_dt.replace(tzinfo=timezone.utc)
                if now.tzinfo is None:
                    now = now.replace(tzinfo=timezone.utc)
                account_age_days = max(0, (now - created_at_dt).days)
            else:
                account_age_days = 365
                
            # Quotation creation date components
            q_created = q.get("created_at")
            if q_created:
                if isinstance(q_created, str):
                    q_created = pd.to_datetime(q_created).to_pydatetime()
                day_of_week = q_created.weekday()
                month = q_created.month
            else:
                day_of_week = 0
                month = 1
                
            # Early events
            early_events = [e for e in events if e.get("event_type") in EARLY_EVENT_TYPES]
            interaction_events = [e for e in events if e.get("event_type") in CUSTOMER_INTERACTION_EVENTS]
            
            records.append({
                "quotation_id": q_id,
                # Numerical Features
                "quotation_value": total_amount,
                "log_quotation_value": np.log1p(total_amount),
                "discount_percentage": discount_pct,
                "margin_percentage": margin_pct,
                "discount_to_margin_ratio": discount_to_margin_ratio,
                "product_count": product_count,
                "total_quantity": total_quantity,
                "customer_historical_conversion_rate": cust_conv_rate,
                "customer_total_prior_quotes": total_prior_quotes,
                "customer_total_prior_orders": total_prior_orders,
                "customer_account_age_days": account_age_days,
                "quote_creation_day_of_week": day_of_week,
                "quote_creation_month": month,
                "early_event_count": len(early_events),
                "customer_interaction_count": len(interaction_events),
                # Categorical Features
                "customer_tier": str(customer.get("customer_tier", "BRONZE")),
                "customer_industry": str(customer.get("industry", "Technology")),
                "customer_region": str(customer.get("region", "North America"))
            })
            
        df = pd.DataFrame(records)
        if not df.empty:
            df = df.set_index("quotation_id")
        return df
