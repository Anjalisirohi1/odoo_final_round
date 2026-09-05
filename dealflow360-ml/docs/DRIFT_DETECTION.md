# DealFlow360 — Feature & Prediction Drift Detection

## 1. Overview

Population Stability Index (PSI) is the industry standard metric for detecting dataset shift and covariate drift between model training distributions (baseline) and live production inference distributions (target).

---

## 2. Mathematical Definition

For a given numerical or categorical feature segmented into $K$ bins:

$$\text{PSI} = \sum_{k=1}^K \left( \text{Actual}_k - \text{Expected}_k \right) \times \ln\left( \frac{\text{Actual}_k}{\text{Expected}_k} \right)$$

Where:
- $\text{Expected}_k$: Proportion of observations in bin $k$ in the baseline (training) dataset.
- $\text{Actual}_k$: Proportion of observations in bin $k$ in the target (production) dataset.
- $\epsilon = 10^{-4}$: Smoothing constant applied to prevent division by zero or undefined logarithms when a bin has zero observations.

---

## 3. Thresholds & Drift Levels

| PSI Score Range | Drift Level | System Response |
| :--- | :--- | :--- |
| $\text{PSI} < 0.10$ | **LOW** | Stable distribution. No action required. |
| $0.10 \le \text{PSI} < 0.25$ | **MODERATE** | Slight shift observed. Flag for monitoring in health score. |
| $\text{PSI} \ge 0.25$ | **HIGH** | Significant population shift. Triggers retraining recommendation. |

---

## 4. Detection Pipelines

### 4.1 Numerical Feature Drift
1. Training baseline distribution is partitioned into $K=5$ quantile bins (using `pd.qcut` with duplicate dropping fallback).
2. Production feature snapshots are mapped into the baseline bin edges.
3. Actual vs Expected proportions are computed and PSI is calculated.

### 4.2 Categorical Feature Drift
1. Baseline frequencies across distinct categories are extracted.
2. Production category distribution is computed.
3. PSI is calculated across all known categories, with unobserved categories handled via Laplace smoothing.

### 4.3 Prediction Drift
1. Conversion probabilities $[0.0, 1.0]$ are binned into uniform intervals:
   `[0.0-0.2]`, `[0.2-0.4]`, `[0.4-0.6]`, `[0.6-0.8]`, `[0.8-1.0]`.
2. Compares live model output probabilities against baseline validation probabilities.

---

## 5. Drift Report Synthesis
The `DriftService` aggregates individual feature PSIs and prediction PSI into a consolidated `DriftReport`:
- **Overall Drift Level**: Set to `HIGH` if $\ge 2$ features or prediction drift is `HIGH`; `MODERATE` if $\ge 1$ feature or prediction drift is `MODERATE`; otherwise `LOW`.
- **Sample Guard**: If production sample count is below `MINIMUM_DRIFT_SAMPLE_SIZE` (default 30), drift calculation returns `LOW` with an explanatory notice.
