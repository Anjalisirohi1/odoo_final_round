import pandas as pd
import logging
from typing import Dict, Any, List

from src.schemas.recommendation import RecommendationRequest, RecommendationResponse, RecommendationItem, ModelMetadata
from src.recommendation.transaction_builder import TransactionBuilder
from src.recommendation.pattern_miner import PatternMiner
from src.recommendation.association_rules import AssociationRuleEngine
from src.recommendation.candidate_generator import CandidateGenerator
from src.recommendation.ranker import RecommendationRanker
from src.recommendation.explainer import RecommendationExplainer

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self, config: Dict[str, float] = None):
        if config is None:
            config = {
                "min_support": 0.02,
                "min_confidence": 0.30,
                "min_lift": 1.0,
                "max_results": 10
            }
        
        self.config = config
        
        self.transaction_builder = TransactionBuilder()
        self.pattern_miner = PatternMiner(min_support=self.config.get("min_support", 0.02))
        self.rule_engine = AssociationRuleEngine(
            min_confidence=self.config.get("min_confidence", 0.30),
            min_lift=self.config.get("min_lift", 1.0)
        )
        self.candidate_generator = CandidateGenerator()
        self.ranker = RecommendationRanker()
        self.explainer = RecommendationExplainer()
        
        # In-memory knowledge base
        self.is_initialized = False
        self.association_rules: List[Dict[str, Any]] = []
        
        # Product Metadata Caches
        self.product_margins: Dict[str, float] = {}
        self.product_popularities: Dict[str, float] = {}
        self.product_names: Dict[str, str] = {}
        self.product_categories: Dict[str, str] = {}
        
        # Customer Context Caches (mocked affinity for now based on actual history)
        self.customer_affinity: Dict[str, Dict[str, float]] = {}

    def build_knowledge_base(self, orders_df: pd.DataFrame, order_items_df: pd.DataFrame, products_df: pd.DataFrame, customers_df: pd.DataFrame):
        """
        Builds transactions, runs FP-Growth, generates rules, and caches metadata.
        """
        try:
            logger.info("Initializing recommendation knowledge base...")
            
            # 1. Cache Product Metadata
            if not products_df.empty:
                for _, row in products_df.iterrows():
                    pid = row['product_id']
                    self.product_names[pid] = row['product_name']
                    self.product_categories[pid] = row['category']
                    # Calculate margin
                    price = row.get('selling_price', row.get('base_price', 1.0))
                    cost = row.get('cost_price', 0.8 * price)
                    margin = (price - cost) / price if price > 0 else 0
                    self.product_margins[pid] = margin
                    
            # Calculate basic popularity from order_items
            if not order_items_df.empty:
                counts = order_items_df['product_id'].value_counts()
                max_count = counts.max()
                if max_count > 0:
                    for pid, count in counts.items():
                        self.product_popularities[pid] = count / max_count
                        
            # Build basic customer affinity
            if not order_items_df.empty and not orders_df.empty:
                # Join orders to items to get customer_id
                merged = pd.merge(order_items_df, orders_df[['order_id', 'customer_id']], on='order_id', how='inner')
                # For simplicity, if a customer bought a product, give them affinity 1.0 for it.
                # In real scenario, it'd be category based.
                for _, row in merged.iterrows():
                    cid = row['customer_id']
                    pid = row['product_id']
                    if cid not in self.customer_affinity:
                        self.customer_affinity[cid] = {}
                    self.customer_affinity[cid][pid] = 1.0

            # 2. Build Transactions
            logger.info("Building transactions...")
            transactions = self.transaction_builder.build_simple_transactions(orders_df, order_items_df)
            logger.info(f"Built {len(transactions)} transactions.")
            
            # 3. Mine Patterns
            logger.info(f"Mining patterns with min_support={self.pattern_miner.min_support}")
            frequent_itemsets = self.pattern_miner.mine_frequent_itemsets(transactions)
            logger.info(f"Found {len(frequent_itemsets)} frequent itemsets.")
            
            # 4. Generate Rules
            logger.info(f"Generating rules with min_confidence={self.rule_engine.min_confidence}")
            self.association_rules = self.rule_engine.generate_rules(frequent_itemsets)
            logger.info(f"Generated {len(self.association_rules)} rules.")
            
            self.is_initialized = True
            logger.info("Recommendation knowledge base successfully initialized.")
            
        except Exception as e:
            logger.error(f"Failed to initialize recommendation knowledge base: {str(e)}")
            self.is_initialized = False

    def get_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """
        Serves recommendations based on the cached knowledge base.
        """
        if not self.is_initialized:
            raise RuntimeError("Recommendation service is not initialized or unavailable.")
            
        # Deduplicate and sort current products for determinism
        current_products = sorted(list(set(request.product_ids)))
        
        # Candidate Generation
        candidates = self.candidate_generator.generate_candidates(current_products, self.association_rules)
        total_candidates = len(candidates)
        
        if total_candidates == 0:
            return RecommendationResponse(
                recommendations=[],
                total_candidates=0,
                model_metadata=ModelMetadata(
                    algorithm="FP-Growth + Association Rules",
                    knowledge_base_version="in-memory-v1"
                )
            )
            
        # Ranking
        cust_affinity = self.customer_affinity.get(request.customer_id, {}) if request.customer_id else {}
        
        ranked_candidates = self.ranker.rank(
            candidates=candidates,
            product_margins=self.product_margins,
            customer_affinity=cust_affinity,
            product_popularity=self.product_popularities
        )
        
        # Formatting and Explanation
        limit = min(request.limit, self.config.get("max_results", 10))
        top_candidates = ranked_candidates[:limit]
        
        response_items = []
        for c in top_candidates:
            pid = c["product_id"]
            reason, conf = self.explainer.generate_explanation(c, self.product_names)
            
            item = RecommendationItem(
                product_id=pid,
                product_name=self.product_names.get(pid, pid),
                category=self.product_categories.get(pid, "Unknown"),
                score=round(c.get("final_score", 0.0), 4),
                confidence=conf,
                reason=reason,
                expected_margin=round(c.get("expected_margin", 0.0), 4)
            )
            response_items.append(item)
            
        return RecommendationResponse(
            recommendations=response_items,
            total_candidates=total_candidates,
            model_metadata=ModelMetadata(
                algorithm="FP-Growth + Association Rules",
                knowledge_base_version="in-memory-v1"
            )
        )
