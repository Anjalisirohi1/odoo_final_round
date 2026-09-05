from src.data.providers.synthetic_provider import SyntheticDataProvider

def test_synthetic_provider_counts():
    provider = SyntheticDataProvider(num_customers=10, num_products=5, num_quotations=20, seed=123)
    assert len(provider.get_customers()) == 10
    assert len(provider.get_products()) == 5
    assert len(provider.get_quotations()) == 20
    assert len(provider.get_sales_representatives()) == 10
    assert len(provider.get_warehouses()) == 4

def test_synthetic_provider_reproducibility():
    p1 = SyntheticDataProvider(num_customers=5, num_products=5, num_quotations=10, seed=42)
    p2 = SyntheticDataProvider(num_customers=5, num_products=5, num_quotations=10, seed=42)
    
    assert p1.get_customers()[0].customer_id == p2.get_customers()[0].customer_id
    assert p1.get_quotations()[0].quotation_id == p2.get_quotations()[0].quotation_id

def test_relationships():
    provider = SyntheticDataProvider(num_customers=5, num_products=5, num_quotations=10, seed=42)
    cust_ids = {c.customer_id for c in provider.get_customers()}
    rep_ids = {r.sales_rep_id for r in provider.get_sales_representatives()}
    
    for q in provider.get_quotations():
        assert q.customer_id in cust_ids
        assert q.sales_rep_id in rep_ids
