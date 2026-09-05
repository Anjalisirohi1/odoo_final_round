import math
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, List
from .context_builder import DealContext

class EngagementHealthScorer:
    """
    Quantifies client responsiveness, interaction recency, and communication flow.
    Penalizes stale quotations and rewards recent customer interactions.
    """
    
    def __init__(self, half_life_days: float = 14.0, volume_saturation: float = 5.0):
        self.half_life_days = half_life_days
        self.volume_saturation = volume_saturation

    def score(self, context: DealContext) -> Tuple[float, Dict[str, Any], List[str], List[str]]:
        events = context.deal_events
        quotation = context.quotation
        now = context.now
        
        strengths = []
        concerns = []
        
        # Handle case when no events exist
        if not events:
            # Fallback to quotation creation date
            q_created = quotation.get("created_at")
            if q_created:
                if isinstance(q_created, str):
                    q_created = pd.to_datetime(q_created).to_pydatetime()
                if q_created.tzinfo is None:
                    q_created = q_created.replace(tzinfo=timezone.utc)
                if now.tzinfo is None:
                    now = now.replace(tzinfo=timezone.utc)
                    
                days_since_created = max(0, (now - q_created).total_seconds() / 86400.0)
            else:
                days_since_created = 0.0
                
            if days_since_created <= 3.0:
                score = 0.75
                evidence = {
                    "event_count": 0,
                    "days_since_last_activity": round(days_since_created, 1),
                    "is_new_deal": True,
                    "calculated_score": score
                }
                strengths.append("Newly created quotation in early evaluation window.")
            else:
                score = max(0.10, math.exp(-days_since_created / self.half_life_days))
                evidence = {
                    "event_count": 0,
                    "days_since_last_activity": round(days_since_created, 1),
                    "is_new_deal": False,
                    "calculated_score": round(score, 4)
                }
                concerns.append(f"No deal events recorded since quotation creation ({days_since_created:.0f} days ago).")
                
            return score, evidence, strengths, concerns

        # If events exist, analyze event timestamps and types
        event_dates = []
        customer_interactions = 0
        
        for e in events:
            dt = e.get("created_at")
            if dt:
                if isinstance(dt, str):
                    dt = pd.to_datetime(dt).to_pydatetime()
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                event_dates.append(dt)
            if e.get("event_type") in ["CUSTOMER_VIEWED", "COUNTER_OFFER", "QUOTE_REVISED"]:
                customer_interactions += 1
                
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)
            
        latest_date = max(event_dates) if event_dates else now
        days_since_last_activity = max(0.0, (now - latest_date).total_seconds() / 86400.0)
        
        recency_factor = math.exp(-days_since_last_activity / self.half_life_days)
        volume_factor = min(1.0, len(events) / self.volume_saturation)
        
        score = min(1.0, max(0.0, 0.65 * recency_factor + 0.35 * volume_factor))
        
        evidence = {
            "total_events": len(events),
            "customer_interactions": customer_interactions,
            "days_since_last_activity": round(days_since_last_activity, 1),
            "recency_factor": round(recency_factor, 4),
            "volume_factor": round(volume_factor, 4),
            "calculated_score": round(score, 4)
        }
        
        if days_since_last_activity <= 3.0:
            strengths.append(f"High engagement recency: activity within the last {days_since_last_activity:.1f} days.")
        elif days_since_last_activity >= 14.0:
            concerns.append(f"Engagement stalled: no activity recorded for {days_since_last_activity:.0f} days.")
            
        if customer_interactions >= 2:
            strengths.append(f"Active client participation with {customer_interactions} customer touchpoints.")
        elif len(events) >= 5 and customer_interactions == 0:
            concerns.append("Deal activity is primarily internal without recorded customer interactions.")
            
        return score, evidence, strengths, concerns
