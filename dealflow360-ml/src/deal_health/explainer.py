from typing import List, Dict, Any, Tuple
from src.schemas.deal_health import HealthClassification, MomentumLabel

class DealHealthExplainer:
    """
    Compiles transparent, evidence-based strengths, concerns, and executive
    health summaries from individual dimension evaluations.
    """
    
    def compile_explanation(
        self,
        health_score: float,
        classification: HealthClassification,
        momentum_label: MomentumLabel,
        all_strengths: List[str],
        all_concerns: List[str]
    ) -> Tuple[List[str], List[str]]:
        """
        Deduplicates and prioritizes strengths and concerns.
        """
        # Maintain order while deduplicating
        deduped_strengths = []
        for s in all_strengths:
            if s and s not in deduped_strengths:
                deduped_strengths.append(s)
                
        deduped_concerns = []
        for c in all_concerns:
            if c and c not in deduped_concerns:
                deduped_concerns.append(c)
                
        # If no explicit strengths generated, provide neutral baseline
        if not deduped_strengths and health_score >= 60.0:
            deduped_strengths.append("Standard commercial and operational indicators across all dimensions.")
            
        # If no concerns generated for high score
        if not deduped_concerns and classification in [HealthClassification.EXCELLENT, HealthClassification.HEALTHY]:
            deduped_concerns.append("No material risks or significant deviations identified.")
            
        return deduped_strengths, deduped_concerns
