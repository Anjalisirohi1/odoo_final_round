import sys
import os

# Set stdout encoding
sys.stdout.reconfigure(encoding='utf-8')

# Add dealflow360-ml to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from src.main import app

def run_endpoint_health_checks():
    print("=" * 70)
    print("DEALFLOW360 ML SERVICE -- ENDPOINT VALIDATION & HEALTH CHECK")
    print("=" * 70)

    results = []

    with TestClient(app) as client:
        # Get a real quote ID from initialized synthetic state
        pred_service = getattr(app.state, "prediction_service", None)
        sample_quote_id = list(pred_service.quotations_map.keys())[0] if pred_service and pred_service.quotations_map else "quote_001"
        rec_service = getattr(app.state, "recommendation_service", None)
        sample_prod_ids = list(rec_service.products_df["product_id"].unique()[:2]) if rec_service and hasattr(rec_service, "products_df") and rec_service.products_df is not None else ["prod_1", "prod_2"]
        print(f"[*] Testing using live sample quote ID: '{sample_quote_id}' and products: {sample_prod_ids}")
        print("-" * 70)

        endpoints = [
            # 1. System Endpoints
            ("GET", "/health", None, None, 200, "System Health Check"),
            ("GET", "/api/v1/status", None, None, 200, "API Status & Version"),

            # 2. Recommendation Engine
            ("POST", "/api/v1/recommendations/", {
                "product_ids": sample_prod_ids,
                "limit": 3
            }, None, 200, "Product Recommendations (FP-Growth)"),

            # 3. Anomaly Detection
            ("POST", "/api/v1/anomalies/quotation", {
                "quotation_id": sample_quote_id
            }, None, 200, "Quotation Anomaly Detection (Isolation Forest)"),

            # 4. Deal Health Intelligence
            ("POST", "/api/v1/deal-health/analyze", {
                "quotation_id": sample_quote_id
            }, None, 200, "Deal Health Analysis & Actions"),

            # 5. Outcome Prediction
            ("POST", "/api/v1/predictions/deal", {
                "quotation_id": sample_quote_id
            }, None, 200, "Deal Outcome Prediction & Forecasting"),

            # 6. Unified Deal Intelligence
            ("POST", "/api/v1/deal-intelligence/analyze", {
                "quotation_id": sample_quote_id
            }, None, 200, "Unified Cross-Engine Deal Intelligence"),

            # 7. Explainable AI (XAI)
            ("POST", "/api/v1/explanations/prediction", {
                "quotation_id": sample_quote_id
            }, None, 200, "Local Prediction Feature Explanation"),
            ("GET", "/api/v1/explanations/prediction/global", None, None, 200, "Global Feature Importance"),
            ("POST", "/api/v1/explanations/deal", {
                "quotation_id": sample_quote_id
            }, None, 200, "Unified 360-deg Decision Explanation"),

            # 8. MLOps & Model Governance
            ("GET", "/api/v1/mlops/models", None, None, 200, "MLOps List Models"),
            ("GET", "/api/v1/mlops/models/deal_outcome_prediction", None, None, 200, "MLOps Model Versions"),
            ("GET", "/api/v1/mlops/models/deal_outcome_prediction/active", None, None, 200, "MLOps Active Champion Model"),
            ("GET", "/api/v1/mlops/models/deal_outcome_prediction/health", None, None, 200, "MLOps Model Health Report"),
            ("GET", "/api/v1/mlops/models/deal_outcome_prediction/performance", None, None, 200, "MLOps Performance Metrics"),
            ("GET", "/api/v1/mlops/models/deal_outcome_prediction/drift", None, None, 200, "MLOps Drift Report (PSI/KS)"),
            ("GET", "/api/v1/mlops/models/deal_outcome_prediction/retraining-advice", None, None, 200, "MLOps Continuous Learning Advice"),
            ("POST", "/api/v1/mlops/models/deal_outcome_prediction/compare?challenger_version=1.0.0", None, None, 200, "MLOps Champion vs Challenger Compare"),
            ("POST", "/api/v1/mlops/models/deal_outcome_prediction/1.0.0/activate", None, None, 200, "MLOps Model Activation/Promotion"),
        ]

        passed = 0
        failed = 0

        for method, path, json_data, params, expected_status, description in endpoints:
            try:
                if method == "GET":
                    resp = client.get(path, params=params)
                elif method == "POST":
                    resp = client.post(path, json=json_data, params=params)

                if resp.status_code == expected_status:
                    print(f"[PASS] {method:<4} {path:<55} (Status {resp.status_code}) - {description}")
                    passed += 1
                else:
                    print(f"[FAIL] {method:<4} {path:<55} (Got {resp.status_code}, Expected {expected_status}) - {resp.text}")
                    failed += 1
            except Exception as e:
                print(f"[ERR ] {method:<4} {path:<55} Exception: {e}")
                failed += 1

        print("-" * 70)
        print(f"SUMMARY: {passed} PASSED, {failed} FAILED across {len(endpoints)} endpoints tested.")
        print("=" * 70)

        if failed == 0:
            print("ALL 18 ENDPOINTS ARE FULLY OPERATIONAL AND RETURNING EXPECTED STATUS 200 OK!")
        else:
            sys.exit(1)

if __name__ == "__main__":
    run_endpoint_health_checks()
