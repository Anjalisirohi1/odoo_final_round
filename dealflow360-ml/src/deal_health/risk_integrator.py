from typing import Dict, Any, Tuple, List, Optional
from .context_builder import DealContext

class RiskIntegrator:
    """
    Integrates ML Anomaly Detection Intelligence (Phase 4) into the Deal Health scoring.
    Maps ML anomaly scores into a normalized Risk Safety dimension:
    risk_safety = 1.0 - anomaly_score
    """
    
    def __init__(self, anomaly_service: Optional[Any] = None):
        self.anomaly_service = anomaly_service

    def evaluate_risk(self, context: DealContext) -> Tuple[float, Dict[str, Any], List[str], List[str]]:
        quotation = context.quotation
        
        strengths = []
        concerns = []
        
        if self.anomaly_service is not None and getattr(self.anomaly_service, "is_initialized", False):
            try:
                anomaly_result = self.anomaly_service.analyze_quotation(quotation)
                anomaly_score = float(anomaly_result.get("anomaly_score", 0.0))
                risk_level = str(anomaly_result.get("risk_level", "LOW"))
                is_anomaly = bool(anomaly_result.get("is_anomaly", False))
                deviations = anomaly_result.get("deviations", [])
                primary_reasons = anomaly_result.get("primary_reasons", [])
                
                risk_safety = round(max(0.0, min(1.0, 1.0 - anomaly_score)), 4)
                
                evidence = {
                    "anomaly_score": round(anomaly_score, 4),
                    "risk_level": risk_level,
                    "is_anomaly": is_anomaly,
                    "deviations_count": len(deviations),
                    "deviations": deviations,
                    "primary_reasons": primary_reasons,
                    "risk_safety_score": round(risk_safety, 4)
                }
                
                if risk_level == "LOW" and not is_anomaly:
                    strengths.append("Commercial terms align with historical customer and representative baselines (low anomaly risk).")
                elif risk_level in ["HIGH", "CRITICAL"] or is_anomaly:
                    concerns.append(f"Elevated commercial anomaly risk ({risk_level}): {primary_reasons[0] if primary_reasons else 'Terms deviate from historical peer baselines.'}")
                    
                return risk_safety, evidence, strengths, concerns
                
            except Exception as e:
                # Graceful degradation if inference encounters unexpected format
                pass
                
        # Fallback when anomaly service is not available
        risk_safety = 0.80
        evidence = {
            "anomaly_score": 0.20,
            "risk_level": "LOW",
            "is_anomaly": False,
            "deviations_count": 0,
            "deviations": [],
            "primary_reasons": [],
            "risk_safety_score": risk_safety,
            "note": "Anomaly service offline; applied baseline neutral safety."
        }
        return risk_safety, evidence, strengths, concerns
