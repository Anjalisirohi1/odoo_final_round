import logging
from typing import List, Any, Optional
import pandas as pd

from src.schemas.explainability import ExplanationMethod
from ..base import BaseLocalExplainer, RawContribution

logger = logging.getLogger(__name__)

class FallbackLocalExplainer(BaseLocalExplainer):
    """
    Deterministic rule-based fallback explainer.
    Extracts contributions based on standardized domain rules (conversion rates,
    discount discipline, margins, account interactions) when models are missing or uninitialized.
    """

    @property
    def method_name(self) -> ExplanationMethod:
        return ExplanationMethod.RULE_BASED

    def explain_instance(
        self,
        features_df: pd.DataFrame,
        model: Any = None,
        preprocessor: Any = None,
        feature_names: Optional[List[str]] = None
    ) -> List[RawContribution]:
        if features_df.empty:
            return []

        row = features_df.iloc[0].to_dict()
        contributions: List[RawContribution] = []

        # 1. Customer conversion rate
        conv_rate = float(row.get("customer_historical_conversion_rate", 0.35))
        conv_contrib = (conv_rate - 0.35) * 0.8
        contributions.append(RawContribution(
            feature_name="customer_historical_conversion_rate",
            feature_value=conv_rate,
            contribution=conv_contrib
        ))

        # 2. Discount percentage
        discount_pct = float(row.get("discount_percentage", 15.0))
        discount_contrib = (15.0 - discount_pct) * 0.015
        contributions.append(RawContribution(
            feature_name="discount_percentage",
            feature_value=discount_pct,
            contribution=discount_contrib
        ))

        # 3. Margin percentage
        margin_pct = float(row.get("margin_percentage", 25.0))
        margin_contrib = (margin_pct - 25.0) * 0.012
        contributions.append(RawContribution(
            feature_name="margin_percentage",
            feature_value=margin_pct,
            contribution=margin_contrib
        ))

        # 4. Customer interactions
        interactions = int(row.get("customer_interaction_count", 1))
        interaction_contrib = (interactions - 1.0) * 0.08
        contributions.append(RawContribution(
            feature_name="customer_interaction_count",
            feature_value=interactions,
            contribution=interaction_contrib
        ))

        # 5. Customer total prior orders
        prior_orders = int(row.get("customer_total_prior_orders", 0))
        orders_contrib = min(0.20, prior_orders * 0.03)
        contributions.append(RawContribution(
            feature_name="customer_total_prior_orders",
            feature_value=prior_orders,
            contribution=orders_contrib
        ))

        # 6. Early events count
        early_events = int(row.get("early_event_count", 0))
        events_contrib = min(0.15, early_events * 0.04)
        contributions.append(RawContribution(
            feature_name="early_event_count",
            feature_value=early_events,
            contribution=events_contrib
        ))

        return contributions
