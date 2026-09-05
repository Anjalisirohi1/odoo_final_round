# Phase 5: Deal Health Intelligence Engine — Architecture Review & System Design

## 1. Executive Summary & Context

DealFlow360 is an enterprise Quotation and Deal Intelligence platform. The AI/ML microservice (`dealflow360-ml`) operates as an independent, high-performance intelligence backend. 

Prior phases established:
- **Phase 0 & 1**: Microservice foundation, FastAPI routing, configuration, Pydantic domain models, and testing framework.
- **Phase 2**: Data engineering pipelines, synthetic business data generation (`SyntheticDataProvider`), data validation, cleaning, and domain feature extraction.
- **Phase 3**: **AI-01 Smart Product Recommendation Engine** (FP-Growth pattern mining, association rule mining, margin-aware candidate ranking, and explainability).
- **Phase 4**: **AI-02 Quotation Anomaly & Risk Detection Engine** (Isolation Forest, customer/rep baseline deviation modeling, calibrated [0.0, 1.0] anomaly scoring, risk classification, and transparent deviation explanations).

**Phase 5** introduces the **Deal Health Intelligence Engine**. Unlike isolated predictive models, Deal Health is a **Hybrid Decision Intelligence Engine (Layer 3)** that synthesizes:
1. Historical Customer Conversion Behavior
2. Engagement & Activity Recency
3. Commercial & Financial Health
4. Temporal Deal Momentum & Progression Dynamics
5. ML Anomaly & Risk Signals (via direct Phase 4 composition)
6. Prescriptive Action Intelligence & Explainability

---

## 2. Repository & Architecture Inspection Findings

### 2.1 Codebase Structure
```text
dealflow360-ml/
├── src/
│   ├── main.py                     # FastAPI lifespan: synthetic data generation, service instantiation (app.state)
│   ├── core/                       # Settings, logging, and constants
│   ├── schemas/
│   │   ├── domain.py               # Pydantic schemas (Customer, Quotation, QuotationItem, Order, DealEvent, etc.)
│   │   ├── common.py               # Health check and common API response wrappers
│   │   ├── recommendation.py       # Recommendation API contracts
│   │   └── anomaly.py              # Anomaly API contracts (QuotationAnomalyRequest, QuotationAnomalyResponse)
│   ├── data/
│   │   ├── providers/              # SyntheticDataProvider generating relational business entities
│   │   ├── validation/             # DataValidator for referential integrity and business rules
│   │   └── preprocessing/          # DataCleaner for standardizing and cleaning dataframes
│   ├── features/
│   │   ├── base.py                 # BaseFeatureBuilder interface
│   │   ├── customer_features.py    # Conversion rates, total spend, AOV, order frequency, customer age
│   │   ├── product_features.py     # Product sales volume, category metrics, price statistics
│   │   └── temporal_features.py    # Date component extraction, days_between utilities
│   ├── pipelines/
│   │   └── data_pipeline.py        # End-to-end data processing orchestration
│   ├── recommendation/             # Phase 3 AI-01 Recommendation Engine
│   └── anomaly_detection/          # Phase 4 AI-02 Quotation Anomaly Detection Engine
│       ├── feature_builder.py      # Computes baseline deviations, discount/margin metrics
│       ├── preprocessor.py         # StandardScaler transformer for numerical features
│       ├── isolation_forest_model.py # Sklearn IsolationForest wrapper
│       ├── scorer.py               # Min-Max calibrated [0.0, 1.0] scoring
│       ├── risk_classifier.py      # LOW, MEDIUM, HIGH, CRITICAL classification
│       ├── deviation_analyzer.py   # Interprets feature deviations
│       ├── explainer.py            # Generates human-readable anomaly summaries
│       └── service.py              # AnomalyDetectionService orchestrator
```

### 2.2 Lifecycle & Dependency Injection Pattern
- `main.py` uses FastAPI's `lifespan` context manager to instantiate singletons (`app.state.recommendation_service` and `app.state.anomaly_service`).
- API routes extract service instances directly from `request.app.state` without circular imports or redundant network roundtrips.

---

## 3. Data Inventory & Mapping for Deal Health

| Category | Signal / Feature | Source Entity / Module | Field Name | Data Type | Reliability | Direct Reuse vs Transformation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer** | Customer Tier | `domain.Customer` | `customer_tier` | `str` (BRONZE/SILVER/GOLD/PLATINUM) | High | Direct reuse |
| **Customer** | Historical Conversion Rate | `features.CustomerFeatureBuilder` | `customer_conversion_rate` | `float` [0.0, 1.0] | High | Reused via calculation |
| **Customer** | Total Quotes & Orders | `features.CustomerFeatureBuilder` | `customer_total_orders`, `customer_total_quotes` | `int` | High | Reused directly |
| **Customer** | Customer Account Age | `features.CustomerFeatureBuilder` | `customer_age_days` | `int` | High | Reused directly |
| **Quotation** | Deal Total Amount | `domain.Quotation` | `total_amount` | `float` (>= 0.0) | High | Reused directly |
| **Quotation** | Deal Total Discount | `domain.Quotation` | `total_discount` | `float` (>= 0.0) | High | Reused directly |
| **Quotation** | Deal Total Margin | `domain.Quotation` | `total_margin` | `float` | High | Reused directly |
| **Quotation** | Creation & Update Timestamps | `domain.Quotation` | `created_at`, `updated_at` | `datetime` | High | Direct reuse |
| **Quotation Items** | Product Item Count | `domain.QuotationItem` | `quantity`, count of items | `int` | High | Aggregated from items |
| **Quotation Items** | Discount-to-Margin Ratio | `anomaly_detection.AnomalyFeatureBuilder` | `discount_to_margin_ratio` | `float` | High | Reused logic |
| **Events** | Event Type Sequence | `domain.DealEvent` | `event_type` (`QUOTE_CREATED`, `CUSTOMER_VIEWED`, etc.) | `str` | High | Direct pattern analysis |
| **Events** | Days Since Last Activity | `features.TemporalFeatures` | `(now - max(event.created_at)).days` | `int` | High | Transformation required |
| **Events** | Event Count / Frequency | `domain.DealEvent` | Count of events per quote | `int` | High | Aggregated |
| **Events** | Stage Progression Velocity | `domain.DealEvent` | Timestamps between stage transitions | `float` (days) | High | Transformation required |
| **Risk / ML** | ML Anomaly Score | `anomaly_detection.AnomalyDetectionService` | `anomaly_score` | `float` [0.0, 1.0] | High | Direct service composition |
| **Risk / ML** | Anomaly Risk Level | `anomaly_detection.AnomalyDetectionService` | `risk_level` | `str` (LOW/MED/HIGH/CRIT) | High | Direct service composition |
| **Risk / ML** | Feature Deviations | `anomaly_detection.AnomalyDetectionService` | `deviations` | `List[Dict]` | High | Direct service composition |

---

## 4. Phase 4 Integration Analysis

### 4.1 Findings
1. **Service Initialization**: `AnomalyDetectionService` is initialized once during app startup in `main.py` using historical quotations (`provider.get_quotations()`).
2. **Inference Execution**: `analyze_quotation(quotation_dict)` executes in sub-millisecond time. It transforms features, runs `IsolationForest.predict` and `decision_function`, applies `AnomalyScorer`, and produces explanations.
3. **No Redundant Retraining**: Calling `analyze_quotation` strictly executes the inference path. The model weights and baseline caches are immutable post-initialization.
4. **Composition Approach**: `DealHealthService` should receive the initialized `AnomalyDetectionService` instance via dependency injection at initialization or request execution:
   ```python
   # Recommended Python Composition:
   anomaly_result = self.anomaly_service.analyze_quotation(quotation_dict)
   ```
5. **No Refactoring Needed in Phase 4**: Phase 4's public API and internal methods are decoupled, pure, and safe to consume directly from other Python classes.

---

## 5. DealContext Contract Design

To prevent tight coupling and ensure robust testing, `DealContext` serves as the centralized input data transfer object:

```text
DealContext
├── quotation: Dict[str, Any] (or domain.Quotation)
├── customer: Optional[Dict[str, Any]] (or domain.Customer)
├── quotation_items: List[Dict[str, Any]] (or List[domain.QuotationItem])
├── historical_orders: List[Dict[str, Any]] (or List[domain.Order])
├── deal_events: List[Dict[str, Any]] (or List[domain.DealEvent])
├── sales_rep: Optional[Dict[str, Any]] (or domain.SalesRepresentative)
└── anomaly_result: Optional[Dict[str, Any]] (cached or lazily computed)
```

- **Validation Rules**:
  - `quotation` must contain valid `quotation_id`, `total_amount`, `total_discount`, `total_margin`, and `created_at`.
  - Missing customer or events default to graceful fallbacks (e.g., cold-start baseline heuristics) without throwing runtime exceptions.

---

## 6. The Five Deal Health Dimensions

Each dimension outputs a normalized score strictly bounded within $[0.0, 1.0]$, accompanied by descriptive positive/negative signals.

### 6.1 Dimension 1: Conversion Potential (Weight: 0.25)
- **Objective**: Evaluates the propensity of the customer to close based on historical relationship strength and account profile.
- **Inputs**: Customer historical orders, total quotes, tier, and account age.
- **Calculation Formula**:
  $$\text{Base Conversion Rate} = \frac{\text{Historical Converted Orders}}{\max(1, \text{Historical Quotations})}$$
  $$\text{Tier Multiplier} = \{\text{PLATINUM}: 1.15, \text{GOLD}: 1.05, \text{SILVER}: 0.95, \text{BRONZE}: 0.85\}$$
  $$\text{Score} = \text{clip}(\text{Base Conversion Rate} \times \text{Tier Multiplier}, 0.0, 1.0)$$
- **Cold-Start Fallback**: If customer has no prior history, default to tier baseline (e.g., PLATINUM: 0.60, GOLD: 0.50, SILVER: 0.40, BRONZE: 0.30).

### 6.2 Dimension 2: Engagement Health (Weight: 0.20)
- **Objective**: Quantifies client responsiveness, interaction recency, and communication flow.
- **Inputs**: `deal_events` list, event types, event timestamps.
- **Key Metrics**:
  - $\text{Days Since Last Event} = (\text{now} - \max(\text{event\_timestamps})).\text{days}$
  - $\text{Interaction Count} = \text{count of } (\text{CUSTOMER\_VIEWED}, \text{COUNTER\_OFFER}, \text{QUOTE\_REVISED})$
- **Calculation Formula**:
  $$\text{Recency Factor} = \exp\left(-\frac{\text{Days Since Last Event}}{14.0}\right)$$
  $$\text{Activity Factor} = \min\left(1.0, \frac{\text{Total Relevant Events}}{5.0}\right)$$
  $$\text{Score} = 0.6 \times \text{Recency Factor} + 0.4 \times \text{Activity Factor}$$

### 6.3 Dimension 3: Financial Health (Weight: 0.20)
- **Objective**: Assesses commercial profitability, margin safety, and discount sustainability.
- **Inputs**: `total_amount`, `total_discount`, `total_margin`.
- **Key Metrics**:
  - $\text{Discount Pct} = \frac{\text{total\_discount}}{\text{total\_amount} + \text{total\_discount}} \times 100$
  - $\text{Margin Pct} = \frac{\text{total\_margin}}{\text{total\_amount}} \times 100$
- **Calculation Formula**:
  $$\text{Margin Score} = \text{clip}\left(\frac{\text{Margin Pct}}{40.0}, 0.0, 1.0\right)$$
  $$\text{Discount Penalty} = \text{clip}\left(\frac{\text{Discount Pct}}{30.0}, 0.0, 1.0\right)$$
  $$\text{Score} = \text{clip}(0.7 \times \text{Margin Score} + 0.3 \times (1.0 - \text{Discount Penalty}), 0.0, 1.0)$$

### 6.4 Dimension 4: Deal Momentum (Weight: 0.15)
- **Objective**: Evaluates whether the deal velocity is accelerating, stable, declining, or stagnant.
- **Inputs**: Chronological event progression from `deal_events`.
- **Classification Taxonomy**:
  - `STRONG_POSITIVE` (Score: 0.90–1.00): Rapid stage movement within past 48 hours.
  - `POSITIVE` (Score: 0.70–0.89): Steady events and constructive negotiations in past 7 days.
  - `STABLE` (Score: 0.50–0.69): Normal progression, activity within 14 days.
  - `DECLINING` (Score: 0.30–0.49): Inactive between 15–30 days.
  - `STAGNANT` (Score: 0.00–0.29): No customer or sales activity for > 30 days.

### 6.5 Dimension 5: Risk Safety (Weight: 0.20)
- **Objective**: Translates ML anomaly risk and commercial outliers into an inverse safety score.
- **Inputs**: `anomaly_score` $\in [0.0, 1.0]$ from Phase 4 `AnomalyDetectionService`.
- **Calculation Formula**:
  $$\text{Risk Safety Score} = 1.0 - \text{anomaly\_score}$$
- **Semantics**:
  - Anomaly score $0.05 \implies \text{Risk Safety } = 0.95$ (Safe, healthy).
  - Anomaly score $0.85 \implies \text{Risk Safety } = 0.15$ (High risk, dangerous outlier).

---

## 7. Weighted Scoring & Classification Design

### 7.1 Aggregate Health Score Formula
$$\text{Health Score} = 100 \times \left( \sum_{i=1}^{5} w_i \times D_i \right)$$
Where weights sum to $1.0$:
- $w_{\text{conversion}} = 0.25$
- $w_{\text{engagement}} = 0.20$
- $w_{\text{financial}} = 0.20$
- $w_{\text{momentum}} = 0.15$
- $w_{\text{risk\_safety}} = 0.20$

### 7.2 Health Classification Tiers
- **$80.00 \le \text{Score} \le 100.00$**: `EXCELLENT` — High conversion likelihood, robust margins, active engagement.
- **$60.00 \le \text{Score} < 80.00$**: `HEALTHY` — Good progression, standard terms, steady velocity.
- **$40.00 \le \text{Score} < 60.00$**: `AT_RISK` — Warning signs (e.g., stalling engagement, excessive discounts).
- **$0.00 \le \text{Score} < 40.00$**: `CRITICAL` — Severe anomalies, negative margins, or complete stagnation.

---

## 8. Action Intelligence & Prescriptive Engine

The Action Intelligence engine evaluates dimension scores and underlying signals to generate prioritized, actionable recommendations for the sales team:

| Action Code | Trigger Condition | Priority | Evidence / Reason |
| :--- | :--- | :--- | :--- |
| `REENGAGE_CUSTOMER` | Days since activity > 14 & Engagement < 0.35 | `HIGH` | Deal has stalled with no activity for > 14 days. |
| `REVIEW_DISCOUNT` | Discount % > 25% or Risk Safety < 0.40 | `HIGH` | Extreme discount detected; margin erosion risk. |
| `ESCALATE_TO_MANAGER` | Margin % < 10% or Risk Level == `CRITICAL` | `CRITICAL` | Commercial risk exceeds governance thresholds. |
| `PRIORITIZE_DEAL` | Conversion > 0.75 & Momentum $\in$ {POSITIVE, STRONG_POSITIVE} | `MEDIUM` | High win-probability deal moving quickly; expedite closing. |
| `VERIFY_COMMERCIAL_TERMS` | Anomaly deviations detected on customer/rep baseline | `MEDIUM` | Quotation deviates significantly from historical peer baselines. |
| `MONITOR_ACTIVITY` | Health is HEALTHY with standard progression | `LOW` | Deal on track; monitor regular milestones. |

---

## 9. Explainability & Response Schema

```json
{
  "quotation_id": "quote_12345",
  "health_score": 74.5,
  "classification": "HEALTHY",
  "momentum": "POSITIVE",
  "dimension_scores": {
    "conversion_potential": 0.82,
    "engagement_health": 0.65,
    "financial_health": 0.78,
    "deal_momentum": 0.70,
    "risk_safety": 0.80
  },
  "strengths": [
    "High historical customer conversion rate (78%)",
    "Healthy gross margin percentage (34.2%)"
  ],
  "concerns": [
    "No client interactions recorded in the last 10 days"
  ],
  "recommended_actions": [
    {
      "action": "REENGAGE_CUSTOMER",
      "priority": "MEDIUM",
      "reason": "Follow up with client to maintain deal momentum.",
      "evidence": "10 days since last customer view event."
    }
  ]
}
```

---

## 10. Proposed Phase 5 Architecture

```text
src/deal_health/
├── __init__.py
├── context_builder.py       # Assembles DealContext from domain models or data store
├── conversion_scorer.py     # Computes Conversion Potential dimension
├── engagement_scorer.py     # Computes Engagement Health dimension
├── financial_scorer.py      # Computes Financial Health dimension
├── momentum_analyzer.py     # Analyzes temporal event velocity and momentum state
├── risk_integrator.py       # Interfaces with AnomalyDetectionService and computes Risk Safety
├── health_aggregator.py     # Weighted combination and normalization to [0, 100]
├── health_classifier.py     # Maps score to EXCELLENT, HEALTHY, AT_RISK, CRITICAL
├── action_engine.py         # Deterministic rule-based prescriptive actions
├── explainer.py             # Compiles strengths, concerns, and executive summary
└── service.py               # DealHealthService orchestration layer
```

---

## 11. Implementation Risks & Mitigations

| Risk | Impact | Recommended Mitigation |
| :--- | :--- | :--- |
| **Cold-Start Customers** | Missing customer order history could zero out conversion score. | Implement tier-based baseline conversion fallback when order count is zero. |
| **New Quotations Without Events** | Brand new quote has zero interaction events, risking false "stagnant" penalty. | Check `quote_age_days`. If quote was created < 3 days ago, assign default neutral/favorable momentum. |
| **Score Inconsistencies** | Inverted semantics between risk and health causing flawed aggregation. | Enforce strict `risk_safety = 1.0 - anomaly_score` contract in `risk_integrator.py`. |
| **Circular Dependencies** | Dependency cycles between data pipelines and services. | Use unidirectional DI: `DealHealthService` consumes `AnomalyDetectionService` and pure schemas. |
