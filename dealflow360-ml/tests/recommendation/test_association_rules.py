import pandas as pd
from src.recommendation.pattern_miner import PatternMiner
from src.recommendation.association_rules import AssociationRuleEngine

def test_association_rules():
    transactions = [
        ["Desk", "Chair"],
        ["Desk", "Chair", "Monitor Arm"],
        ["Desk", "Chair", "Monitor Arm", "Lamp"],
        ["Chair", "Lamp"],
        ["Desk", "Lamp"]
    ]
    
    miner = PatternMiner(min_support=0.4) # At least 2/5
    itemsets = miner.mine_frequent_itemsets(transactions)
    
    engine = AssociationRuleEngine(min_confidence=0.5, min_lift=1.0)
    rules = engine.generate_rules(itemsets)
    
    assert len(rules) > 0
    
    # Let's find Desk -> Chair rule
    # Desk appears in 4/5. Desk + Chair appears in 3/5.
    # Confidence (Desk -> Chair) = 0.75
    # Lift = 0.75 / 0.8 (since Chair is in 4/5) = 0.9375
    # Wait, lift is 0.9375, so if min_lift is 1.0, it will be filtered out!
    # Let's check Monitor Arm -> Desk
    # Monitor Arm is in 2/5. Monitor Arm + Desk is in 2/5.
    # Confidence (Monitor Arm -> Desk) = 1.0
    # Lift = 1.0 / 0.8 (Desk support) = 1.25 -> Should be included!
    
    ma_desk_rule = [r for r in rules if r['antecedent'] == ["Monitor Arm"] and r['consequent'] == ["Desk"]]
    assert len(ma_desk_rule) == 1
    assert ma_desk_rule[0]['confidence'] == 1.0
    assert ma_desk_rule[0]['lift'] == 1.25
    assert ma_desk_rule[0]['support'] == 0.4 # 2/5

def test_empty_rules():
    engine = AssociationRuleEngine()
    assert engine.generate_rules(pd.DataFrame(columns=['support', 'itemsets'])) == []
