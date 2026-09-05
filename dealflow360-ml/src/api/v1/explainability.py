import logging
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, status, Query

from src.schemas.prediction import PredictionRequest
from src.schemas.explainability import (
    LocalExplanationResponse, GlobalImportanceResponse,
    UnifiedDealExplanationResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/explanations", tags=["Explainable AI (XAI)"])

@router.post(
    "/prediction",
    response_model=LocalExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Local Feature Explanation for a Prediction",
    description="Returns detailed local feature contributions, positive/negative business drivers, and explanation confidence for a quotation prediction."
)
def explain_prediction(
    request_data: PredictionRequest,
    req: Request
) -> LocalExplanationResponse:
    pred_service = getattr(req.app.state, "prediction_service", None)
    xai_service = getattr(req.app.state, "explainability_service", None)

    if not pred_service or not pred_service.is_initialized:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction service is not initialized or model is missing."
        )

    quotation = pred_service.quotations_map.get(request_data.quotation_id)
    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation with ID '{request_data.quotation_id}' not found."
        )

    # 1. Build features
    df_features = pred_service.feature_builder.build_features_for_quotations(
        quotations=[quotation],
        customers_map=pred_service.customers_map,
        items_by_quote=pred_service.items_by_quote,
        orders_by_customer=pred_service.orders_by_customer,
        quotes_by_customer=pred_service.quotes_by_customer,
        events_by_quote=pred_service.events_by_quote
    )

    if df_features.empty:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to build features for the given quotation."
        )

    # 2. Get prediction values
    pred_res = pred_service.predict_deal_outcome(request_data.quotation_id)
    conv_prob = pred_res.get("conversion_probability", 0.5) if pred_res else 0.5
    outcome = pred_res.get("predicted_outcome", "UNCERTAIN") if pred_res else "UNCERTAIN"

    # 3. Generate XAI explanation
    explanation = xai_service.explain_prediction(
        quotation_id=request_data.quotation_id,
        features_df=df_features,
        model=pred_service.model,
        preprocessor=pred_service.preprocessor,
        feature_names=pred_service.feature_names,
        model_name=pred_service.model_name,
        model_version=str(pred_service.metadata.get("model_version", "1.0.0")),
        conversion_probability=conv_prob,
        predicted_outcome=outcome.value if hasattr(outcome, "value") else str(outcome)
    )

    return explanation

@router.get(
    "/prediction/global",
    response_model=GlobalImportanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Global Feature Importance",
    description="Returns global feature importance and ranking for the active prediction model."
)
def get_global_importance(
    req: Request,
    force_refresh: bool = Query(default=False, description="Force recomputing importance instead of using cache")
) -> GlobalImportanceResponse:
    pred_service = getattr(req.app.state, "prediction_service", None)
    xai_service = getattr(req.app.state, "explainability_service", None)

    if not pred_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction service is not available."
        )

    return xai_service.get_global_feature_importance(
        model=pred_service.model,
        feature_names=pred_service.feature_names,
        model_name=pred_service.model_name,
        model_version=str(pred_service.metadata.get("model_version", "1.0.0")),
        force_refresh=force_refresh
    )

@router.post(
    "/deal",
    response_model=UnifiedDealExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Unified Cross-Module Decision Explanation",
    description="Returns unified executive decision explanation combining Prediction, Anomaly Detection, Deal Health, and Recommendations with AI Consensus and Conflict detection."
)
def explain_deal(
    request_data: PredictionRequest,
    req: Request
) -> UnifiedDealExplanationResponse:
    pred_service = getattr(req.app.state, "prediction_service", None)
    anomaly_service = getattr(req.app.state, "anomaly_service", None)
    health_service = getattr(req.app.state, "deal_health_service", None)
    rec_service = getattr(req.app.state, "recommendation_service", None)
    xai_service = getattr(req.app.state, "explainability_service", None)

    quotation = None
    if pred_service:
        quotation = pred_service.quotations_map.get(request_data.quotation_id)
    elif health_service:
        quotation = health_service.quotations_map.get(request_data.quotation_id)

    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation with ID '{request_data.quotation_id}' not found."
        )

    pred_res = None
    local_expl = None
    if pred_service and pred_service.is_initialized:
        try:
            pred_res = pred_service.predict_deal_outcome(request_data.quotation_id)
            # generate local explanation
            df_features = pred_service.feature_builder.build_features_for_quotations(
                quotations=[quotation],
                customers_map=pred_service.customers_map,
                items_by_quote=pred_service.items_by_quote,
                orders_by_customer=pred_service.orders_by_customer,
                quotes_by_customer=pred_service.quotes_by_customer,
                events_by_quote=pred_service.events_by_quote
            )
            if not df_features.empty:
                local_expl = xai_service.explain_prediction(
                    quotation_id=request_data.quotation_id,
                    features_df=df_features,
                    model=pred_service.model,
                    preprocessor=pred_service.preprocessor,
                    feature_names=pred_service.feature_names,
                    model_name=pred_service.model_name,
                    model_version=str(pred_service.metadata.get("model_version", "1.0.0")),
                    conversion_probability=pred_res.get("conversion_probability", 0.5),
                    predicted_outcome=getattr(pred_res.get("predicted_outcome"), "value", str(pred_res.get("predicted_outcome", "UNCERTAIN")))
                )
        except Exception as e:
            logger.warning(f"Prediction inference failed during unified explanation: {e}")

    anomaly_res = None
    if anomaly_service and getattr(anomaly_service, "is_initialized", False):
        try:
            anomaly_res = anomaly_service.analyze_quotation(quotation)
        except Exception as e:
            logger.warning(f"Anomaly detection failed during unified explanation: {e}")

    health_res = None
    if health_service and getattr(health_service, "is_initialized", False):
        try:
            health_res = health_service.evaluate_deal_health(request_data.quotation_id)
        except Exception as e:
            logger.warning(f"Deal health evaluation failed during unified explanation: {e}")

    rec_res = None
    if rec_service and getattr(rec_service, "is_initialized", False):
        try:
            items = pred_service.items_by_quote.get(request_data.quotation_id, []) if pred_service else []
            p_ids = [item["product_id"] for item in items if "product_id" in item]
            if p_ids:
                c_id = quotation.get("customer_id")
                recs = rec_service.recommend(product_ids=p_ids, customer_id=c_id)
                rec_res = {"recommendations": recs}
        except Exception as e:
            logger.warning(f"Recommendations failed during unified explanation: {e}")

    return xai_service.explain_deal_unified(
        quotation_id=request_data.quotation_id,
        prediction_result=pred_res,
        local_prediction_expl=local_expl,
        anomaly_result=anomaly_res,
        deal_health_result=health_res,
        recommendation_result=rec_res
    )
