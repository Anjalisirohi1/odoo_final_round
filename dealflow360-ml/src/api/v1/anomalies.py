from fastapi import APIRouter, HTTPException, Request
from src.schemas.anomaly import QuotationAnomalyRequest, QuotationAnomalyResponse
from src.core.logging import logger

router = APIRouter()

@router.post("/quotation", response_model=QuotationAnomalyResponse)
async def analyze_quotation_anomaly(
    request_data: QuotationAnomalyRequest,
    request: Request
):
    """
    Analyzes a quotation for unusual business behavior using the Anomaly Detection Engine.
    """
    service = getattr(request.app.state, "anomaly_service", None)
    
    if service is None or not service.is_initialized:
        logger.error("Anomaly Detection Service is not initialized.")
        raise HTTPException(
            status_code=503,
            detail="Anomaly Detection Service is currently unavailable."
        )
        
    quotation_id = request_data.quotation_id
    
    # Lookup the quotation details from the internal historical store
    quotation = getattr(service, "historical_quotations", {}).get(quotation_id)
    
    if not quotation:
        logger.warning(f"Quotation {quotation_id} not found.")
        raise HTTPException(
            status_code=404,
            detail=f"Quotation {quotation_id} not found in historical data."
        )
        
    try:
        result = service.analyze_quotation(quotation)
        return QuotationAnomalyResponse(**result)
    except Exception as e:
        logger.error(f"Error analyzing quotation {quotation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during anomaly analysis.")
