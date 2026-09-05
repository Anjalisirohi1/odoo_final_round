from typing import Dict, Any, Optional

FEATURE_METADATA: Dict[str, Dict[str, Any]] = {
    "customer_historical_conversion_rate": {
        "label": "Customer Historical Win Rate",
        "category": "Customer Profile",
        "positive_template": "Strong historical customer conversion rate ({formatted_val}) significantly increased likelihood of conversion.",
        "negative_template": "Low historical win rate ({formatted_val}) for this customer reduced conversion likelihood.",
        "neutral_template": "Customer conversion rate ({formatted_val}) is in line with baseline.",
        "formatter": lambda v: f"{float(v)*100:.1f}%" if v is not None else "N/A"
    },
    "quotation_value": {
        "label": "Quotation Total Value",
        "category": "Commercial Terms",
        "positive_template": "Quotation size ({formatted_val}) aligns well with customer purchasing capacity.",
        "negative_template": "Large deal size ({formatted_val}) poses higher transaction friction and approval scrutiny.",
        "neutral_template": "Deal value ({formatted_val}) is standard.",
        "formatter": lambda v: f"${float(v):,.2f}" if v is not None else "N/A"
    },
    "log_quotation_value": {
        "label": "Quotation Magnitude",
        "category": "Commercial Terms",
        "positive_template": "Commercial transaction scale ({formatted_val}) supported deal momentum.",
        "negative_template": "Transaction scale ({formatted_val}) introduces extended sign-off requirements.",
        "neutral_template": "Transaction magnitude is balanced.",
        "formatter": lambda v: f"{float(v):.2f}" if v is not None else "N/A"
    },
    "discount_percentage": {
        "label": "Discount Level",
        "category": "Commercial Terms",
        "positive_template": "Commercially disciplined discount ({formatted_val}) supported profitability and buyer commitment.",
        "negative_template": "Aggressive discount level ({formatted_val}) indicates pricing pressure or margin erosion.",
        "neutral_template": "Discount percentage ({formatted_val}) is typical.",
        "formatter": lambda v: f"{float(v):.1f}%" if v is not None else "N/A"
    },
    "margin_percentage": {
        "label": "Gross Margin",
        "category": "Commercial Terms",
        "positive_template": "Healthy gross margin ({formatted_val}) provides strong commercial viability.",
        "negative_template": "Compressed gross margin ({formatted_val}) reduces deal profitability buffer.",
        "neutral_template": "Gross margin ({formatted_val}) meets baseline requirements.",
        "formatter": lambda v: f"{float(v):.1f}%" if v is not None else "N/A"
    },
    "discount_to_margin_ratio": {
        "label": "Discount-to-Margin Ratio",
        "category": "Commercial Terms",
        "positive_template": "Balanced discount-to-margin ratio ({formatted_val}) maintains pricing discipline.",
        "negative_template": "Elevated discount-to-margin ratio ({formatted_val}) risks excessive margin sacrifice.",
        "neutral_template": "Discount-to-margin balance is acceptable.",
        "formatter": lambda v: f"{float(v):.2f}" if v is not None else "N/A"
    },
    "product_count": {
        "label": "Quotation Item Breadth",
        "category": "Product & Basket",
        "positive_template": "Diverse multi-product basket ({formatted_val} items) indicates broad customer commitment.",
        "negative_template": "Narrow single-item quote ({formatted_val} items) has higher drop-off risk.",
        "neutral_template": "Product count ({formatted_val}) is standard.",
        "formatter": lambda v: f"{int(v)}" if v is not None else "N/A"
    },
    "total_quantity": {
        "label": "Total Unit Volume",
        "category": "Product & Basket",
        "positive_template": "Substantial order volume ({formatted_val} units) demonstrates strong customer intent.",
        "negative_template": "Low order volume ({formatted_val} units) represents casual exploration.",
        "neutral_template": "Order quantity ({formatted_val} units) is standard.",
        "formatter": lambda v: f"{int(v):,}" if v is not None else "N/A"
    },
    "customer_total_prior_quotes": {
        "label": "Customer Prior Quotes",
        "category": "Customer Profile",
        "positive_template": "Established quote history ({formatted_val} prior quotes) demonstrates recurring interest.",
        "negative_template": "Limited quoting history ({formatted_val} prior quotes) represents an unproven pipeline account.",
        "neutral_template": "Prior quote volume is average.",
        "formatter": lambda v: f"{int(v)}" if v is not None else "N/A"
    },
    "customer_total_prior_orders": {
        "label": "Customer Lifetime Orders",
        "category": "Customer Profile",
        "positive_template": "Proven purchasing history ({formatted_val} lifetime orders) signals strong buyer trust.",
        "negative_template": "Zero or few completed orders ({formatted_val} prior orders) indicates an uncommitted buyer.",
        "neutral_template": "Prior order volume ({formatted_val}) is moderate.",
        "formatter": lambda v: f"{int(v)}" if v is not None else "N/A"
    },
    "customer_account_age_days": {
        "label": "Account Tenure",
        "category": "Customer Profile",
        "positive_template": "Mature customer tenure ({formatted_val} days) reinforces account stability.",
        "negative_template": "Recent account creation ({formatted_val} days) lacks longitudinal conversion track record.",
        "neutral_template": "Account tenure ({formatted_val} days) is average.",
        "formatter": lambda v: f"{int(v)} days" if v is not None else "N/A"
    },
    "customer_interaction_count": {
        "label": "Client Engagement Frequency",
        "category": "Engagement & Activity",
        "positive_template": "High engagement with {formatted_val} client interactions demonstrates strong buyer responsiveness.",
        "negative_template": "Infrequent buyer interactions ({formatted_val} touchpoints) signals low buyer engagement.",
        "neutral_template": "Client touchpoints ({formatted_val}) are within normal range.",
        "formatter": lambda v: f"{int(v)}" if v is not None else "N/A"
    },
    "early_event_count": {
        "label": "Early Stage Deal Touchpoints",
        "category": "Engagement & Activity",
        "positive_template": "Rapid progression across {formatted_val} early stage milestones signals decisive intent.",
        "negative_template": "Lack of early progression touchpoints ({formatted_val}) indicates deal stall.",
        "neutral_template": "Early stage milestones are standard.",
        "formatter": lambda v: f"{int(v)}" if v is not None else "N/A"
    },
    "days_since_last_activity": {
        "label": "Activity Recency",
        "category": "Engagement & Activity",
        "positive_template": "Recent deal engagement ({formatted_val}) shows active buyer attention.",
        "negative_template": "Extended inactivity ({formatted_val}) significantly increases deal stall risk.",
        "neutral_template": "Days since last activity ({formatted_val}) is typical.",
        "formatter": lambda v: f"{int(v)} days" if v is not None else "N/A"
    },
    "customer_tier": {
        "label": "Customer Account Tier",
        "category": "Customer Profile",
        "positive_template": "High-priority {formatted_val} enterprise account tier supports priority execution.",
        "negative_template": "Lower-tier {formatted_val} account profile has historically lower win rate.",
        "neutral_template": "Account tier ({formatted_val}) is standard.",
        "formatter": lambda v: str(v).upper() if v is not None else "STANDARD"
    }
}

class FeatureMapper:
    """
    Centralized mapping layer that translates technical ML feature names
    and numerical values into human-readable business explanations.
    """

    def get_metadata(self, feature_name: str) -> Dict[str, Any]:
        """
        Retrieves metadata dictionary for a feature, with sensible fallbacks
        for one-hot encoded or engineered features.
        """
        if feature_name in FEATURE_METADATA:
            return FEATURE_METADATA[feature_name]

        # Handle one-hot encoded features like customer_tier_PLATINUM
        for base_name in ["customer_tier", "payment_terms", "status"]:
            if feature_name.startswith(base_name):
                suffix = feature_name.replace(f"{base_name}_", "").replace("_", " ").title()
                return {
                    "label": f"{base_name.replace('_', ' ').title()}: {suffix}",
                    "category": "Commercial Terms" if "terms" in base_name else "Customer Profile",
                    "positive_template": f"{suffix} specification positively contributed to deal viability.",
                    "negative_template": f"{suffix} specification reduced conversion probability.",
                    "neutral_template": f"{suffix} specification is standard.",
                    "formatter": lambda v: "Present" if v == 1 else "Absent"
                }

        # Generic fallback
        clean_label = feature_name.replace("_", " ").title()
        return {
            "label": clean_label,
            "category": "General Metrics",
            "positive_template": f"{clean_label} ({{formatted_val}}) positively influenced the predicted outcome.",
            "negative_template": f"{clean_label} ({{formatted_val}}) negatively influenced the predicted outcome.",
            "neutral_template": f"{clean_label} ({{formatted_val}}) remained within expected baseline.",
            "formatter": lambda v: f"{v:.2f}" if isinstance(v, (int, float)) else str(v)
        }

    def format_value(self, feature_name: str, value: Any) -> str:
        meta = self.get_metadata(feature_name)
        formatter = meta.get("formatter", str)
        try:
            return formatter(value)
        except Exception:
            return str(value)

    def generate_reason(
        self,
        feature_name: str,
        value: Any,
        direction: str,
        contribution: float
    ) -> str:
        meta = self.get_metadata(feature_name)
        formatted_val = self.format_value(feature_name, value)
        
        if direction.upper() == "POSITIVE":
            template = meta.get("positive_template")
        elif direction.upper() == "NEGATIVE":
            template = meta.get("negative_template")
        else:
            template = meta.get("neutral_template")
            
        try:
            return template.format(formatted_val=formatted_val)
        except Exception:
            return f"{meta['label']}: {formatted_val} ({direction.lower()} factor)."
