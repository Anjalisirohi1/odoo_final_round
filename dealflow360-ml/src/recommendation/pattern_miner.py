import pandas as pd
from typing import List
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import fpgrowth

class PatternMiner:
    def __init__(self, min_support: float = 0.02):
        """
        Initializes the PatternMiner.
        :param min_support: Minimum support threshold (0.0 to 1.0).
        """
        self.min_support = min_support
        
    def mine_frequent_itemsets(self, transactions: List[List[str]]) -> pd.DataFrame:
        """
        Mines frequent itemsets from a list of transaction baskets using FP-Growth.
        Returns a DataFrame with columns ['support', 'itemsets'].
        """
        if not transactions:
            return pd.DataFrame(columns=['support', 'itemsets'])
            
        te = TransactionEncoder()
        te_ary = te.fit(transactions).transform(transactions)
        df = pd.DataFrame(te_ary, columns=te.columns_)
        
        # Run FP-Growth
        frequent_itemsets = fpgrowth(df, min_support=self.min_support, use_colnames=True)
        return frequent_itemsets
