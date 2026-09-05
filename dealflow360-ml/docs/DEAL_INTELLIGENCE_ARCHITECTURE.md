# Phase 7: AI-05 Unified Deal Intelligence & Actionable Insight Engine Architecture

## 1. Purpose & Problem Statement
DealFlow360 previously operated four distinct AI intelligence microservices:
1. **AI-01 Smart Product Recommendation Engine** (`RecommendationService`)
2. **AI-02 Quotation Anomaly Detection Engine** (`AnomalyDetectionService`)
3. **AI-03 Deal Health Intelligence Engine** (`DealHealthService`)
4. **AI-04 Deal Outcome Prediction & Revenue Forecasting Engine** (`DealPredictionService`)

While each service excels at its specialized analytical task, executive consumers, deal desks, and sales managers require holistic answers in under 30 seconds:
- *What is the complete situation of this deal?*
- *Is there unusual margin or compliance risk?*
- *How likely is the deal to close, and what revenue is at stake?*
- *Which AI models agree and where do signals contradict?*
- *What consolidated next steps should leadership take?*

**Phase 7 (AI-05)** delivers the unified executive orchestration and deterministic insight synthesis layer without retraining models or introducing circular dependencies.

---

## 2. High-Level Architecture

```
                    ┌──────────────────────┐
                    │   API REQUEST        │
                    │ quotation_id         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Unified Context      │
                    │ Builder              │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Deal Intelligence    │
                    │ Orchestrator         │
                    └──────────┬───────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
  Recommendation          Anomaly              Deal Health
      AI-01                AI-02                  AI-03
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                               ▼
                        Prediction
                           AI-04
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Signal Adapters      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Signal Normalizer    │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼──────────────┐
                 ▼                            ▼
        Conflict Detection             Agreement Detection
                 │                            │
                 └─────────────┬──────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Business Impact      │
                    │ Intelligence Score   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Insight Ranking      │
                    │ Action Consolidation │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Deterministic        │
                    │ Insight Synthesis    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ EXECUTIVE DEAL       │
                    │ INTELLIGENCE         │
                    └──────────────────────┘
```

---

## 3. Strict Module Dependency Graph
Phase 7 depends on previous phases. Previous phases NEVER depend on Phase 7. Zero circular dependencies.

```
DealIntelligenceService (Phase 7)
   │
   ├── RecommendationService (Phase 3)
   ├── AnomalyDetectionService (Phase 4)
   ├── DealHealthService (Phase 5)
   └── DealPredictionService (Phase 6)
```

---

## 4. Key Architectural Components

### 4.1 Unified Context Builder (`src/deal_intelligence/context_builder.py`)
Aggregates quotation headers, line items, historical customer orders, customer quotations, sales rep metadata, and timestamped deal interaction events into a single immutable `UnifiedDealContext`.

### 4.2 Signal Adapters (`src/deal_intelligence/adapters.py`)
Converts raw domain outputs from AI-01, AI-02, AI-03, and AI-04 into standard `NormalizedSignal` objects containing normalized scores, signal direction (`POSITIVE`, `NEGATIVE`, `NEUTRAL`), and importance classifications (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

### 4.3 Signal Normalizer (`src/deal_intelligence/normalizer.py`)
Scales raw scores (0–100 for health/priority, 0–1 for probability/anomaly) to standardized bounds while preserving domain semantics and directionality.

### 4.4 Conflict Detection Engine (`src/deal_intelligence/conflict_detector.py`)
Applies deterministic business rules to flag contradictory signals across models (e.g. high probability vs critical health deterioration).

### 4.5 Agreement Detection Engine (`src/deal_intelligence/agreement_detector.py`)
Detects cross-module consensus across prediction, health, and anomaly engines to reinforce managerial decision confidence.

### 4.6 Business Impact Engine (`src/deal_intelligence/business_impact.py`)
Estimates commercial risk exposure and prioritization tier (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) based on expected revenue, total quote value, and anomaly severity.

### 4.7 Intelligence Score Calculator (`src/deal_intelligence/intelligence_score.py`)
Computes an executive decision score bounded strictly between 0 and 100 with dynamic weight re-normalization during module degradation.

### 4.8 Action Consolidator (`src/deal_intelligence/action_consolidator.py`)
Deduplicates recommended actions across health, anomaly, and prediction modules, reconciles conflicts, attaches evidence, and ranks by urgency.

### 4.9 Executive Insight Ranker (`src/deal_intelligence/insight_ranker.py`)
Filters and ranks all candidate signals into top 3–5 high-impact executive insights to prevent cognitive overload.

### 4.10 Intelligence Timeline Builder (`src/deal_intelligence/timeline.py`)
Generates an audit-ready, strictly chronological timeline from real CRM deal events and analytical evaluation timestamps (zero hallucinated events).

### 4.11 Insight Synthesizer (`src/deal_intelligence/synthesizer.py`)
Composes structured executive summaries and sections deterministically using verified signal templates without LLM hallucinations.

---

## 5. Graceful Degradation Strategy
If an underlying module is unavailable (e.g. prediction model not trained or no product recommendations generated), the orchestrator isolates the failure, records the module status as `UNAVAILABLE` or `FAILED`, and synthesizes a complete response from remaining available services.

| Scenario | Service Status | Unified Endpoint Response |
| :--- | :--- | :--- |
| **All Modules Available** | `AVAILABLE` for all | Full intelligence response with consensus and forecast |
| **Prediction Model Not Trained** | `PREDICTION: UNAVAILABLE` | Deal Health, Anomaly, and Recommendations served with normalized scores |
| **No Cross-sell Patterns** | `RECOMMENDATION: UNAVAILABLE` | Prediction, Health, and Anomaly intelligence served |
| **Anomaly Service Failure** | `ANOMALY_DETECTION: FAILED` | Health and Prediction intelligence served; error logged in status |

---

## 6. API Specification

### Endpoint
`POST /api/v1/deal-intelligence/analyze`

### Request Body
```json
{
  "quotation_id": "quote_123"
}
```

### Response Schema
```json
{
  "quotation_id": "quote_123",
  "overall_assessment": {
    "intelligence_score": 74.5,
    "classification": "POSITIVE",
    "business_impact": "HIGH",
    "summary": "Deal demonstrates positive closing viability (Score: 74.5/100)...",
    "confidence": "HIGH"
  },
  "module_status": {
    "RECOMMENDATION": {"status": "AVAILABLE", "latency_ms": 1.2},
    "ANOMALY_DETECTION": {"status": "AVAILABLE", "latency_ms": 2.4},
    "DEAL_HEALTH": {"status": "AVAILABLE", "latency_ms": 3.1},
    "PREDICTION": {"status": "AVAILABLE", "latency_ms": 4.5}
  },
  "key_positive_signals": [...],
  "key_risks": [...],
  "signal_agreements": [...],
  "signal_conflicts": [...],
  "recommended_actions": [...],
  "top_insights": [...],
  "intelligence_timeline": [...],
  "generated_at": "2026-09-05T10:45:00Z"
}
```
