import pytest
import pandas as pd
from src.mlops.data_lineage import DatasetLineageTracker

def test_dataset_lineage_checksum_and_record(tmp_path):
    lineage_dir = str(tmp_path / "lineage")

    df = pd.DataFrame({
        "discount_percentage": [10.0, 15.0, 20.0],
        "total_amount": [1000.0, 2000.0, 3000.0],
        "converted": [1, 0, 1]
    })

    # Checksum reproducibility
    sum1 = DatasetLineageTracker.compute_dataset_checksum(df)
    sum2 = DatasetLineageTracker.compute_dataset_checksum(df)
    assert sum1 == sum2
    assert len(sum1) == 64  # SHA-256

    # Record lineage
    lineage = DatasetLineageTracker.record_lineage(
        dataset_name="deal_data",
        dataset_version="v1",
        df=df,
        target_column="converted",
        lineage_dir=lineage_dir
    )

    assert lineage.row_count == 3
    assert lineage.column_count == 3
    assert "discount_percentage" in lineage.feature_columns
    assert "converted" not in lineage.feature_columns
    assert lineage.target_column == "converted"

    # Retrieve lineage
    loaded = DatasetLineageTracker.get_lineage("deal_data", "v1", lineage_dir=lineage_dir)
    assert loaded is not None
    assert loaded.data_checksum == sum1
