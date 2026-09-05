# Phase 6: Deal Outcome Prediction & Revenue Forecasting — Feature Documentation

## 1. Prediction Target

- **Target Variable**: `quotation_converted`
- **Type**: Binary classification ground truth ($y \in \{0, 1\}$)
- **Definition**:
  - `1`: The quotation was successfully accepted and converted into a confirmed customer order (`quotation.status == 'CONVERTED'` or matched in `orders.quotation_id`).
  - `0`: The quotation was rejected, expired, or lost (`quotation.status \in {'REJECTED', 'EXPIRED'}`).

---

## 2. Feature Inventory & Data Leakage Analysis

To prevent data leakage, all features are strictly computed from information available **at or before quotation prediction time**. Post-conversion events, order delivery statuses, and future quotation revisions are strictly excluded.

| Feature Name | Category | Source Data | Description | Available at Prediction Time? | Leakage Risk | Preprocessing Pipeline |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `quotation_value` | Commercial | `Quotation.total_amount` | Total nominal monetary value of the quote. | **YES** | None | Median Imputation + StandardScaler |
| `log_quotation_value` | Commercial | Transformed `total_amount` | $\log(1 + \text{amount})$ to compress monetary skewness. | **YES** | None | Median Imputation + StandardScaler |
| `discount_percentage` | Commercial | `Quotation.total_discount` | Calculated percentage discount conceded on quote. | **YES** | None | Median Imputation + StandardScaler |
| `margin_percentage` | Commercial | `Quotation.total_margin` | Calculated gross profit margin percentage. | **YES** | None | Median Imputation + StandardScaler |
| `discount_to_margin_ratio` | Commercial | Derived ratio | Proportion of discount relative to margin. | **YES** | None | Median Imputation + StandardScaler |
| `product_count` | Bundle | `QuotationItem` list | Count of unique product line items in quote. | **YES** | None | Median Imputation + StandardScaler |
| `total_quantity` | Bundle | `QuotationItem.quantity` | Sum of all unit quantities across items. | **YES** | None | Median Imputation + StandardScaler |
| `customer_tier` | Account | `Customer.customer_tier` | Enterprise account tier (`PLATINUM`, `GOLD`, `SILVER`, `BRONZE`). | **YES** | None | Most Frequent Imputation + OneHotEncoder |
| `customer_industry` | Account | `Customer.industry` | Industry vertical (Technology, Finance, Healthcare, etc.). | **YES** | None | Most Frequent Imputation + OneHotEncoder |
| `customer_region` | Account | `Customer.region` | Geographic sales operating territory. | **YES** | None | Most Frequent Imputation + OneHotEncoder |
| `customer_historical_conversion_rate` | Behavioral | Historical customer orders / quotes | Empirical historical win rate prior to quote creation. | **YES** | None | Median Imputation + StandardScaler |
| `customer_total_prior_quotes` | Behavioral | Customer history | Number of prior quotes evaluated for this customer. | **YES** | None | Median Imputation + StandardScaler |
| `customer_total_prior_orders` | Behavioral | Customer history | Number of prior orders successfully completed. | **YES** | None | Median Imputation + StandardScaler |
| `customer_account_age_days` | Behavioral | `Customer.created_at` | Account tenure in days at time of quotation. | **YES** | None | Median Imputation + StandardScaler |
| `quote_creation_day_of_week` | Temporal | `Quotation.created_at` | Day of week when quote was authored (0=Mon, 6=Sun). | **YES** | None | Median Imputation + StandardScaler |
| `quote_creation_month` | Temporal | `Quotation.created_at` | Month when quote was authored (1–12). | **YES** | None | Median Imputation + StandardScaler |
| `early_event_count` | Interaction | `DealEvent` stream | Count of early stage touchpoints before conversion decision. | **YES** | None | Median Imputation + StandardScaler |
| `customer_interaction_count` | Interaction | `DealEvent` stream | Client response events (`CUSTOMER_VIEWED`, `COUNTER_OFFER`). | **YES** | None | Median Imputation + StandardScaler |
