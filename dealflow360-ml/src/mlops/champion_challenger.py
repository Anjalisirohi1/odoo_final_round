from typing import Dict, Any, List
from src.schemas.mlops import ModelComparison

class ChampionChallengerComparator:
    """
    Compares metrics between the active production model (Champion) and a candidate
    newly trained model (Challenger) to support explicit, human-controlled promotion decisions.
    """

    def compare_models(
        self,
        model_name: str,
        champion_version: str,
        challenger_version: str,
        champion_metrics: Dict[str, Any],
        challenger_metrics: Dict[str, Any]
    ) -> ModelComparison:
        reasons: List[str] = []
        metric_keys = ["roc_auc", "f1", "accuracy", "precision", "recall"]

        champ_clean = {}
        chall_clean = {}
        diffs = {}

        for k in metric_keys:
            c_val = champion_metrics.get(k)
            cl_val = challenger_metrics.get(k)
            if c_val is not None and cl_val is not None:
                try:
                    c_num = float(c_val)
                    cl_num = float(cl_val)
                    champ_clean[k] = round(c_num, 4)
                    chall_clean[k] = round(cl_num, 4)
                    diffs[k] = round(cl_num - c_num, 4)
                except (ValueError, TypeError):
                    continue

        # Evaluation logic
        primary_metric = "roc_auc" if "roc_auc" in diffs else "f1"
        primary_diff = diffs.get(primary_metric, 0.0)

        if primary_diff >= 0.01:
            recommended = "CHALLENGER"
            reasons.append(f"Challenger v{challenger_version} improves {primary_metric} by +{primary_diff:.4f} over Champion v{champion_version}.")
        elif primary_diff <= -0.01:
            recommended = "CHAMPION"
            reasons.append(f"Champion v{champion_version} outperforms Challenger by +{abs(primary_diff):.4f} on {primary_metric}.")
        else:
            # Near tie: check F1 / Accuracy
            f1_diff = diffs.get("f1", 0.0)
            if f1_diff > 0:
                recommended = "CHALLENGER"
                reasons.append(f"Challenger v{challenger_version} demonstrates equivalent {primary_metric} with slight F1 advantage (+{f1_diff:.4f}).")
            else:
                recommended = "CHAMPION"
                reasons.append(f"Champion v{champion_version} maintains parity with Challenger; no significant upgrade advantage.")

        return ModelComparison(
            model_name=model_name,
            champion_version=champion_version,
            challenger_version=challenger_version,
            champion_metrics=champ_clean,
            challenger_metrics=chall_clean,
            metric_diffs=diffs,
            recommended=recommended,
            reasons=reasons
        )
