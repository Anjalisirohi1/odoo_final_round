# Phase 5: Deal Health Intelligence Engine — Implementation Plan

## Overview
This document outlines the step-by-step implementation sequence for Phase 5 (Deal Health Intelligence Engine). Each step is atomic, modular, test-driven, and designed for zero-regression integration into the `dealflow360-ml` microservice.

---

## Step 1: Define Schemas & Domain Contracts
- **File**: `src/schemas/deal_health.py`
- **Responsibilities**:
  - Define `DealHealthRequest` (`quotation_id: str`).
  - Define `DimensionScores` (`conversion_potential`, `engagement_health`, `financial_health`, `deal_momentum`, `risk_safety`).
  - Define `RecommendedAction` (`action`, `priority`, `reason`, `evidence`).
  - Define `DealHealthResponse` (`quotation_id`, `health_score`, `classification`, `momentum`, `dimension_scores`, `strengths`, `concerns`, `recommended_actions`, `calculated_at`).
- **Dependencies**: Pydantic v2.

---

## Step 2: Context Construction (`DealContextBuilder`)
- **File**: `src/deal_health/context_builder.py`
- **Responsibilities**:
  - Given a `quotation_id` and business datasets (quotations, customers, quotation_items, orders, deal_events, sales_reps), assemble a unified `DealContext` dataclass/dictionary.
  - Handle missing data gracefully with defensive defaults.

---

## Step 3: Implement Independent Dimension Scorers
1. **Conversion Scorer** (`src/deal_health/conversion_scorer.py`):
   - Computes conversion potential $[0.0, 1.0]$ based on customer historical conversion and tier multiplier.
   - Generates conversion strengths/concerns.
2. **Engagement Scorer** (`src/deal_health/engagement_scorer.py`):
   - Evaluates event recency, event frequency, and client interaction types.
   - Generates engagement strengths/concerns.
3. **Financial Scorer** (`src/deal_health/financial_scorer.py`):
   - Evaluates discount %, margin %, and discount-to-margin ratio.
   - Generates profitability strengths/concerns.

---

## Step 4: Implement Risk Integrator
- **File**: `src/deal_health/risk_integrator.py`
- **Responsibilities**:
  - Interfaces directly with `AnomalyDetectionService.analyze_quotation`.
  - Maps `anomaly_score` $\to$ `risk_safety = 1.0 - anomaly_score`.
  - Extracts key anomaly deviations as risk concerns.

---

## Step 5: Implement Momentum Analyzer
- **File**: `src/deal_health/momentum_analyzer.py`
- **Responsibilities**:
  - Classifies temporal momentum into `STRONG_POSITIVE`, `POSITIVE`, `STABLE`, `DECLINING`, or `STAGNANT`.
  - Maps momentum category to numerical score $[0.0, 1.0]$.

---

## Step 6: Implement Health Aggregator & Classifier
1. **Health Aggregator** (`src/deal_health/health_aggregator.py`):
   - Applies weighted linear aggregation ($w_1 D_1 + \dots + w_5 D_5$).
   - Multiplies by 100 and clips to $[0.0, 100.0]$.
2. **Health Classifier** (`src/deal_health/health_classifier.py`):
   - Deterministic tier mapping: `EXCELLENT` (80–100), `HEALTHY` (60–79.99), `AT_RISK` (40–59.99), `CRITICAL` (0–39.99).

---

## Step 7: Implement Action Intelligence & Explainer
1. **Action Engine** (`src/deal_health/action_engine.py`):
   - Evaluates rules against dimension scores, deviations, and momentum.
   - Emits prioritized action objects (`REENGAGE_CUSTOMER`, `REVIEW_DISCOUNT`, `ESCALATE_TO_MANAGER`, `PRIORITIZE_DEAL`, etc.).
2. **Deal Health Explainer** (`src/deal_health/explainer.py`):
   - Compiles executive summary, primary strengths, and critical concerns.

---

## Step 8: Implement Deal Health Orchestration Service
- **File**: `src/deal_health/service.py`
- **Responsibilities**:
  - Orchestrates `DealHealthService` lifecycle and inference.
  - Holds reference to initialized `AnomalyDetectionService` and business dataset store.
  - Implements `evaluate_deal_health(quotation_id: str) -> Dict[str, Any]`.

---

## Step 9: Integrate with FastAPI Application & Routing
1. **Configuration**: Add Phase 5 weight parameters to `src/core/config.py`.
2. **Lifespan Initialization**: Instantiate and initialize `DealHealthService` in `src/main.py` (`app.state.deal_health_service`).
3. **API Router**: Create `src/api/v1/deal_health.py` with `POST /api/v1/deal-health/analyze` and register in `src/api/v1/router.py`.

---

## Step 10: Unit & Integration Testing
1. **Unit Tests**:
   - `tests/deal_health/test_context_builder.py`
   - `tests/deal_health/test_conversion_scorer.py`
   - `tests/deal_health/test_engagement_scorer.py`
   - `tests/deal_health/test_financial_scorer.py`
   - `tests/deal_health/test_momentum_analyzer.py`
   - `tests/deal_health/test_risk_integrator.py`
   - `tests/deal_health/test_health_aggregator.py`
   - `tests/deal_health/test_action_engine.py`
   - `tests/deal_health/test_deal_health_service.py`
2. **API Tests**:
   - `tests/api/test_deal_health_api.py` (success, not found, uninitialized, edge cases).
3. **Regression Testing**:
   - Ensure all existing 41 tests for Phase 0–4 pass without regression.
