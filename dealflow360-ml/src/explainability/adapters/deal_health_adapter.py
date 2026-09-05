from typing import Dict, Any, List
from src.schemas.explainability import ModuleExplanationSummary

class DealHealthExplanationAdapter:
    """
    Standardizes Deal Health Intelligence explanations into unified XAI schemas
    without duplicating 5-dimension health calculations.
    """

    def adapt_module_summary(self, health_result: Dict[str, Any]) -> ModuleExplanationSummary:
        score = health_result.get("health_score", 50.0)
        classification = health_result.get("classification", "HEALTHY")
        strengths = health_result.get("strengths", [])
        concerns = health_result.get("concerns", [])

        if classification in ["EXCELLENT", "HEALTHY"]:
            summary = f"The deal demonstrates solid operational health (Score: {score:.1f}/100) across evaluated business dimensions."
        elif classification == "AT_RISK":
            summary = f"The deal requires active intervention (Score: {score:.1f}/100) due to identified commercial and engagement risks."
        else:
            summary = f"The deal exhibits critical health deterioration (Score: {score:.1f}/100)."

        key_drivers: List[str] = []
        for s in strengths[:2]:
            key_drivers.append(f"+ {s}")
        for c in concerns[:2]:
            key_drivers.append(f"- {c}")

        if not key_drivers:
            key_drivers.append("Standard commercial and operational baseline.")

        return ModuleExplanationSummary(
            module_name="Deal Health Intelligence",
            summary=summary,
            method="HYBRID_DECISION_SCORING",
            key_drivers=key_drivers[:4],
            confidence="HIGH"
        )
