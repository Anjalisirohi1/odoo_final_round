from src.anomaly_detection.service import AnomalyDetectionService

def test_anomaly_service_end_to_end():
    service = AnomalyDetectionService({"contamination": 0.1})
    
    historical = [
        {'quotation_id': f'q{i}', 'customer_id': 'c1', 'sales_rep_id': 'r1', 'total_amount': 100 + i * 5, 'total_discount': 5 + (i % 3), 'total_margin': 25 + (i % 4)}
        for i in range(50)
    ]
    
    service.initialize(historical)
    assert service.is_initialized
    
    # Analyze a normal quotation (median historical)
    res_normal = service.analyze_quotation(historical[25])
    assert not res_normal['is_anomaly']
    assert res_normal['risk_level'] in ['LOW', 'MEDIUM']
    
    # Analyze an anomalous quotation (extreme discount)
    anomalous = {'quotation_id': 'q99', 'customer_id': 'c1', 'sales_rep_id': 'r1', 'total_amount': 100, 'total_discount': 90, 'total_margin': 10}
    res_anomaly = service.analyze_quotation(anomalous)
    assert res_anomaly['is_anomaly']
    assert res_anomaly['risk_level'] in ['HIGH', 'CRITICAL']
    assert len(res_anomaly['deviations']) > 0
