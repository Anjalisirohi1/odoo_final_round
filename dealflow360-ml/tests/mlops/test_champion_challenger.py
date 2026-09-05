import pytest
from src.mlops.champion_challenger import ChampionChallengerComparator

def test_champion_challenger_challenger_wins():
    comparator = ChampionChallengerComparator()
    champ_metrics = {"roc_auc": 0.82, "f1": 0.78, "accuracy": 0.80}
    chall_metrics = {"roc_auc": 0.86, "f1": 0.82, "accuracy": 0.83}

    res = comparator.compare_models(
        model_name="deal_predictor",
        champion_version="1.0.0",
        challenger_version="1.1.0",
        champion_metrics=champ_metrics,
        challenger_metrics=chall_metrics
    )

    assert res.recommended == "CHALLENGER"
    assert res.metric_diffs["roc_auc"] == 0.04

def test_champion_challenger_champion_wins():
    comparator = ChampionChallengerComparator()
    champ_metrics = {"roc_auc": 0.85, "f1": 0.82}
    chall_metrics = {"roc_auc": 0.81, "f1": 0.79}

    res = comparator.compare_models(
        model_name="deal_predictor",
        champion_version="1.0.0",
        challenger_version="1.1.0",
        champion_metrics=champ_metrics,
        challenger_metrics=chall_metrics
    )

    assert res.recommended == "CHAMPION"
