from typing import List, Dict, Any, Optional
from datetime import datetime
from src.schemas.deal_intelligence import (
    IntelligenceTimelineItem, InsightImportance
)
from .context_builder import UnifiedDealContext

class IntelligenceTimelineBuilder:
    """
    Constructs a chronological intelligence timeline from actual contextual deal events,
    quotation milestones, and evaluated risk indicators (NO fabricated events).
    """

    def build_timeline(
        self,
        context: UnifiedDealContext,
        anomaly_data: Optional[Dict[str, Any]] = None,
        health_data: Optional[Dict[str, Any]] = None
    ) -> List[IntelligenceTimelineItem]:
        timeline_items: List[IntelligenceTimelineItem] = []

        # 1. Quotation Lifecycle Origin
        q_created = context.quotation.get("created_at") or context.quotation.get("date")
        if q_created:
            timeline_items.append(IntelligenceTimelineItem(
                timestamp=str(q_created),
                event_type="QUOTATION_CREATED",
                title="Quotation Generated",
                source="CORE_CRM",
                importance=InsightImportance.LOW,
                metadata={
                    "total_amount": context.total_amount,
                    "discount_percentage": context.discount_percentage
                }
            ))

        # 2. Ingest Historical Deal Events from Context
        for evt in context.deal_events:
            ts = evt.get("event_timestamp") or evt.get("timestamp") or evt.get("created_at")
            evt_type = str(evt.get("event_type", "DEAL_ACTIVITY")).upper()
            title = evt.get("title") or evt_type.replace("_", " ").title()
            
            imp = InsightImportance.MEDIUM
            if "REJECT" in evt_type or "DISCOUNT" in evt_type:
                imp = InsightImportance.HIGH
            elif "EMAIL" in evt_type or "VIEW" in evt_type:
                imp = InsightImportance.LOW

            if ts:
                timeline_items.append(IntelligenceTimelineItem(
                    timestamp=str(ts),
                    event_type=evt_type,
                    title=title,
                    source="DEAL_ACTIVITY_LOG",
                    importance=imp,
                    metadata=evt
                ))

        # 3. Add Evaluated Intelligence Signals (if notable deviations detected)
        if anomaly_data and anomaly_data.get("is_anomaly"):
            now_iso = context.now.isoformat()
            risk_level = str(anomaly_data.get("risk_level", "HIGH")).upper()
            timeline_items.append(IntelligenceTimelineItem(
                timestamp=now_iso,
                event_type="ANOMALY_FLAGGED",
                title=f"Quotation Anomaly Detected ({risk_level})",
                source="ANOMALY_DETECTION",
                importance=InsightImportance.CRITICAL if risk_level == "CRITICAL" else InsightImportance.HIGH,
                metadata={"risk_level": risk_level, "score": anomaly_data.get("anomaly_score")}
            ))

        # 4. Sort strictly chronologically by timestamp
        def parse_timestamp(item: IntelligenceTimelineItem) -> str:
            return item.timestamp

        sorted_timeline = sorted(timeline_items, key=parse_timestamp)
        return sorted_timeline
