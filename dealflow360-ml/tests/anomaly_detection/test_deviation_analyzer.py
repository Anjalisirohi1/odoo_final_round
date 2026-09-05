from src.anomaly_detection.deviation_analyzer import DeviationAnalyzer

def test_deviation_analyzer():
    analyzer = DeviationAnalyzer()
    
    features = {
        'discount_percentage': 50.0,
        'customer_avg_discount': 10.0,
        'discount_customer_deviation': 40.0,
        'margin_percentage': 20.0
    }
    
    signals = analyzer.analyze(features)
    features_found = [s['feature'] for s in signals]
    
    assert "discount_vs_customer_average" in features_found
    assert "discount_vs_margin" in features_found
