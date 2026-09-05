# DealFlow360 AI Intelligence Service

This is the AI/ML microservice for the DealFlow360 platform, designed to provide intelligent predictions and decision support for Deal Management and Quotation Intelligence.

## Architecture

The project is built as a highly decoupled FastAPI microservice, ensuring independent deployment and scaling relative to the main backend application.

### Phase 1: API Foundation
- Robust FastAPI setup with dependency injection
- Pydantic Settings management
- Health checks and status endpoints
- CORS and basic routing structure

### Phase 2: Data Engineering Foundation
- **Domain Schemas**: Pydantic models mapping the B2B DealFlow360 entities (Customer, Product, Quotation, Order, etc.)
- **Data Provider Abstraction**: A decoupled interface `DataProvider` allowing hot-swapping between `SyntheticProvider` and future PostgreSQL/API providers.
- **Data Validator**: Validates schemas, business logic (e.g. margin constraints), referential integrity, and temporal logic.
- **Data Cleaner**: Standardizes data, deduplicates, trims strings, and safely parses dates.
- **Feature Builders**: Generate ML-ready features (Customer behavior, Product statistics, Temporal context).
- **Data Pipeline**: Orchestrates fetching, validation, cleaning, and feature generation end-to-end.

### Phase 3: Smart Product Recommendation Engine
- **Decoupled Architecture**: Modular pipeline with `TransactionBuilder`, `PatternMiner` (FP-Growth), `AssociationRuleEngine`, and `CandidateGenerator`.
- **Business-Aware Ranking**: Combines purely statistical association metrics (confidence, lift) with business signals (margin, customer affinity, popularity).
- **Explainability**: Each recommendation is paired with a natural language explanation and confidence level.
- **In-Memory Knowledge Base**: Dynamically initializes at startup to provide low-latency inference over current data constraints.
- **API Integration**: RESTful endpoint (`POST /api/v1/recommendations/`) with Pydantic validation.

### Phase 4: Quotation Anomaly & Risk Detection Engine
- **Isolation Forest & Baseline Modeling**: Unsupervised anomaly detection combined with historical customer/rep baseline deviation tracking.
- **Calibrated Scoring**: Converts decision function scores into normalized $[0.0, 1.0]$ anomaly scores and discrete risk tiers (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Deviation Explanations**: Details exact features contributing to risk (excessive discounts, margin erosion, abnormal volume).
- **API Integration**: RESTful endpoint (`POST /api/v1/anomalies/quotation`).

### Phase 5: Deal Health Intelligence Engine
- **Hybrid Decision Intelligence**: Combines historical customer conversion behavior, engagement recency, commercial financials, temporal momentum, and ML anomaly risks into an executive health index ($0\text{--}100$).
- **Five Health Dimensions**:
  1. *Conversion Potential*: Customer empirical win rates calibrated with account tiers and cold-start priors.
  2. *Engagement Health*: Real-time interaction recency and event volume decay dynamics.
  3. *Financial Health*: Margin discipline, discount penalties, and discount-to-margin ratio.
  4. *Deal Momentum*: Temporal trajectory classification (`STRONG_POSITIVE`, `POSITIVE`, `STABLE`, `DECLINING`, `STAGNANT`).
  5. *Risk Safety*: Direct Python composition with Phase 4 Isolation Forest ($\text{Risk Safety} = 1.0 - \text{anomaly\_score}$).
- **Prescriptive Action Engine**: Generates prioritized next-best-actions with concrete evidence (`FOLLOW_UP_CUSTOMER`, `REVIEW_DISCOUNT`, `ESCALATE_TO_MANAGER`, `PRIORITIZE_DEAL`, `VERIFY_COMMERCIAL_TERMS`, `MONITOR_ACTIVITY`).
- **Explainability**: Transparent, evidence-based strengths, concerns, and momentum diagnostics.
- **API Integration**: RESTful endpoint (`POST /api/v1/deal-health/analyze`).

### Phase 6: Deal Outcome Prediction & Revenue Forecasting Engine
- **Supervised ML Classification**: Evaluates candidate models (Logistic Regression, Random Forest, Gradient Boosting) on leakage-safe historical quotation features to predict conversion win/loss probabilities.
- **Probability & Statistical Confidence**: Computes calibrated conversion probability ($0.0\text{--}1.0$) and decision-boundary distance confidence score (`HIGH`, `MEDIUM`, `LOW`).
- **Probability-Weighted Revenue Forecasting**: $\text{Expected Revenue} = \text{Quotation Value} \times \text{Conversion Probability}$.
- **Deal Priority Engine**: Dynamic multi-factor prioritization balancing win probability, expected revenue, deal health, momentum, and risk penalty (`CRITICAL_ATTENTION`, `HIGH_PRIORITY`, `MEDIUM_PRIORITY`, `LOW_PRIORITY`).
- **Explainability**: Identifies top positive and negative predictive drivers from feature values and model weights.
- **Training CLI & Artifact Lifecycle**: Automated offline training script (`scripts/train_prediction_model.py`) with joblib model and JSON metadata persistence.
- **API Integration**: RESTful endpoint (`POST /api/v1/predictions/deal`).

### Phase 7: AI-05 Unified Deal Intelligence & Actionable Insight Engine
- **Unified Executive Orchestration**: Orchestrates AI-01 (Recommendations), AI-02 (Anomaly Detection), AI-03 (Deal Health), and AI-04 (Outcome Prediction) into a single executive response.
- **Signal Normalization**: Maps multi-modal scores onto standardized scales while preserving domain semantics and directionality (`POSITIVE`, `NEGATIVE`, `NEUTRAL`).
- **Conflict & Agreement Detection**: Deterministic business rules identify cross-module consensus and highlight contradictions (e.g. high probability vs critical health deterioration).
- **Business Impact Scoring**: Quantifies commercial risk exposure and deal priority tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Bounded Intelligence Score**: Deterministic 0–100 executive metric with dynamic weight re-normalization during module degradation.
- **Action Consolidation & Insight Ranking**: Deduplicates recommendations, reconciles conflicts, and ranks top 3–5 executive insights and actions.
- **Audit-Ready Timeline**: Strictly chronological intelligence timeline constructed from verified CRM events and analytical milestones (no hallucinated events).
- **Graceful Degradation**: Isolates individual module unavailability without failing overall executive intelligence requests.
- **API Integration**: RESTful endpoint (`POST /api/v1/deal-intelligence/analyze`).

### Phase 8: AI-06 MLOps, Model Monitoring & Continuous Learning Engine
- **Model Registry & Semantic Versioning**: Manages model lifecycle states (`ACTIVE`, `CANDIDATE`, `ARCHIVED`, `RETIRED`), enforcing single-active model integrity and SHA-256 artifact checksum verification.
- **Dataset Lineage & Training Tracker**: Tracks experiment runs, hyperparameter snapshots, cross-validation metrics, and cryptographic dataset hashes.
- **Prediction Observation & Outcome Feedback**: Asynchronous, non-blocking prediction logging with PII scrubbing and automated binding of realized deal outcomes (`WON`/`LOST`) to predictions.
- **Performance & Drift Monitoring**: Evaluates rolling performance windows (ROC-AUC, Brier score, F1, Accuracy) and computes Population Stability Index (PSI) drift across features and model outputs.
- **Retraining Advisor & Health Scoring**: Bounded 0–100 operational health index and deterministic rule-based retraining guidance (`NO_ACTION`, `MONITOR`, `RETRAIN_RECOMMENDED`, `RETRAIN_HIGH_PRIORITY`).
- **Champion vs Challenger Comparison**: Statistical head-to-head metric benchmarking for safe deployment decisions.
- **API Integration**: RESTful MLOps endpoints (`/api/v1/mlops/models`, `/api/v1/mlops/performance`, `/api/v1/mlops/drift`, `/api/v1/mlops/health`, `/api/v1/mlops/retraining-advice`, `/api/v1/mlops/feedback`).

### Phase 9: Explainable AI (XAI) & Trustworthy Decision Intelligence
- **Multi-Strategy Attribution Engine**: Dynamically introspects active models to execute SHAP, exact linear log-odds attribution, tree feature importances, or heuristic rule-based fallbacks.
- **Centralized Business Feature Mapper**: Systematically translates technical ML features into human-readable business terminology, categories, and natural language explanation templates.
- **Contribution Analyzer & Impact Tiers**: Filters attribution noise and classifies driver strength into intuitive tiers (`VERY_HIGH`, `HIGH`, `MEDIUM`, `LOW`).
- **Explanation Confidence**: Evaluates the stability, concentration, and reliability of generated explanations independently from model prediction certainty.
- **Cross-Module Adapters & Unified XAI**: Standardizes explanations across Prediction, Anomaly Detection, Deal Health, and Product Recommendations, highlighting AI Consensus and AI Conflicts.
- **API Integration**: RESTful endpoints (`POST /api/v1/explanations/prediction`, `GET /api/v1/explanations/prediction/global`, `POST /api/v1/explanations/deal`).



## Installation

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Running the Application

```bash
uvicorn src.main:app --reload
```
Access the API docs at `http://localhost:8000/docs`

## Data Pipeline

The data engineering pipeline provides an end-to-end flow from raw data generation to ML-ready feature sets.

### How to Generate Synthetic Data

Run the generator script from the project root:

```bash
$env:PYTHONPATH="."
python scripts/generate_synthetic_data.py
```

This will:
1. Initialize the `SyntheticDataProvider` with `seed=42`.
2. Generate base domain objects (Customers, Products, Quotations, Orders, etc.).
3. Run the complete `DataPipeline` (Validation -> Cleaning -> Feature Engineering).
4. Save raw datasets to `data/synthetic/` and processed features to `data/processed/`.

### Reproducibility
The synthetic generation process is fully reproducible. Running it multiple times with the same seed will produce identical UUIDs and feature distributions.

### Running Tests

Execute the full test suite using `pytest`:

```bash
$env:PYTHONPATH="."
pytest tests/
```
Tests cover:
- FastAPI health endpoints
- Synthetic Data Provider reproducibility and counts
- DataValidator business rules and relationships
- DataCleaner date parsing and deduplication
- Feature Generation correctness
