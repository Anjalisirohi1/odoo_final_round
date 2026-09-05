from typing import List, Optional
from src.schemas.deal_intelligence import (
    ExecutiveInsight, InsightImportance, SignalConflict, SignalAgreement
)
from .normalizer import NormalizedSignal
from src.core.config import settings

class ExecutiveInsightRanker:
    """
    Ranks intelligence signals, conflicts, and strategic findings to select
    the top 3-5 most impactful executive insights for sales leadership.
    """

    def __init__(self, max_insights: Optional[int] = None):
        self.max_insights = max_insights or settings.INTELLIGENCE_MAX_TOP_INSIGHTS

    def rank_insights(
        self,
        signals: List[NormalizedSignal],
        conflicts: Optional[List[SignalConflict]] = None,
        agreements: Optional[List[SignalAgreement]] = None
    ) -> List[ExecutiveInsight]:
        candidates = []

        # 1. Add High-Severity Conflicts
        for c in (conflicts or []):
            priority_score = 95.0 if c.severity == InsightImportance.CRITICAL else 75.0
            candidates.append({
                "score": priority_score,
                "insight": ExecutiveInsight(
                    title=f"Intelligence Conflict: {c.type.replace('_', ' ').title()}",
                    importance=c.severity,
                    source="CROSS_MODULE_CONFLICT",
                    description=c.description,
                    category="CONFLICT"
                )
            })

        # 2. Add Strong Agreements
        for a in (agreements or []):
            if "STRONG" in a.type:
                candidates.append({
                    "score": 85.0,
                    "insight": ExecutiveInsight(
                        title=f"Consensus: {a.type.replace('_', ' ').title()}",
                        importance=InsightImportance.HIGH,
                        source="CROSS_MODULE_CONSENSUS",
                        description=a.description,
                        category="AGREEMENT"
                    )
                })

        # 3. Add Normalized Signals
        importance_weights = {
            InsightImportance.CRITICAL: 90.0,
            InsightImportance.HIGH: 65.0,
            InsightImportance.MEDIUM: 35.0,
            InsightImportance.LOW: 15.0
        }

        for sig in signals:
            base_score = importance_weights.get(sig.severity, 30.0)
            if sig.category in ["RISK", "FINANCIAL"]:
                base_score += 10.0

            candidates.append({
                "score": base_score,
                "insight": ExecutiveInsight(
                    title=sig.title,
                    importance=sig.severity,
                    source=sig.source,
                    description=sig.description,
                    category=sig.category
                )
            })

        # 4. Deduplicate by title/source and sort by priority score
        seen_titles = set()
        deduped = []
        for item in sorted(candidates, key=lambda x: x["score"], reverse=True):
            t = item["insight"].title.lower()
            if t not in seen_titles:
                seen_titles.add(t)
                deduped.append(item["insight"])

        return deduped[:self.max_insights]
