from src.recommendation.candidate_generator import CandidateGenerator

def test_generate_candidates():
    generator = CandidateGenerator()
    
    rules = [
        {
            "antecedent": ["Desk"],
            "consequent": ["Chair"],
            "support": 0.5,
            "confidence": 0.6,
            "lift": 1.2
        },
        {
            "antecedent": ["Desk"],
            "consequent": ["Monitor Arm"],
            "support": 0.4,
            "confidence": 0.5,
            "lift": 1.5
        },
        {
            "antecedent": ["Chair"],
            "consequent": ["Monitor Arm"],
            "support": 0.3,
            "confidence": 0.7,
            "lift": 1.8
        },
        {
            "antecedent": ["Desk", "Chair"],
            "consequent": ["Lamp"],
            "support": 0.2,
            "confidence": 0.8,
            "lift": 2.0
        }
    ]
    
    # 1. Current = Desk
    candidates = generator.generate_candidates(["Desk"], rules)
    assert len(candidates) == 2
    chair = next(c for c in candidates if c['product_id'] == 'Chair')
    ma = next(c for c in candidates if c['product_id'] == 'Monitor Arm')
    
    assert chair['max_confidence'] == 0.6
    assert ma['max_confidence'] == 0.5
    assert len(chair['supporting_rules']) == 1
    assert chair['association_score'] == 0.6
    
    # 2. Current = Desk, Chair
    candidates2 = generator.generate_candidates(["Desk", "Chair"], rules)
    # Excludes Chair since it's in current
    assert "Chair" not in [c['product_id'] for c in candidates2]
    
    ma2 = next(c for c in candidates2 if c['product_id'] == 'Monitor Arm')
    lamp = next(c for c in candidates2 if c['product_id'] == 'Lamp')
    
    # Monitor arm supported by 2 rules: Desk -> MA, Chair -> MA
    assert len(ma2['supporting_rules']) == 2
    assert ma2['max_confidence'] == 0.7
    assert ma2['max_lift'] == 1.8
    assert ma2['association_score'] == 0.75 # 0.7 + (2-1)*0.05
    
    assert len(lamp['supporting_rules']) == 1
    assert lamp['max_confidence'] == 0.8
