# API Contract

## A. Recommendation API

**POST /api/v1/recommendations**

Purpose: Recommend relevant products.

Example Request:
```json
{
  "customer_id": "uuid",
  "customer_tier": "GOLD",
  "product_ids": [
    "product-1",
    "product-2"
  ],
  "limit": 3
}
```

Example Response:
```json
{
  "recommendations": [
    {
      "product_id": "product-10",
      "score": 0.91,
      "reason": "Frequently purchased with selected products",
      "expected_margin": 18.5
    }
  ]
}
```

## B. Discount Anomaly API

**POST /api/v1/anomaly/discount**

Example Response Structure:
```json
{
  "overall_anomaly_score": 0.91,
  "risk_level": "HIGH",
  "is_anomaly": true,
  "reasons": []
}
```

## C. Deal Health API

**POST /api/v1/deal-health**

Expected Response:
```json
{
  "health_score": 45,
  "status": "AT_RISK",
  "risk_breakdown": {},
  "reasons": [],
  "recommended_actions": []
}
```

## D. Delivery Prediction API

**POST /api/v1/delivery/predict**

Expected Response:
```json
{
  "delay_probability": 0.78,
  "risk_level": "HIGH",
  "predicted_delay_days": 3,
  "reasons": []
}
```
