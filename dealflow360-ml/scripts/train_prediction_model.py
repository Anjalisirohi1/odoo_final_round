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
from src.mlops.data_lineage import DatasetLineageTracker
from src.mlops.training_tracker import TrainingTracker
from src.mlops.model_registry import ModelRegistry
from src.mlops.versioning import ModelVersioning
from src.schemas.mlops import ModelRegistryEntry, ModelStatus
from src.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def train_and_persist():
    print("=" * 60)
    print("DEALFLOW360: TRAINING SUPERVISED DEAL PREDICTION MODEL")
    print("=" * 60)

    tracker = TrainingTracker()
    registry = ModelRegistry()

    # Determine next model version
    active_model = registry.get_active_model("deal_outcome_prediction")
    latest_models = registry.list_models("deal_outcome_prediction")
    if latest_models:
        latest_version = latest_models[-1].model_version
        model_version = ModelVersioning.increment_minor(latest_version)
    else:
        model_version = "1.0.0"

    dataset_version = f"synthetic_{datetime.now(timezone.utc).strftime('%Y%m%d')}"

    # 1. Start Training Run
    training_run = tracker.start_run(
        model_name="deal_outcome_prediction",
        model_version=model_version,
        dataset_version=dataset_version
    )
    logger.info(f"Started training run {training_run.run_id} for model v{model_version}")

    try:
        # 2. Generate / Load Datasets
        logger.info("Generating synthetic business dataset for training...")
        provider = SyntheticDataProvider(seed=42, num_customers=100, num_products=50, num_quotations=1000)
        
        quotations = [q.model_dump() for q in provider.get_quotations()]
        customers = [c.model_dump() for c in provider.get_customers()]
        quotation_items = [qi.model_dump() for qi in provider.get_quotation_items()]
        orders = [o.model_dump() for o in provider.get_orders()]
        deal_events = [e.model_dump() for e in provider.get_deal_events()]
        
        # 3. Build Dataset & Record Lineage
        logger.info("Building leakage-safe features and binary conversion target...")
        builder = DatasetBuilder()
        X, y = builder.build_dataset(
            quotations=quotations,
            customers=customers,
            quotation_items=quotation_items,
            orders=orders,
            deal_events=deal_events
        )

        # Track Dataset Lineage
        df_full = X.copy()
        df_full["converted"] = y
        lineage = DatasetLineageTracker.record_lineage(
            dataset_name="deal_prediction_training",
            dataset_version=dataset_version,
            df=df_full,
            target_column="converted",
            source="SyntheticDataProvider"
        )
        logger.info(f"Recorded dataset lineage with checksum {lineage.data_checksum[:12]}...")
        
        print(f"\n--- Training Dataset ---")
        print(f"Total Quotations: {len(X)}")
        print(f"Feature Count:    {X.shape[1]}")
        print(f"Conversion Rate:  {y.mean()*100:.1f}% ({y.sum()}/{len(y)})")
        
        # 4. Train & Evaluate Candidates
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
        
        # 5. Save Artifacts
        artifact_dir = settings.PREDICTION_MODEL_DIR
        logger.info(f"Persisting model artifacts to {artifact_dir}...")
        model_path = ModelRepository.save_artifacts(
            directory=artifact_dir,
            best_model=results["best_model"],
            preprocessor=results["preprocessor"],
            best_model_name=results["best_model_name"],
            best_metrics=results["best_metrics"],
            dataset_info=results["dataset_info"],
            all_evaluations=results["evaluation_results"],
            model_version=model_version
        )

        from src.mlops.artifact_integrity import ArtifactIntegrity
        checksum = ArtifactIntegrity.compute_checksum(model_path)

        # 6. Complete Training Run
        tracker.complete_run(
            run_id=training_run.run_id,
            candidate_models=results["evaluation_results"],
            selected_model=results["best_model_name"],
            metrics=results["best_metrics"],
            artifact_path=model_path,
            validation_samples=int(len(X) * settings.PREDICTION_TEST_SIZE)
        )

        # 7. Register Model in Model Registry
        is_first_model = (active_model is None)
        registry_entry = ModelRegistryEntry(
            model_name="deal_outcome_prediction",
            model_version=model_version,
            status=ModelStatus.ACTIVE if is_first_model else ModelStatus.CANDIDATE,
            created_at=datetime.now(timezone.utc).isoformat(),
            trained_at=results["dataset_info"].get("trained_at"),
            training_dataset_version=dataset_version,
            training_samples=len(X),
            feature_count=X.shape[1],
            algorithm=results["best_model_name"],
            metrics=results["best_metrics"],
            artifact_path=model_path,
            checksum=checksum,
            is_active=is_first_model
        )
        registry.register_model(registry_entry)
        
        print(f"\nModel artifact successfully saved to: {model_path}")
        print(f"Registered in MLOps Registry: version {model_version} (Status: {registry_entry.status.value})")
        print("=" * 60)

    except Exception as e:
        logger.error(f"Training run failed: {e}")
        tracker.fail_run(training_run.run_id, str(e))
        raise e

if __name__ == "__main__":
    train_and_persist()

