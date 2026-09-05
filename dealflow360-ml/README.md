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
