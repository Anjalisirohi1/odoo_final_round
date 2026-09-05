# DealFlow360 — Explainable AI (XAI) & Trustworthy Decision Intelligence Layer (Phase 9)

## 1. Executive Overview

Phase 9 introduces a dedicated, modular **Explainable AI (XAI)** layer for the DealFlow360 ML microservice. The primary mission of this layer is to ensure AI predictions, anomaly flags, deal health scores, and product recommendations are never "black boxes", but rather fully transparent, interpretable, and actionable for:
- **Sales Representatives**: Actionable deal-level drivers and risk alerts.
- **Sales Managers**: Diagnostic visibility into margin pressures and team conversion drivers.
- **Executive Leadership**: Trustworthy, audited synthesis of multi-module signals and AI consensus/conflict detection.
- **Compliance & ML Governance**: Full model auditability, SHAP/model-native attribution, and explanation metadata tracking.

---

## 2. Core Architectural Flow

```text
                             DEAL INPUT / CONTEXT
                                      │
                                      ▼
                        FEATURE EXTRACTION & PREPROCESSING
                                      │
                                      ▼
                           SUPERVISED PREDICTION MODEL
                                      │
                                      ▼
                             XAI SERVICE FACADE
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
    SHAP Explainer            Linear/Tree Explainer       Rule/Domain Explainer
   (Dynamic & Safe)          (Exact Coeffs / Importances)   (Deviation / Heuristics)
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      │
                                      ▼
                         CONTRIBUTION ANALYZER
               - Significance thresholding (min 0.01)
               - Impact tier categorization (VERY_HIGH, HIGH, MEDIUM, LOW)
               - Top positive & negative driver ranking (max 3)
                                      │
                                      ▼
                         CENTRALIZED FEATURE MAPPER
               - Translates technical names to business labels
               - Populates natural language reasoning templates
                                      │
                                      ▼
                         EXPLANATION CONFIDENCE ENGINE
               - Measures attribution concentration & stability (HIGH / MEDIUM / LOW)
                                      │
                                      ▼
                         DOMAIN ADAPTERS & UNIFIED XAI
               - Prediction, Anomaly, Deal Health, Recommendation
               - Cross-module AI Consensus & AI Conflict Detection
                                      │
                                      ▼
                         REST API & AUDIT METADATA
```

---

## 3. Explanation Strategies & Graceful Degradation

The XAI layer adopts the **Strategy Pattern** with multi-level fallback:

1. **SHAP Explainer (`ShapLocalExplainer`)**:
   - Dynamically checks if `shap` is installed and supports the active model (`shap.TreeExplainer`, `shap.LinearExplainer`, `shap.Explainer`).
   - If SHAP is unavailable or encounters an error, it fails gracefully without disrupting prediction serving.
2. **Model-Native Explainers (`LinearModelExplainer` & `TreeModelExplainer`)**:
   - For `LogisticRegression`: Computes exact linear log-odds contribution $w_i \cdot x_i$.
   - For `RandomForest` / `GradientBoosting`: Computes directional feature contribution importances $\text{imp}_i \times \tanh(z_i)$.
3. **Fallback Explainer (`FallbackLocalExplainer`)**:
   - Deterministic domain heuristics based on account history, margins, and customer engagement.
4. **Audit Transparency**:
   - Every explanation response explicitly declares its method: `"method": "SHAP"`, `"method": "LINEAR_COEFFICIENT"`, `"method": "TREE_FEATURE_IMPORTANCE"`, or `"method": "RULE_BASED"`.

---

## 4. Centralized Feature Mapping & Business Translation

Technical feature names are systematically mapped to business language without scattering string literals across code:

| Technical Feature | Business Label | Category | Sample Positive Reasoning |
| :--- | :--- | :--- | :--- |
| `customer_historical_conversion_rate` | Customer Historical Win Rate | Customer Profile | Strong historical customer conversion rate (65.0%) significantly increased likelihood of conversion. |
| `discount_percentage` | Discount Level | Commercial Terms | Commercially disciplined discount (10.0%) supported profitability and buyer commitment. |
| `margin_percentage` | Gross Margin | Commercial Terms | Healthy gross margin (32.5%) provides strong commercial viability. |
| `customer_interaction_count` | Client Engagement Frequency | Engagement & Activity | High engagement with 4 client interactions demonstrates strong buyer responsiveness. |
| `days_since_last_activity` | Activity Recency | Engagement & Activity | Recent deal engagement (2 days) shows active buyer attention. |

---

## 5. Contribution & Impact Tiers

Raw numeric contributions are converted into intuitive impact levels:

| Contribution Range ($|\Delta|$) | Impact Level | Business Interpretation |
| :--- | :--- | :--- |
| $\ge 0.25$ | **VERY_HIGH** | Primary determinant of the deal outcome. |
| $0.12 \le |\Delta| < 0.25$ | **HIGH** | Major driving factor with substantial influence. |
| $0.04 \le |\Delta| < 0.12$ | **MEDIUM** | Noticeable contributing factor. |
| $< 0.04$ | **LOW** | Minor or contextual baseline factor. |

---

## 6. Cross-Module Adapters & Unified Deal Explanation

The XAI layer unifies all intelligence services via standardized adapters:
- **Prediction Adapter**: Standardizes conversion probabilities and driver impacts.
- **Anomaly Adapter**: Translates Isolation Forest multi-variate deviations into risk driver explanations.
- **Deal Health Adapter**: Standardizes 5-dimension health scores (conversion, engagement, financial, momentum, risk safety) into strengths and concerns.
- **Recommendation Adapter**: Translates association rule confidence and basket affinity into clear cross-sell rationale.
- **AI Consensus & Conflict Detection**: Identifies cross-model alignment (e.g. high prediction win rate + healthy operational score) or flags executive conflicts (e.g. high predicted win rate but aggressive margin discounting risk).

---

## 7. REST API Endpoints

### 1. Local Prediction Explanation
- **Endpoint**: `POST /api/v1/explanations/prediction`
- **Request**: `{"quotation_id": "quotation-101"}`
- **Response**: Returns executive summary, top positive drivers, top negative drivers, all feature contributions, explanation confidence, method used, and audit metadata.

### 2. Global Feature Importance
- **Endpoint**: `GET /api/v1/explanations/prediction/global`
- **Response**: Returns ranked global feature importance with labels, categories, and caching support.

### 3. Unified Decision Explanation
- **Endpoint**: `POST /api/v1/explanations/deal`
- **Request**: `{"quotation_id": "quotation-101"}`
- **Response**: Consolidated multi-module explanation with AI Consensus and AI Conflict analysis.
