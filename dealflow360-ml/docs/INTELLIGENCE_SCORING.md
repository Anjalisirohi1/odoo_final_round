# Unified Deal Intelligence Scoring Methodology

## 1. Overview
The **Deal Intelligence Score** (0–100) provides sales leadership and deal desk teams with a single executive metric reflecting overall deal viability, opportunity strength, anomaly risks, and cross-module consensus.

> [!IMPORTANT]
> The Deal Intelligence Score is a **deterministic executive decision score**—it is NOT a black-box machine learning model. It combines multi-modal signals using explicit, configurable weights and bounds.

---

## 2. Mathematical Formulation

$$\text{Opportunity Score} = \frac{w_{\text{conv}} \cdot (\text{Conversion Probability} \times 100) + w_{\text{health}} \cdot \text{Health Score}}{w_{\text{conv}} + w_{\text{health}}}$$

$$\text{Risk Penalty} = w_{\text{risk}} \cdot (\text{Anomaly Score} \times 100)$$

$$\text{Base Score} = \text{Opportunity Score} - \text{Risk Penalty}$$

$$\text{Final Score} = \text{Clamp}_{0}^{100}\left(\text{Base Score} + \text{Consensus Adjustment}\right)$$

---

## 3. Configurable Weights & Parameters

| Component | Default Weight | Setting Key | Description |
| :--- | :--- | :--- | :--- |
| **Conversion Opportunity** ($w_{\text{conv}}$) | `0.35` | `INTELLIGENCE_WEIGHT_CONVERSION` | Supervised outcome probability weight |
| **Deal Health** ($w_{\text{health}}$) | `0.35` | `INTELLIGENCE_WEIGHT_HEALTH` | Behavioural multi-dimensional health weight |
| **Risk Penalty** ($w_{\text{risk}}$) | `0.30` | `INTELLIGENCE_WEIGHT_RISK_PENALTY` | Anomaly score penalty scaling |
| **Consensus Bonus** | `+5.0` | `INTELLIGENCE_AGREEMENT_BONUS` | Added when cross-module consensus is positive |
| **Consensus Penalty** | `-5.0` | `INTELLIGENCE_AGREEMENT_PENALTY` | Subtracted when cross-module consensus is negative |

---

## 4. Score Classification Tiers

| Score Range | Classification | Meaning |
| :--- | :--- | :--- |
| **80.0 – 100.0** | `STRONG_OPPORTUNITY` | High conversion likelihood, healthy momentum, negligible anomaly risk. |
| **60.0 – 79.99** | `POSITIVE` | Favorable deal progression with solid fundamentals. |
| **40.0 – 59.99** | `MIXED` | Balanced or conflicting signals; requires targeted rep action. |
| **20.0 – 39.99** | `AT_RISK` | Deteriorating engagement, low conversion likelihood, or pricing anomalies. |
| **0.0 – 19.99** | `CRITICAL` | Severe deal impairment, critical anomaly deviations, or loss imminent. |

---

## 5. Dynamic Weight Rebalancing (Graceful Degradation)
When one or more intelligence modules are unavailable (e.g. prediction model artifact not trained), the score calculator dynamically adjusts:
- If **Prediction is unavailable**: Opportunity score evaluates purely on Deal Health ($w_{\text{health}} = 1.0$), with risk penalty intact.
- If **Deal Health is unavailable**: Opportunity score evaluates purely on Prediction ($w_{\text{conv}} = 1.0$).
- If **Anomaly Detection is unavailable**: Base score evaluates on available opportunity models without penalty.
- If **No modules are available**: Defaults gracefully to `50.0` (`MIXED`).
