# Model Specifications

## RECOMMENDATION ENGINE

**Input:**
- Historical orders
- Order items
- Product information

**Technique:**
- FP-Growth
- Association Rules
- Margin-aware ranking

**Output:**
- Recommended products
- Confidence score
- Explanation

---

## DISCOUNT ANOMALY

**Input features:**
- discount_percentage
- quote_value
- margin_percentage
- customer_tier
- product_category
- sales_rep_avg_discount
- category_avg_discount
- customer_avg_discount
- discount_deviation

**Technique:**
- Isolation Forest
- Statistical comparison

**Output:**
- Anomaly score
- Risk level
- Reasons

---

## DEAL HEALTH ENGINE

**Signals:**
- Activity risk
- Discount risk
- Approval risk
- Negotiation risk
- Delivery risk

**Technique:**
Hybrid scoring:
Rule Based Signals + ML Signals → Risk Aggregation → Health Score

---

## DELIVERY PREDICTION

**Features:**
- Stock availability
- Warehouse
- Number of warehouses
- Order quantity
- Historical delays
- Promised delivery days

**Models to compare:**
- Logistic Regression
- Random Forest
- XGBoost
