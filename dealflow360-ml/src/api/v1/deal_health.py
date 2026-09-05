from fastapi import APIRouter, HTTPException, Request
from src.schemas.deal_health import DealHealthRequest, DealHealthResponse
from src.core.logging import logger

router = APIRouter()

@router.post("/analyze", response_model=DealHealthResponse)
async def analyze_deal_health(
    request_data: DealHealthRequest,
    request: Request
):
    """
    Analyzes the comprehensive multi-dimensional health of a deal/quotation.
    Returns composite score, classification, dimension breakdown, momentum,
    evidence-based strengths/concerns, and prescriptive next-best actions.
    """
    service = getattr(request.app.state, "deal_health_service", None)
    
    if service is None or not service.is_initialized:
        logger.error("Deal Health Service is not initialized.")
        raise HTTPException(
            status_code=503,
            detail="Deal Health Service is currently unavailable."
        )
        
    quotation_id = request_data.quotation_id
    
    try:
        result = service.evaluate_deal_health(quotation_id)
        if result is None:
            logger.warning(f"Quotation {quotation_id} not found for Deal Health evaluation.")
            raise HTTPException(
                status_code=404,
                detail=f"Quotation {quotation_id} not found."
            )
            
        return DealHealthResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating deal health for {quotation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during Deal Health evaluation.")
