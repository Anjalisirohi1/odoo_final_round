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
            
        return PredictionResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting deal outcome for {quotation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during deal outcome prediction.")
