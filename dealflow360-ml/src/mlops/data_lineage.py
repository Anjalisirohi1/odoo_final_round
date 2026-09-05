import os
import json
import hashlib
import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from src.schemas.mlops import DatasetLineage
from src.core.config import settings

class DatasetLineageTracker:
    """
    Tracks and persists lineage, schemas, column inventories, and deterministic
    checksums for ML training and evaluation datasets.
    """

    @staticmethod
    def compute_dataset_checksum(df: pd.DataFrame) -> str:
        """
        Computes a deterministic SHA-256 checksum representing dataframe schema, dimensions, and data.
        """
        hasher = hashlib.sha256()
        # Hash column names and dtypes
        schema_str = ",".join([f"{col}:{dtype}" for col, dtype in zip(df.columns, df.dtypes)])
        hasher.update(schema_str.encode("utf-8"))
        hasher.update(f"{df.shape[0]}x{df.shape[1]}".encode("utf-8"))

        # Hash sample or full representation
        if not df.empty:
            # Deterministic string representation of first 500 rows
            sample = df.head(500).to_csv(index=False)
            hasher.update(sample.encode("utf-8"))

        return hasher.hexdigest()

    @staticmethod
    def record_lineage(
        dataset_name: str,
        dataset_version: str,
        df: pd.DataFrame,
        target_column: Optional[str] = None,
        source: str = "SyntheticDataProvider",
        metadata: Optional[Dict[str, Any]] = None,
        lineage_dir: Optional[str] = None
    ) -> DatasetLineage:
        directory = lineage_dir or settings.MLOPS_LINEAGE_DIR
        os.makedirs(directory, exist_ok=True)

        checksum = DatasetLineageTracker.compute_dataset_checksum(df)
        feature_cols = [str(c) for c in df.columns if c != target_column]

        lineage = DatasetLineage(
            dataset_name=dataset_name,
            dataset_version=dataset_version,
            generated_at=datetime.now(timezone.utc).isoformat(),
            row_count=int(df.shape[0]),
            column_count=int(df.shape[1]),
            feature_columns=feature_cols,
            target_column=target_column,
            data_checksum=checksum,
            source=source,
            metadata=metadata or {}
        )

        file_path = os.path.join(directory, f"{dataset_name}_{dataset_version}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(lineage.model_dump(), f, indent=2)

        return lineage

    @staticmethod
    def get_lineage(dataset_name: str, dataset_version: str, lineage_dir: Optional[str] = None) -> Optional[DatasetLineage]:
        directory = lineage_dir or settings.MLOPS_LINEAGE_DIR
        file_path = os.path.join(directory, f"{dataset_name}_{dataset_version}.json")
        if not os.path.exists(file_path):
            return None
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return DatasetLineage(**data)
        except Exception:
            return None
