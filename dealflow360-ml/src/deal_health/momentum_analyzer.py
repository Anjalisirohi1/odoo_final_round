import pandas as pd
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, List
from src.schemas.deal_health import MomentumLabel
from src.core.constants import MOMENTUM_SCORES
from .context_builder import DealContext

PROGRESSIVE_EVENTS = {
    "QUOTE_SENT", "CUSTOMER_VIEWED", "COUNTER_OFFER",
    "QUOTE_REVISED", "APPROVAL_REQUESTED", "APPROVED", "ORDER_CONFIRMED"
}

class MomentumAnalyzer:
    """
    Evaluates temporal deal dynamics: whether a deal is accelerating,
    progressing steadily, stagnating, or losing momentum over time.
    """
    
    def __init__(self):
        self.scores = MOMENTUM_SCORES

    def analyze(self, context: DealContext) -> Tuple[float, MomentumLabel, Dict[str, Any], List[str], List[str]]:
        events = context.deal_events
        quotation = context.quotation
        now = context.now
        
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)
            
        strengths = []
        concerns = []
        
        # Handle case when no events exist
        if not events:
            q_created = quotation.get("created_at")
            if q_created:
                if isinstance(q_created, str):
                    q_created = pd.to_datetime(q_created).to_pydatetime()
                if q_created.tzinfo is None:
                    q_created = q_created.replace(tzinfo=timezone.utc)
                days_since_created = max(0.0, (now - q_created).total_seconds() / 86400.0)
            else:
                days_since_created = 0.0
                
            if days_since_created <= 3.0:
                label = MomentumLabel.STABLE
                score = self.scores[label.value]
                evidence = {
                    "momentum_label": label.value,
                    "days_since_last_activity": round(days_since_created, 1),
                    "progressive_events_count": 0,
                    "reason": "New deal in initial active creation window"
                }
                strengths.append("Freshly opened deal maintaining standard entry momentum.")
            elif days_since_created <= 14.0:
                label = MomentumLabel.DECLINING
                score = self.scores[label.value]
                evidence = {
                    "momentum_label": label.value,
                    "days_since_last_activity": round(days_since_created, 1),
                    "progressive_events_count": 0,
                    "reason": "No events since creation within 14 days"
                }
                concerns.append(f"Deal has seen no progress for {days_since_created:.0f} days since creation.")
            else:
                label = MomentumLabel.STAGNANT
                score = self.scores[label.value]
                evidence = {
                    "momentum_label": label.value,
                    "days_since_last_activity": round(days_since_created, 1),
                    "progressive_events_count": 0,
                    "reason": "Deal inactive for > 14 days without progression"
                }
                concerns.append("Deal is completely stagnant with zero recent activity.")
                
            return score, label, evidence, strengths, concerns

        # If events exist, analyze chronological trajectory
        parsed_events = []
        for e in events:
            dt = e.get("created_at")
            if dt:
                if isinstance(dt, str):
                    dt = pd.to_datetime(dt).to_pydatetime()
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                parsed_events.append((dt, e.get("event_type", "")))
                
        parsed_events.sort(key=lambda x: x[0])
        latest_time = parsed_events[-1][0]
        days_since_last = max(0.0, (now - latest_time).total_seconds() / 86400.0)
        
        # Recent progressive event count
        recent_events = [e for e in parsed_events if (now - e[0]).total_seconds() / 86400.0 <= 7.0]
        progressive_count = sum(1 for e in parsed_events if e[1] in PROGRESSIVE_EVENTS)
        latest_event_type = parsed_events[-1][1]
        
        # Determine momentum category
        if days_since_last <= 2.0 and len(recent_events) >= 2:
            label = MomentumLabel.STRONG_POSITIVE
            strengths.append("Strong positive momentum: multiple active deal events in the last 48 hours.")
        elif days_since_last <= 7.0 and (progressive_count >= 2 or latest_event_type in PROGRESSIVE_EVENTS):
            label = MomentumLabel.POSITIVE
            strengths.append(f"Positive momentum: constructive deal movement recorded within {days_since_last:.1f} days.")
        elif days_since_last <= 14.0:
            label = MomentumLabel.STABLE
        elif days_since_last <= 30.0:
            label = MomentumLabel.DECLINING
            concerns.append(f"Declining momentum: deal velocity slowed down ({days_since_last:.0f} days inactive).")
        else:
            label = MomentumLabel.STAGNANT
            concerns.append(f"Stagnant momentum: deal has been dormant for {days_since_last:.0f} days.")
            
        score = self.scores[label.value]
        
        evidence = {
            "momentum_label": label.value,
            "days_since_last_activity": round(days_since_last, 1),
            "recent_events_7d": len(recent_events),
            "total_progressive_events": progressive_count,
            "latest_event_type": latest_event_type,
            "calculated_score": score
        }
        
        return score, label, evidence, strengths, concerns
