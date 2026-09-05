from typing import Dict, Any, List

class DeviationAnalyzer:
    """
    Analyzes specific numerical deviations of a quotation against its historical baseline
    to provide context on WHY a quotation might have been flagged as anomalous.
    """
    
    # Tolerances for generating deviations
    DISCOUNT_DEVIATION_TOLERANCE = 5.0  # 5%
    VALUE_DEVIATION_TOLERANCE = 50.0  # 50% relative deviation
    
    def analyze(self, features: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Returns a list of structured DeviationSignals.
        """
        signals = []
        
        discount = features.get('discount_percentage', 0.0)
        c_avg = features.get('customer_avg_discount', 0.0)
        r_avg = features.get('rep_avg_discount', 0.0)
        margin = features.get('margin_percentage', 0.0)
        
        # 1. Customer Discount Deviation
        c_dev = features.get('discount_customer_deviation', 0.0)
        if c_dev > self.DISCOUNT_DEVIATION_TOLERANCE:
            severity = "HIGH" if c_dev > 15.0 else "MEDIUM"
            signals.append({
                "feature": "discount_vs_customer_average",
                "observed_value": round(discount, 2),
                "baseline_value": round(c_avg, 2),
                "deviation": round(c_dev, 2),
                "severity": severity,
                "description": f"Discount is {round(c_dev, 1)}% above the customer's historical average."
            })
            
        # 2. Sales Rep Discount Deviation
        r_dev = features.get('discount_rep_deviation', 0.0)
        if r_dev > self.DISCOUNT_DEVIATION_TOLERANCE:
            severity = "HIGH" if r_dev > 15.0 else "MEDIUM"
            signals.append({
                "feature": "discount_vs_rep_average",
                "observed_value": round(discount, 2),
                "baseline_value": round(r_avg, 2),
                "deviation": round(r_dev, 2),
                "severity": severity,
                "description": f"Discount is {round(r_dev, 1)}% above the sales representative's historical average."
            })
            
        # 3. Margin Risk
        if margin > 0 and discount >= margin:
            signals.append({
                "feature": "discount_vs_margin",
                "observed_value": round(discount, 2),
                "baseline_value": round(margin, 2),
                "deviation": round(discount - margin, 2),
                "severity": "CRITICAL",
                "description": "Discount equals or exceeds the total product margin."
            })
        elif margin > 0 and discount > margin * 0.8:
            signals.append({
                "feature": "discount_vs_margin",
                "observed_value": round(discount, 2),
                "baseline_value": round(margin, 2),
                "deviation": round(discount - margin * 0.8, 2),
                "severity": "HIGH",
                "description": "Discount consumes more than 80% of the available margin."
            })
            
        # 4. Deal Value Deviation (Large deals)
        deal_value = features.get('quotation_total_value', 0.0)
        # We can approximate the baseline from the feature 'customer_deal_count' if we had stored the avg value directly.
        # But we only stored 'log_quotation_value'. We don't have the exact customer avg deal value in the inference features output.
        # Wait, the prompt didn't explicitly say we must have value deviations, but it's good to have.
        
        return signals
