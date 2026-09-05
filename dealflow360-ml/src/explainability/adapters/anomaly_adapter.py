from typing import Dict, Any, List
from src.schemas.explainability import ModuleExplanationSummary

class AnomalyExplanationAdapter:
    """
    Standardizes Quotation Anomaly & Risk Detection explanations into unified XAI schemas
    without duplicating deviation calculations.
    """

    def adapt_module_summary(self, anomaly_result: Dict[str, Any]) -> ModuleExplanationSummary:
        score = anomaly_result.get("anomaly_score", 0.0)
        risk_level = anomaly_result.get("risk_level", "LOW")
        expl = anomaly_result.get("explanation", {})
        summary = expl.get("summary", "Quotation is within normal statistical deviation bounds.")
        reasons = expl.get("primary_reasons", [])

        if not reasons:
            deviations = anomaly_result.get("deviations", [])
            reasons = [d.get("description", "") for d in deviations if "description" in d]

        return ModuleExplanationSummary(
            module_name="Anomaly Detection",
            summary=summary,
            method="DEVIATION_ANALYSIS",
            key_drivers=reasons[:3] if reasons else ["Standard historical baseline margins and discount terms."],
            confidence="HIGH" if risk_level in ["LOW", "HIGH", "CRITICAL"] else "MEDIUM"
        )
