import pandas as pd
from src.recommendation.pattern_miner import PatternMiner

def test_pattern_miner():
    transactions = [
        ["Desk", "Chair", "Monitor Arm"],
        ["Desk", "Chair"],
        ["Desk", "Chair", "Lamp"],
        ["Lamp", "Chair"]
    ]
    
    # "Desk" is in 3/4 = 0.75
    # "Chair" is in 4/4 = 1.0
    # "Lamp" is in 2/4 = 0.5
    # "Monitor Arm" is in 1/4 = 0.25
    
    miner = PatternMiner(min_support=0.5)
    itemsets = miner.mine_frequent_itemsets(transactions)
    
    assert not itemsets.empty
    
    # Convert frozensets to sets for easier testing
    itemsets['itemsets_set'] = itemsets['itemsets'].apply(set)
    
    # Check single items
    assert any(itemsets['itemsets_set'] == {"Desk"})
    assert any(itemsets['itemsets_set'] == {"Chair"})
    assert any(itemsets['itemsets_set'] == {"Lamp"})
    assert not any(itemsets['itemsets_set'] == {"Monitor Arm"}) # Below 0.5 support
    
    # Check combinations
    assert any(itemsets['itemsets_set'] == {"Desk", "Chair"})
    
    # Desk + Chair support = 3/4 = 0.75
    dc_support = itemsets[itemsets['itemsets_set'] == {"Desk", "Chair"}]['support'].iloc[0]
    assert dc_support == 0.75

def test_pattern_miner_empty():
    miner = PatternMiner()
    itemsets = miner.mine_frequent_itemsets([])
    assert itemsets.empty
    assert list(itemsets.columns) == ['support', 'itemsets']
