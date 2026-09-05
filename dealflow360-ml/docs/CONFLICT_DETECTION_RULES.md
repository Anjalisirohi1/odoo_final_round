# Deal Intelligence Conflict & Agreement Detection Rules

## 1. Overview
The **Conflict & Agreement Engine** identifies cross-module alignment and contradictions across Deal Outcome Prediction, Deal Health Intelligence, and Quotation Anomaly Detection.

All rules are deterministic, explainable, and configurable via application settings.

---

## 2. Conflict Detection Rules

### Rule 1: Health & Prediction Mismatch (`HEALTH_PREDICTION_MISMATCH`)
* **Trigger Condition**:
  $$\text{Conversion Probability} \ge 0.70 \quad \text{AND} \quad \text{Health Classification} \in \{\text{AT\_RISK}, \text{CRITICAL}\} \text{ or } \text{Health Score} < 40.0$$
* **Severity**: `HIGH` (or `CRITICAL` if Health is `CRITICAL`)
* **Participating Modules**: `PREDICTION`, `DEAL_HEALTH`
* **Executive Description**: *"The predictive model estimates a strong conversion probability, while behavioural health signals indicate the deal is deteriorating."*
* **Prescriptive Impact**: Prompts review of recent deal velocity and customer engagement drop-offs despite high historical affinity.

---

### Rule 2: High Value Deal with Critical Anomaly Risk (`HIGH_VALUE_CRITICAL_RISK`)
* **Trigger Condition**:
  $$\text{Effective Revenue} \ge \text{High Value Threshold (₹100,000)} \quad \text{AND} \quad \text{Anomaly Risk Level} = \text{CRITICAL}$$
* **Severity**: `CRITICAL`
* **Participating Modules**: `ANOMALY_DETECTION`, `PREDICTION`
* **Executive Description**: *"High-value deal contains critical quotation anomalies and severe risk deviations requiring immediate managerial review."*
* **Prescriptive Impact**: Automatically triggers `ESCALATE_TO_SALES_LEADERSHIP` and `REVIEW_DISCOUNT_AND_PRICING`.

---

### Rule 3: Healthy Deal with Low Conversion Prediction (`HEALTH_CONVERSION_MISMATCH`)
* **Trigger Condition**:
  $$\text{Health Score} \ge 70.0 \quad \text{AND} \quad \text{Conversion Probability} \le 0.40$$
* **Severity**: `MEDIUM`
* **Participating Modules**: `DEAL_HEALTH`, `PREDICTION`
* **Executive Description**: *"Deal health indicators are strong, yet predictive outcome models project a low likelihood of deal close."*
* **Prescriptive Impact**: Suggests verifying commercial terms and competitive pricing resistance.

---

### Rule 4: Strong Momentum with Low Predictive Outcome (`MOMENTUM_PREDICTION_MISMATCH`)
* **Trigger Condition**:
  $$\text{Momentum} \in \{\text{STRONG\_POSITIVE}, \text{POSITIVE}\} \quad \text{AND} \quad \text{Conversion Probability} \le 0.35$$
* **Severity**: `MEDIUM`
* **Participating Modules**: `DEAL_HEALTH`, `PREDICTION`
* **Executive Description**: *"Deal momentum is currently accelerating, but statistical outcome prediction projects a high probability of deal loss."*

---

### Rule 5: Discount Anomaly vs High Financial Health Dimension (`DISCOUNT_FINANCIAL_DIVERGENCE`)
* **Trigger Condition**:
  $$\text{Anomaly Risk Level} \in \{\text{HIGH}, \text{CRITICAL}\} \quad \text{AND} \quad \text{Financial Health Dimension Score} \ge 0.70$$
* **Severity**: `LOW`
* **Participating Modules**: `ANOMALY_DETECTION`, `DEAL_HEALTH`
* **Executive Description**: *"Quotation risk module flagged deviations, although aggregated financial health score remains high."*

---

## 3. Agreement & Consensus Rules

### Rule 1: Strong Positive Consensus (`STRONG_POSITIVE_CONSENSUS`)
* **Trigger Condition**:
  $$\text{Conversion Probability} \ge 0.70 \quad \text{AND} \quad \text{Health Classification} \in \{\text{EXCELLENT}, \text{HEALTHY}\} \quad \text{AND} \quad \text{Anomaly Risk} = \text{LOW}$$
* **Confidence**: `HIGH`
* **Participating Modules**: `PREDICTION`, `DEAL_HEALTH`, `ANOMALY_DETECTION`
* **Executive Description**: *"Cross-module consensus: Prediction, Deal Health, and Anomaly Detection all confirm high closing probability and low operational risk."*

---

### Rule 2: Strong Negative Consensus (`STRONG_NEGATIVE_CONSENSUS`)
* **Trigger Condition**:
  $$\text{Conversion Probability} \le 0.40 \quad \text{AND} \quad \text{Health Classification} \in \{\text{AT\_RISK}, \text{CRITICAL}\} \quad \text{AND} \quad \text{Anomaly Risk} \in \{\text{HIGH}, \text{CRITICAL}\}$$
* **Confidence**: `HIGH`
* **Participating Modules**: `PREDICTION`, `DEAL_HEALTH`, `ANOMALY_DETECTION`
* **Executive Description**: *"Cross-module consensus: Prediction, Deal Health, and Anomaly Detection all confirm severe deal deterioration and high risk of loss."*
