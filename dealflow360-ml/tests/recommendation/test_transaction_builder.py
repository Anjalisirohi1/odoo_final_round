import pandas as pd
from src.recommendation.transaction_builder import TransactionBuilder

def test_build_transactions():
    builder = TransactionBuilder()
    
    orders = pd.DataFrame([
        {'order_id': 'ord_1'},
        {'order_id': 'ord_2'},
        {'order_id': 'ord_3'},
    ])
    
    order_items = pd.DataFrame([
        {'order_id': 'ord_1', 'product_id': 'p2'},
        {'order_id': 'ord_1', 'product_id': 'p1'},
        {'order_id': 'ord_1', 'product_id': 'p2'}, # duplicate
        {'order_id': 'ord_2', 'product_id': 'p3'},
        {'order_id': 'ord_3', 'product_id': None}, # invalid
    ])
    
    transactions = builder.build_transactions(orders, order_items)
    
    assert len(transactions) == 2
    assert transactions[0]['order_id'] == 'ord_1'
    assert transactions[0]['products'] == ['p1', 'p2'] # Sorted and unique
    
    assert transactions[1]['order_id'] == 'ord_2'
    assert transactions[1]['products'] == ['p3']

def test_build_simple_transactions():
    builder = TransactionBuilder()
    orders = pd.DataFrame([{'order_id': 'ord_1'}])
    order_items = pd.DataFrame([{'order_id': 'ord_1', 'product_id': 'p1'}])
    
    simple = builder.build_simple_transactions(orders, order_items)
    assert simple == [['p1']]

def test_empty_input():
    builder = TransactionBuilder()
    assert builder.build_transactions(pd.DataFrame(), pd.DataFrame()) == []
