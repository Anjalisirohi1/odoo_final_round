from typing import List, Tuple, Optional
import numpy as np

from src.core.config import settings
from src.schemas.explainability import (
    ImpactLevel, DriverDirection, DecisionDriver, FeatureContribution
)
from .base import RawContribution
from .feature_mapper import FeatureMapper

class ContributionAnalyzer:
    """
    Analyzes raw feature contributions, filters noise, assigns impact tiers,
    ranks positive/negative drivers, and constructs structured business drivers.
    """

    def __init__(
        self,
        feature_mapper: Optional[FeatureMapper] = None,
        min_threshold: Optional[float] = None,
        max_drivers: Optional[int] = None
    ):
        self.mapper = feature_mapper or FeatureMapper()
        self.min_threshold = min_threshold if min_threshold is not None else settings.XAI_MIN_CONTRIBUTION_THRESHOLD
        self.max_drivers = max_drivers if max_drivers is not None else settings.XAI_MAX_DRIVERS

    def categorize_impact(self, contribution: float) -> ImpactLevel:
        abs_val = abs(contribution)
        if abs_val >= settings.XAI_IMPACT_VERY_HIGH_THRESHOLD:
            return ImpactLevel.VERY_HIGH
        elif abs_val >= settings.XAI_IMPACT_HIGH_THRESHOLD:
            return ImpactLevel.HIGH
        elif abs_val >= settings.XAI_IMPACT_MEDIUM_THRESHOLD:
            return ImpactLevel.MEDIUM
        else:
            return ImpactLevel.LOW

    def analyze_contributions(
        self,
        raw_contributions: List[RawContribution]
    ) -> Tuple[List[DecisionDriver], List[DecisionDriver], List[FeatureContribution]]:
        """
        Processes raw contributions and returns:
        (top_positive_drivers, top_negative_drivers, all_structured_contributions)
        """
        all_structured: List[FeatureContribution] = []
        positive_candidates: List[Tuple[float, RawContribution]] = []
        negative_candidates: List[Tuple[float, RawContribution]] = []

        for item in raw_contributions:
            meta = self.mapper.get_metadata(item.feature_name)
            formatted_val = self.mapper.format_value(item.feature_name, item.feature_value)
            impact = self.categorize_impact(item.contribution)

            if item.contribution > 0:
                direction = DriverDirection.POSITIVE
                if item.contribution >= self.min_threshold:
                    positive_candidates.append((item.contribution, item))
            elif item.contribution < 0:
                direction = DriverDirection.NEGATIVE
                if abs(item.contribution) >= self.min_threshold:
                    negative_candidates.append((abs(item.contribution), item))
            else:
                direction = DriverDirection.NEUTRAL

            reason = self.mapper.generate_reason(
                item.feature_name,
                item.feature_value,
                direction.value,
                item.contribution
            )

            all_structured.append(FeatureContribution(
                feature=item.feature_name,
                label=meta["label"],
                category=meta["category"],
                raw_value=item.feature_value,
                formatted_value=formatted_val,
                contribution=round(float(item.contribution), 4),
                impact_level=impact,
                direction=direction,
                reason=reason
            ))

        # Sort positive descending
        positive_candidates.sort(key=lambda x: x[0], reverse=True)
        # Sort negative descending by magnitude
        negative_candidates.sort(key=lambda x: x[0], reverse=True)

        top_positive_drivers: List[DecisionDriver] = []
        for _, item in positive_candidates[:self.max_drivers]:
            meta = self.mapper.get_metadata(item.feature_name)
            reason = self.mapper.generate_reason(
                item.feature_name, item.feature_value, "POSITIVE", item.contribution
            )
            top_positive_drivers.append(DecisionDriver(
                feature=item.feature_name,
                label=meta["label"],
                impact_level=self.categorize_impact(item.contribution),
                direction=DriverDirection.POSITIVE,
                reason=reason,
                value_context=self.mapper.format_value(item.feature_name, item.feature_value),
                contribution=round(float(item.contribution), 4)
            ))

        top_negative_drivers: List[DecisionDriver] = []
        for _, item in negative_candidates[:self.max_drivers]:
            meta = self.mapper.get_metadata(item.feature_name)
            reason = self.mapper.generate_reason(
                item.feature_name, item.feature_value, "NEGATIVE", item.contribution
            )
            top_negative_drivers.append(DecisionDriver(
                feature=item.feature_name,
                label=meta["label"],
                impact_level=self.categorize_impact(item.contribution),
                direction=DriverDirection.NEGATIVE,
                reason=reason,
                value_context=self.mapper.format_value(item.feature_name, item.feature_value),
                contribution=round(float(item.contribution), 4)
            ))

        # Baseline fallbacks if no drivers pass threshold
        if not top_positive_drivers:
            top_positive_drivers.append(DecisionDriver(
                feature="baseline_commercial_terms",
                label="Commercial Terms Baseline",
                impact_level=ImpactLevel.LOW,
                direction=DriverDirection.POSITIVE,
                reason="Standard commercial and operational terms support baseline viability.",
                value_context="Standard Baseline",
                contribution=0.0
            ))

        if not top_negative_drivers:
            top_negative_drivers.append(DecisionDriver(
                feature="no_adverse_drivers",
                label="Risk Indicators",
                impact_level=ImpactLevel.LOW,
                direction=DriverDirection.NEUTRAL,
                reason="No significant negative commercial or engagement factors detected.",
                value_context="None",
                contribution=0.0
            ))

        return top_positive_drivers, top_negative_drivers, all_structured

    def generate_summary(
        self,
        predicted_outcome: str,
        conversion_probability: float,
        positive_drivers: List[DecisionDriver],
        negative_drivers: List[DecisionDriver]
    ) -> str:
        """
        Synthesizes an executive natural language summary of the explanation.
        """
        pos_labels = [d.label for d in positive_drivers if d.feature != "baseline_commercial_terms"]
        neg_labels = [d.label for d in negative_drivers if d.feature != "no_adverse_drivers"]

        prob_pct = f"{conversion_probability * 100:.1f}%"

        if predicted_outcome in ["LIKELY_TO_CONVERT", "LIKELY_WON", "WON"]:
            if pos_labels:
                pos_str = ", ".join(pos_labels[:2])
                summary = f"The deal demonstrates strong conversion potential ({prob_pct}), primarily driven by {pos_str}."
            else:
                summary = f"The deal demonstrates positive conversion potential ({prob_pct}) meeting commercial baseline standards."
            if neg_labels:
                summary += f" However, {neg_labels[0]} introduces slight friction to monitor."
        elif predicted_outcome in ["LIKELY_TO_LOSE", "LOST"]:
            if neg_labels:
                neg_str = ", ".join(neg_labels[:2])
                summary = f"The deal is at risk of loss ({prob_pct} win probability), heavily constrained by {neg_str}."
            else:
                summary = f"The deal shows subdued conversion potential ({prob_pct}) below typical closing thresholds."
            if pos_labels:
                summary += f" {pos_labels[0]} provides some positive support."
        else:
            summary = f"The deal conversion outcome is uncertain ({prob_pct}). Balanced forces between {pos_labels[0] if pos_labels else 'commercial terms'} and {neg_labels[0] if neg_labels else 'market friction'} require active qualification."

        return summary
