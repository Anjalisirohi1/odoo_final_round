from fastapi import APIRouter, HTTPException, Request
from src.schemas.prediction import PredictionRequest, PredictionResponse
from src.core.logging import logger

router = APIRouter()

@router.post("/deal", response_model=PredictionResponse)
async def predict_deal_outcome(
    request_data: PredictionRequest,
    request: Request
):
    """
    Predicts deal conversion probability, outcome classification, statistical confidence,
    probability-weighted expected revenue, deal priority rank, and predictive drivers.
    """
    service = getattr(request.app.state, "prediction_service", None)
    
    if service is None or not service.is_initialized:
        logger.error("Deal Prediction Service is not initialized or model is not trained.")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "MODEL_NOT_TRAINED",
                "message": "Prediction model artifact is not available. Run scripts/train_prediction_model.py before using prediction endpoints."
            }
        )
        
    quotation_id = request_data.quotation_id
    
    try:
        result = service.predict_deal_outcome(quotation_id)
        if result is None:
            logger.warning(f"Quotation {quotation_id} not found for deal outcome prediction.")
            raise HTTPException(
                status_code=404,
                detail=f"Quotation {quotation_id} not found."
            )
            
        prediction_res = PredictionResponse(**result)

        # MLOps observation logging with graceful error handling
        mlops_service = getattr(request.app.state, "mlops_service", None)
        if mlops_service is not None:
            try:
                active_model = mlops_service.get_active_model("deal_outcome_prediction")
                model_ver = active_model.model_version if active_model else "1.0.0"
                mlops_service.log_prediction(
                    model_name="deal_outcome_prediction",
                    model_version=model_ver,
                    quotation_id=quotation_id,
                    predicted_outcome=prediction_res.predicted_outcome.value,
                    conversion_probability=prediction_res.conversion_probability,
                    confidence=prediction_res.confidence.level.value,
                    expected_revenue=prediction_res.revenue_forecast.expected_revenue,
                    raw_features=result.get("feature_snapshot", {})
                )
            except Exception as log_err:
                logger.warning(f"MLOps prediction logging failed gracefully for quote {quotation_id}: {log_err}")

        return prediction_res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting deal outcome for {quotation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during deal outcome prediction.")

