from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

from src.schemas.deal_intelligence import (
    DealIntelligenceResponse, OverallAssessment, IntelligenceSignal,
    SignalAgreement, SignalConflict, UnifiedRecommendedAction,
    ExecutiveInsight, IntelligenceTimelineItem, ModuleStatusDetail,
    SignalDirection, InsightImportance, IntelligenceClassification,
    BusinessImpactLevel
)
from .normalizer import NormalizedSignal
from .context_builder import UnifiedDealContext

class InsightSynthesizer:
    """
    Deterministic synthesis engine that compiles normalized signals, conflict/agreement
    findings, executive scores, and actions into a unified executive deal intelligence response.
    NO LLM / NO external APIs - purely structured and explainable composition.
    """

    def synthesize(
        self,
        context: UnifiedDealContext,
        signals: List[NormalizedSignal],
        score_result: Dict[str, Any],
        business_impact_level: BusinessImpactLevel,
        business_impact_reason: str,
        conflicts: List[SignalConflict],
        agreements: List[SignalAgreement],
        actions: List[UnifiedRecommendedAction],
        top_insights: List[ExecutiveInsight],
        timeline: List[IntelligenceTimelineItem],
        module_statuses: Dict[str, ModuleStatusDetail]
    ) -> DealIntelligenceResponse:
        score = score_result.get("intelligence_score", 50.0)
        classification = score_result.get("classification", IntelligenceClassification.MIXED)

        # 1. Filter Key Positive Signals and Key Risks
        pos_signals: List[IntelligenceSignal] = []
        risk_signals: List[IntelligenceSignal] = []

        for sig in signals:
            item = IntelligenceSignal(
                title=sig.title,
                source=sig.source,
                importance=sig.severity,
                description=sig.description,
                category=sig.category,
                direction=sig.direction,
                score=sig.normalized_score,
                raw_score=sig.raw_score,
                evidence=sig.evidence
            )
            if sig.direction == SignalDirection.POSITIVE:
                pos_signals.append(item)
            elif sig.direction == SignalDirection.NEGATIVE:
                risk_signals.append(item)

        # 2. Synthesize Deterministic Executive Summary
        summary = self._generate_executive_summary(
            score=score,
            classification=classification,
            impact_level=business_impact_level,
            impact_reason=business_impact_reason,
            risk_signals=risk_signals,
            pos_signals=pos_signals,
            conflicts=conflicts,
            agreements=agreements
        )

        overall_assessment = OverallAssessment(
            intelligence_score=score,
            classification=classification,
            business_impact=business_impact_level,
            summary=summary,
            confidence="HIGH" if len(signals) >= 3 else "MEDIUM"
        )

        return DealIntelligenceResponse(
            quotation_id=context.quotation_id,
            overall_assessment=overall_assessment,
            module_status=module_statuses,
            key_positive_signals=pos_signals,
            key_risks=risk_signals,
            signal_agreements=agreements,
            signal_conflicts=conflicts,
            recommended_actions=actions,
            top_insights=top_insights,
            intelligence_timeline=timeline,
            generated_at=datetime.now(timezone.utc)
        )

    def _generate_executive_summary(
        self,
        score: float,
        classification: IntelligenceClassification,
        impact_level: BusinessImpactLevel,
        impact_reason: str,
        risk_signals: List[IntelligenceSignal],
        pos_signals: List[IntelligenceSignal],
        conflicts: List[SignalConflict],
        agreements: List[SignalAgreement]
    ) -> str:
        parts = []

        # Part 1: Core posture
        if classification == IntelligenceClassification.STRONG_OPPORTUNITY:
            parts.append(f"Deal demonstrates superior commercial posture (Score: {score:.1f}/100) with strong closing velocity.")
        elif classification == IntelligenceClassification.POSITIVE:
            parts.append(f"Deal demonstrates positive closing viability (Score: {score:.1f}/100) with solid baseline indicators.")
        elif classification == IntelligenceClassification.MIXED:
            parts.append(f"Deal exhibits balanced/mixed signals (Score: {score:.1f}/100) requiring targeted sales intervention.")
        elif classification == IntelligenceClassification.AT_RISK:
            parts.append(f"Deal is at elevated risk of loss or margin erosion (Score: {score:.1f}/100).")
        else:
            parts.append(f"Deal is in critical posture (Score: {score:.1f}/100) requiring immediate managerial escalation.")

        # Part 2: Impact context
        if impact_level in [BusinessImpactLevel.CRITICAL, BusinessImpactLevel.HIGH]:
            parts.append(f"Business stakes are {impact_level.value.lower()}: {impact_reason}")

        # Part 3: Highlight Risks or Conflicts if present
        if conflicts:
            parts.append(f"Cross-module discrepancy detected: {conflicts[0].description}")
        elif risk_signals:
            top_risk = risk_signals[0]
            parts.append(f"Primary risk concern: {top_risk.description}")

        # Part 4: Highlight Agreements or Positives
        if agreements:
            parts.append(f"Cross-module agreement: {agreements[0].description}")
        elif pos_signals and not conflicts:
            parts.append(f"Key positive driver: {pos_signals[0].description}")

        return " ".join(parts)
