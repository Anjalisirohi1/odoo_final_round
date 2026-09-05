# DealFlow360 — MLOps & Model Governance Architecture (Phase 8: AI-06)

## 1. Executive Summary

Phase 8 introduces production-grade model lifecycle management, monitoring, drift detection, and continuous learning advisory governance for DealFlow360 ML microservice. The architecture adheres strictly to offline-first, testable, deterministic design patterns without external platform lock-in (no cloud API dependencies, no heavyweight orchestration clusters).

---

## 2. Core Architectural Components

```
+---------------------------------------------------------------------------------------+
|                                    FastAPI Service                                    |
|   /api/v1/mlops/models        /api/v1/mlops/performance        /api/v1/mlops/health   |
|   /api/v1/mlops/drift         /api/v1/mlops/retraining-advice  /api/v1/mlops/feedback |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                     MLOpsService                                      |
|  (Central Facade managing Registry, Tracking, Observation Logging, Drift, and Health) |
+----+--------------------+-------------------+--------------------+--------------------+
     |                    |                   |                    |
     v                    v                   v                    v
+-----------+    +-----------------+    +-------------+    +---------------+
|   Model   |    |    Training     |    | Prediction  |    |  Performance  |
| Registry  |    |     Tracker     |    | Observation |    | & Degradation |
+-----+-----+    +--------+--------+    |   Logger    |    |    Monitor    |
      |                   |             +------+------+    +-------+-------+
      |                   |                    |                   |
      v                   v                    v                   v
+---------------------------------------------------------------------------------------+
|                            Artifact Storage & JSONL Stores                            |
|  artifacts/model_registry.json     artifacts/training_runs.jsonl                      |
|  artifacts/prediction_logs/        artifacts/models/deal_outcome_prediction/          |
+---------------------------------------------------------------------------------------+
```

### 2.1 Model Registry & Versioning
- **Semantic Versioning**: Adheres to `MAJOR.MINOR.PATCH` with validation and sorting.
- **State Machine**: Supports `ACTIVE`, `CANDIDATE`, `ARCHIVED`, `RETIRED`.
- **Single-Active Enforcement**: Exactly one model version per model type can hold the `ACTIVE` status at any time. Activating a candidate automatically transitions previous active instances to `ARCHIVED`.
- **Integrity Verification**: Generates and verifies SHA-256 checksums of trained model artifact files before loading or activation.

### 2.2 Dataset Lineage Tracker
- Tracks training datasets with cryptographic SHA-256 fingerprinting, record count, feature column snapshots, and target distribution schemas.
- Links training runs directly to their input data lineage.

### 2.3 Training Experiment Tracker
- Records experiment runs with status (`RUNNING`, `COMPLETED`, `FAILED`), hyperparameter snapshots, cross-validation metrics, duration, git commit, and artifact locations.

### 2.4 Non-Blocking Prediction Logging & Feedback Loop
- **Non-blocking Observation Logging**: Inferences made by `DealPredictionService` are appended to JSON Lines logs with PII scrubbing (customer IDs are hashed). Failure to log never breaks predictions.
- **Feedback Ingestion**: As deals close in CRM/ERP, `POST /api/v1/mlops/feedback` binds actual deal outcomes (`WON`/`LOST`) and realized revenue to predictions.

---

## 3. Monitoring & Drift Engine

- **Performance Monitor**: Evaluates rolling windows of resolved predictions (Accuracy, Precision, Recall, F1, ROC-AUC, Brier Score, Revenue MAE/MAPE).
- **Performance Degradation Detector**: Compares live rolling metrics against baseline training metrics.
- **Drift Detector**: Implements Population Stability Index (PSI) across numerical and categorical features as well as prediction output probability distributions.

---

## 4. Retraining Advisor & Model Health

- **Model Health Score (0–100)**: Multi-component weighted operational score incorporating accuracy, drift penalties, sample feedback volume, and model age.
- **Retraining Advisor**: Deterministic rule-based engine providing actionable recommendations (`NO_ACTION`, `MONITOR`, `RETRAIN_RECOMMENDED`, `RETRAIN_HIGH_PRIORITY`).
- **Champion vs Challenger Comparator**: Compares candidate models against active champions across key statistical metrics.
