# DealFlow360 — AI/ML Microservice Architecture & System Blueprint

DealFlow360 is an enterprise Quotation & Deal Intelligence platform. This repository houses the dedicated, production-ready AI/ML intelligence microservice (`dealflow360-ml`).

---

## 🏗️ 1. Repository Structure

```text
FINAL-ROUND/
├── dealflow360-ml/                      # Core AI/ML Microservice Codebase
│   ├── artifacts/                       # Persisted ML Models, Metadata, & Registry Logs
│   │   ├── prediction/                  # Serialized Outcome Prediction Models & Metadata
│   │   ├── prediction_logs/             # Real-time Production Prediction Audit Logs (JSONL)
│   │   └── registry/                    # Continuous Learning Local Model Registry
│   │
│   ├── data/                            # Synthetic & Test Data Stores
│   │
│   ├── docs/                            # Architectural Specifications & System Contracts
│   │   ├── AI_ARCHITECTURE.md           # Multi-layered System Overview
│   │   ├── API_CONTRACT.md              # RESTful API Schema Contracts
│   │   ├── CONFLICT_DETECTION_RULES.md  # Multi-Model Consensus & Contradiction Rules
│   │   ├── CONTINUOUS_LEARNING.md       # Safe Continuous Learning Lifecycle Specs
│   │   ├── DATA_CONTRACT.md             # Canonical Data Schema Specifications
│   │   ├── DEAL_INTELLIGENCE_ARCHITECTURE.md # Unified Intelligence Architecture
│   │   ├── DRIFT_DETECTION.md           # Statistical Drift Detection (PSI, KS, EMD)
│   │   ├── INTELLIGENCE_SCORING.md      # Multi-dimensional Weighting & Scoring Rules
│   │   ├── MLOPS_ARCHITECTURE.md        # Model Governance & Observability Specs
│   │   ├── PHASE_5_ARCHITECTURE_REVIEW.md # Deal Health Decision Intelligence System
│   │   └── PHASE_9_XAI_ARCHITECTURE.md  # Explainable AI & Trustworthy Intelligence
│   │
│   ├── scripts/                         # Offline Training & Batch Pipeline CLI Scripts
│   │   └── train_prediction_model.py    # Leakage-safe Deal Outcome Training CLI
│   │
│   ├── src/                             # Microservice Source Modules (Layered Architecture)
│   │   ├── anomaly_detection/           # Phase 4: Isolation Forest Quotation Anomaly Engine
│   │   ├── api/                         # FastAPI REST Endpoints (v1 Router)
│   │   │   └── v1/                      # Version 1 Resource Routers
│   │   ├── core/                        # Settings, Logging, Constants & Security
│   │   ├── data/                        # Ingestion, Preprocessing & Validation Pipelines
│   │   ├── deal_health/                 # Phase 5: Deal Health Intelligence & Action Engine
│   │   ├── deal_intelligence/           # Phase 7: Unified Multi-Engine Orchestrator
│   │   ├── domain/                      # Phase 10: Canonical Enterprise Domain Entities
│   │   ├── explainability/              # Phase 9: Explainable AI (XAI) & Drivers Engine
│   │   ├── features/                    # Leakage-safe Feature Extraction Pipelines
│   │   ├── integrations/                # Phase 10: Enterprise DB Adapters & Mappers
│   │   ├── mlops/                       # Phase 8: Drift, Monitoring, Health & Registry
│   │   ├── pipelines/                   # End-to-End Orchestrated ETL & ML Pipelines
│   │   ├── prediction/                  # Phase 6: Deal Outcome & Revenue Forecaster
│   │   ├── recommendation/              # Phase 3: FP-Growth Product Recommendation Engine
│   │   ├── schemas/                     # Strict Pydantic Data Contracts & Payloads
│   │   └── main.py                      # FastAPI Application Lifespan & Service Lifecycle
│   │
│   ├── tests/                           # 100% Comprehensive Pytest Test Suites (188 Passing)
│   ├── requirements.txt                 # Microservice Dependencies
│   ├── Procfile                         # Process File for Microservice Deployments
│   └── render.yaml                      # Render Blueprint Configuration
│
├── main.py                              # Root Execution Entrypoint
├── render.yaml                          # Root Cloud Deployment Blueprint
├── requirements.txt                     # Root Dependencies Shim
├── Procfile                             # Root Deployment Procfile
└── .python-version                      # Python Runtime Pin (3.11.9)
```

---

## 🔄 2. End-to-End Intelligence Flow

```text
 [ CRM Quotation Event ]
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LAYER 1: DATA & DOMAIN INGESTION                      │
│   Canonical Domain Models (Customer, Quotation, Order, Product, Activity)   │
│   Data Validation ➔ Data Cleaning ➔ Feature Engineering (Customer, SKU, Time)│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LAYER 2: SPECIALIZED INTELLIGENCE ENGINES                │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │ Phase 3: Smart Recs  │  │ Phase 4: Anomaly Det │  │ Phase 6: Outcome  │  │
│  │ FP-Growth Cross-Sell │  │ Isolation Forest Risk│  │ Win Probability & │  │
│  │ Basket Lift Mining   │  │ Pricing Deviation    │  │ Revenue Forecast  │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
└─────────────┼─────────────────────────┼────────────────────────┼────────────┘
              │                         │                        │
              ▼                         ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               LAYER 3: HYBRID DECISION INTELLIGENCE (Phase 5)                │
│   Deal Health Scoring (0–100) ➔ Conversion, Engagement, Momentum & Safety  │
│   Prescriptive Actions (Follow Up, Review Discount, Escalate to Manager)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│           LAYER 4: UNIFIED INTELLIGENCE ORCHESTRATION (Phase 7)             │
│   Signal Normalizer ➔ Multi-Engine Score Aggregation                        │
│   Agreement Detector ➔ Cross-Engine Consensus Verification                  │
│   Conflict Detector ➔ Contradiction & Risk Flags                            │
│   Executive Summary ➔ Prioritized Deal Insight Timeline                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│        LAYER 5: EXPLAINABILITY (Phase 9) & MLOPS GOVERNANCE (Phase 8)       │
│                                                                             │
│  ┌─────────────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ Explainable AI (XAI)                │ │ MLOps Continuous Learning      │ │
│  │ - Positive / Negative Drivers       │ │ - Real-time Prediction Audit   │ │
│  │ - SHAP / Tree Contribution Weights  │ │ - Covariate & Drift Detection  │ │
│  │ - Unified Multi-Engine Explanation  │ │ - Closed-Loop Ground Truth     │ │
│  │ - Glass-Box Business Reasoning      │ │ - Safe Champion-Challenger     │ │
│  └─────────────────────────────────────┘ └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 3. Quickstart & Local Execution

### **1. Environment Setup**
```bash
# Clone the repository
git clone https://github.com/Anjalisirohi1/odoo_final_round.git
cd odoo_final_round/dealflow360-ml

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### **2. Running Tests**
```bash
pytest -v
# Output: 188 passed in ~22s
```

### **3. Starting the Local FastAPI Service**
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📊 4. API Endpoints Map

| Category | Endpoint | Method | Description |
| :--- | :--- | :---: | :--- |
| **System** | `/health` | `GET` | Service & knowledge base health check |
| **System** | `/api/v1/status` | `GET` | Detailed microservice status & version |
| **Recommendations** | `/api/v1/recommendations/` | `POST` | Smart cross-sell product suggestions via FP-Growth |
| **Anomalies** | `/api/v1/anomalies/quotation` | `POST` | Quotation pricing & discount anomaly detection |
| **Deal Health** | `/api/v1/deal-health/analyze` | `POST` | 5-dimension health index & prescriptive next actions |
| **Predictions** | `/api/v1/predictions/deal-outcome` | `POST` | Deal win probability & expected revenue forecast |
| **Intelligence** | `/api/v1/deal-intelligence/deal/{id}` | `POST` | 360° cross-engine unified intelligence briefing |
| **Explainability** | `/api/v1/explanations/prediction` | `POST` | Local positive/negative drivers for deal outcome |
| **Explainability** | `/api/v1/explanations/prediction/global`| `GET` | Global dataset feature importance ranking |
| **Explainability** | `/api/v1/explanations/deal` | `POST` | Cross-engine decision explanation & AI consensus |
| **MLOps** | `/api/v1/mlops/models` | `GET` | List all registered model versions |
| **MLOps** | `/api/v1/mlops/models/{name}/health` | `GET` | 0–100 composite model operational health score |
| **MLOps** | `/api/v1/mlops/models/{name}/drift` | `GET` | Statistical feature & prediction drift (PSI/KS) |
| **MLOps** | `/api/v1/mlops/models/{name}/performance`| `GET` | Rolling accuracy, ROC-AUC, & Brier score report |
| **MLOps** | `/api/v1/mlops/feedback` | `POST` | Ingest closed-loop ground truth (Won/Lost actuals) |
| **MLOps** | `/api/v1/mlops/models/{name}/retraining-advice`| `GET` | Governed continuous learning retraining advice |
| **MLOps** | `/api/v1/mlops/models/{name}/compare` | `POST` | Side-by-side Champion vs Challenger comparison |
| **MLOps** | `/api/v1/mlops/models/{name}/{ver}/activate`| `POST` | Controlled model promotion/activation |
