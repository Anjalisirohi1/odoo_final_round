import os
from pathlib import Path
from src.data.providers.synthetic_provider import SyntheticDataProvider
from src.pipelines.data_pipeline import DataPipeline

def main():
    print("Initializing Synthetic Data Provider...")
    provider = SyntheticDataProvider(
        num_customers=100,
        num_products=50,
        num_quotations=1000,
        seed=42
    )

    pipeline = DataPipeline(provider)
    result = pipeline.run()

    base_dir = Path(__file__).parent.parent
    synthetic_dir = base_dir / "data" / "synthetic"
    processed_dir = base_dir / "data" / "processed"
    
    synthetic_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    # Save raw synthetic data
    print(f"\nSaving raw synthetic datasets to {synthetic_dir} ...")
    for name, df in result.raw_data.items():
        if not df.empty:
            file_path = synthetic_dir / f"{name}.csv"
            df.to_csv(file_path, index=False)
            print(f" - Saved {name}.csv ({len(df)} records)")

    # Save processed features
    print(f"\nSaving processed features to {processed_dir} ...")
    if not result.customer_features.empty:
        result.customer_features.to_csv(processed_dir / "customer_features.csv", index=False)
        print(f" - Saved customer_features.csv ({len(result.customer_features)} records)")
        
    if not result.product_features.empty:
        result.product_features.to_csv(processed_dir / "product_features.csv", index=False)
        print(f" - Saved product_features.csv ({len(result.product_features)} records)")

    print("\nData generation and pipeline run complete.")

if __name__ == "__main__":
    main()
