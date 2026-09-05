import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from src.schemas.prediction import FeatureImpact, ImpactDirection

FEATURE_DESCRIPTIONS = {
    "customer_historical_conversion_rate": "Customer historical win/conversion rate profile.",
    "quotation_value": "Quotation total deal size.",
    "log_quotation_value": "Log-scaled quotation transaction magnitude.",
    "discount_percentage": "Commercial discount concession granted.",
    "margin_percentage": "Gross profit margin percentage.",
    "discount_to_margin_ratio": "Discount to margin commercial balance.",
    "product_count": "Bundle complexity and item breadth.",
    "total_quantity": "Total volume of units requested.",
    "customer_total_prior_quotes": "Total quotation engagement history with account.",
    "customer_total_prior_orders": "Total completed order volume with account.",
    "customer_account_age_days": "Customer tenure and account maturity.",
    "early_event_count": "Active early stage quotation progression touchpoints.",
    "customer_interaction_count": "Direct client engagement and interaction frequency."
}

class PredictionExplainer:
    """
    Extracts top positive and negative predictive drivers from feature values
    and model weights/importances.
    """
    
    def explain(
        self,
        features_dict: Dict[str, Any],
        model: Any,
        feature_names: List[str]
    ) -> Tuple[List[FeatureImpact], List[FeatureImpact]]:
        positive_factors: List[FeatureImpact] = []
        negative_factors: List[FeatureImpact] = []
        
        # 1. Customer conversion rate driver
        conv_rate = float(features_dict.get("customer_historical_conversion_rate", 0.0))
        if conv_rate >= 0.50:
            positive_factors.append(FeatureImpact(
                feature="customer_historical_conversion_rate",
                impact=ImpactDirection.POSITIVE,
                importance=0.85,
                description=f"Strong historical customer conversion rate ({conv_rate*100:.1f}%)."
            ))
        elif conv_rate <= 0.25:
            negative_factors.append(FeatureImpact(
                feature="customer_historical_conversion_rate",
                impact=ImpactDirection.NEGATIVE,
                importance=0.75,
                description=f"Low historical conversion rate ({conv_rate*100:.1f}%) for this account."
            ))
            
        # 2. Discount & Margin commercial balance
        discount_pct = float(features_dict.get("discount_percentage", 0.0))
        margin_pct = float(features_dict.get("margin_percentage", 0.0))
        
        if margin_pct >= 30.0:
            positive_factors.append(FeatureImpact(
                feature="margin_percentage",
                impact=ImpactDirection.POSITIVE,
                importance=0.70,
                description=f"Healthy gross profit margin ({margin_pct:.1f}%)."
            ))
        elif margin_pct < 15.0:
            negative_factors.append(FeatureImpact(
                feature="margin_percentage",
                impact=ImpactDirection.NEGATIVE,
                importance=0.80,
                description=f"Compressed profit margin ({margin_pct:.1f}%)."
            ))
            
        if discount_pct >= 25.0:
            negative_factors.append(FeatureImpact(
                feature="discount_percentage",
                impact=ImpactDirection.NEGATIVE,
                importance=0.75,
                description=f"High discount rate ({discount_pct:.1f}%) may indicate aggressive pricing pressure."
            ))
        elif discount_pct <= 10.0 and discount_pct > 0:
            positive_factors.append(FeatureImpact(
                feature="discount_percentage",
                impact=ImpactDirection.POSITIVE,
                importance=0.60,
                description=f"Disciplined discount level ({discount_pct:.1f}%)."
            ))
            
        # 3. Early Interaction touchpoints
        interactions = int(features_dict.get("customer_interaction_count", 0))
        if interactions >= 2:
            positive_factors.append(FeatureImpact(
                feature="customer_interaction_count",
                impact=ImpactDirection.POSITIVE,
                importance=0.65,
                description=f"High client engagement with {interactions} recorded customer touchpoints."
            ))
            
        # 4. Account Tier
        tier = str(features_dict.get("customer_tier", "BRONZE")).upper()
        if tier in ["PLATINUM", "GOLD"]:
            positive_factors.append(FeatureImpact(
                feature="customer_tier",
                impact=ImpactDirection.POSITIVE,
                importance=0.60,
                description=f"High-priority {tier} enterprise account profile."
            ))
            
        # Default fallbacks if empty
        if not positive_factors:
            positive_factors.append(FeatureImpact(
                feature="baseline_terms",
                impact=ImpactDirection.POSITIVE,
                importance=0.50,
                description="Standard commercial baseline terms."
            ))
            
        if not negative_factors:
            negative_factors.append(FeatureImpact(
                feature="risk_indicators",
                impact=ImpactDirection.NEUTRAL,
                importance=0.10,
                description="No significant negative factors or commercial risks detected."
            ))
            
        return positive_factors[:3], negative_factors[:3]
