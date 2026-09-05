# DealFlow360 — Continuous Learning & Retraining Advisory Governance

## 1. Architectural Philosophy: Advisory Continuous Learning

In enterprise financial and CRM workflows, **uncontrolled automatic retraining** presents significant operational risks:
- Risk of training on corrupted feedback loops or unrepresentative short-term market shocks.
- Risk of silent regression without proper validation or human sign-off.
- Inability to enforce compliance and audit trails for newly trained models.

Therefore, DealFlow360 adopts an **Advisory Governance Model**:
1. **Continuous Monitoring & Feedback**: Live predictions and deal outcomes are recorded automatically.
2. **Deterministic Retraining Advisory**: The `RetrainingAdvisor` continuously assesses model health, drift, and performance degradation.
3. **Actionable Recommendations**: Clear, structured retraining priorities are provided to ML engineers and ops teams.
4. **Explicit Retraining & Promotion**: Models are retrained via explicit CLI/CI commands (`python scripts/train_prediction_model.py`) and promoted to active status only after manual or automated validation.

---

## 2. Decision Logic Matrix

The `RetrainingAdvisor` evaluates four core dimensions:

1. **Performance Degradation**:
   - `SIGNIFICANT_DEGRADATION`: F1 or ROC-AUC dropped $> 15\%$ or Accuracy dropped $> 10\%$.
   - `MINOR_DEGRADATION`: Metric drop between $5\%$ and $15\%$.
2. **Distribution Drift**:
   - `HIGH` overall feature/prediction PSI ($\ge 0.25$).
   - `MODERATE` overall drift ($0.10 \le \text{PSI} < 0.25$).
3. **Feedback Volume**:
   - Minimum threshold of new resolved observations (e.g., $\ge 50$ closed deals).
4. **Model Age**:
   - Model age exceeding configured threshold (default 90 days).

### Recommendation Rules

| Condition | Retraining Decision | Priority | Actionable Guidance |
| :--- | :--- | :--- | :--- |
| Significant performance degradation detected | `RETRAIN_HIGH_PRIORITY` | `CRITICAL` | Performance has dropped significantly below baseline. Retrain immediately with latest feedback data. |
| High population / prediction drift detected | `RETRAIN_RECOMMENDED` | `HIGH` | Significant drift detected in input features or model outputs. Model is operating on shifted distributions. |
| Model age $> 90$ days and adequate new feedback | `RETRAIN_RECOMMENDED` | `MEDIUM` | Model age exceeds 90 days with sufficient new outcome data available. |
| Minor performance drop or moderate drift | `MONITOR` | `LOW` | Minor variance observed. Continue monitoring rolling performance. |
| Stable metrics, low drift, fresh model | `NO_ACTION` | `LOW` | Model is operating within expected operational bounds. |

---

## 3. Champion vs Challenger Workflow

When a new candidate model is trained:
1. It is registered in `ModelRegistry` as `CANDIDATE`.
2. `POST /api/v1/mlops/models/deal_outcome_prediction/compare` evaluates the Candidate against the active Champion.
3. If the candidate achieves superior ROC-AUC / F1 without degrading calibration or latency, the operator calls `POST /api/v1/mlops/models/deal_outcome_prediction/1.1.0/activate`.
4. The previous Champion transitions seamlessly to `ARCHIVED`, maintaining full provenance and rollback capability.
