from typing import List, Dict, Any, Tuple

class AnomalyExplainer:
    """
    Generates deterministic, human-readable explanations for detected anomalies.
    Does not use LLMs; relies on structured DeviationSignals.
    """
    
    def explain(self, anomaly_score: float, risk_level: str, deviations: List[Dict[str, Any]]) -> Tuple[str, List[str]]:
        """
        Returns a (summary, primary_reasons) tuple.
        """
        primary_reasons = [dev["description"] for dev in deviations]
        
        if risk_level in ["HIGH", "CRITICAL"] and len(deviations) > 0:
            summary = "Quotation exhibits unusual behaviour, primarily driven by significant margin or discount deviations."
        elif risk_level == "MEDIUM" and len(deviations) > 0:
            summary = "Quotation shows moderate deviations from historical baselines."
        elif risk_level in ["HIGH", "CRITICAL"] and len(deviations) == 0:
            # Model caught something multivariate not explicitly caught by our simple deviation analyzer
            summary = "Quotation exhibits unusual multivariate behaviour detected by the Isolation Forest model."
        else:
            summary = "Quotation appears to be within normal historical patterns."
            
        return summary, primary_reasons
