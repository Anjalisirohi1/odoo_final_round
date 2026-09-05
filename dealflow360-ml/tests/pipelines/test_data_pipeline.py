from src.data.providers.synthetic_provider import SyntheticDataProvider
from src.pipelines.data_pipeline import DataPipeline

def test_data_pipeline_end_to_end():
    provider = SyntheticDataProvider(num_customers=5, num_products=5, num_quotations=10, seed=42)
    pipeline = DataPipeline(provider)
    
    result = pipeline.run()
    
    assert result.validation_report['valid'] is True or len(result.validation_report['errors']) > 0
    assert not result.customer_features.empty
    assert not result.product_features.empty
