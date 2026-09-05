import sys
import os
import logging
from datetime import datetime, timezone

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data.providers.synthetic_provider import SyntheticDataProvider
from src.prediction.dataset_builder import DatasetBuilder
from src.prediction.trainer import ModelTrainer
from src.prediction.model_repository import ModelRepository
from src.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def train_and_persist():
    print("=" * 60)
    print("DEALFLOW360: TRAINING SUPERVISED DEAL PREDICTION MODEL")
    print("=" * 60)
    
    # 1. Generate / Load Datasets
    logger.info("Generating synthetic business dataset for training...")
    provider = SyntheticDataProvider(seed=42, num_customers=100, num_products=50, num_quotations=1000)
    
    quotations = [q.model_dump() for q in provider.get_quotations()]
    customers = [c.model_dump() for c in provider.get_customers()]
    quotation_items = [qi.model_dump() for qi in provider.get_quotation_items()]
    orders = [o.model_dump() for o in provider.get_orders()]
    deal_events = [e.model_dump() for e in provider.get_deal_events()]
    
    # 2. Build Dataset
    logger.info("Building leakage-safe features and binary conversion target...")
    builder = DatasetBuilder()
    X, y = builder.build_dataset(
        quotations=quotations,
        customers=customers,
        quotation_items=quotation_items,
        orders=orders,
        deal_events=deal_events
    )
    
    print(f"\n--- Training Dataset ---")
    print(f"Total Quotations: {len(X)}")
    print(f"Feature Count:    {X.shape[1]}")
    print(f"Conversion Rate:  {y.mean()*100:.1f}% ({y.sum()}/{len(y)})")
    
    # 3. Train & Evaluate Candidates
    logger.info("Training and comparing candidate supervised models...")
    trainer = ModelTrainer(
        test_size=settings.PREDICTION_TEST_SIZE,
        random_state=settings.PREDICTION_RANDOM_STATE,
        selection_metric=settings.PREDICTION_SELECTION_METRIC
    )
    
    results = trainer.train_and_evaluate(X, y)
    
    print("\n--- Model Evaluation Comparison ---")
    for name, metrics in results["evaluation_results"].items():
        print(f"Model: {name:<20} | ROC-AUC: {metrics['roc_auc']:.4f} | F1: {metrics['f1']:.4f} | Acc: {metrics['accuracy']:.4f}")
        
    print(f"\nOptimal Model Selected: {results['best_model_name']}")
    print(f"Best Metrics: {results['best_metrics']}")
    
    # 4. Save Artifacts
    artifact_dir = settings.PREDICTION_MODEL_DIR
    logger.info(f"Persisting model artifacts to {artifact_dir}...")
    model_path = ModelRepository.save_artifacts(
        directory=artifact_dir,
        best_model=results["best_model"],
        preprocessor=results["preprocessor"],
        best_model_name=results["best_model_name"],
        best_metrics=results["best_metrics"],
        dataset_info=results["dataset_info"],
        all_evaluations=results["evaluation_results"]
    )
    
    print(f"\nModel artifact successfully saved to: {model_path}")
    print("=" * 60)

if __name__ == "__main__":
    train_and_persist()
