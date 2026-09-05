from fastapi import APIRouter, HTTPException, Request
from src.schemas.deal_intelligence import DealIntelligenceRequest, DealIntelligenceResponse
from src.core.logging import logger

router = APIRouter()

@router.post("/analyze", response_model=DealIntelligenceResponse)
async def analyze_deal_intelligence(
    request_data: DealIntelligenceRequest,
    request: Request
):
    """
    Analyzes unified deal intelligence by orchestrating and synthesizing outputs
    from Recommendation, Anomaly Detection, Deal Health, and Outcome Prediction engines.
    Returns an executive assessment, intelligence score, agreements, conflicts, and next actions.
    """
    service = getattr(request.app.state, "deal_intelligence_service", None)

    if service is None or not getattr(service, "is_initialized", False):
        logger.error("Deal Intelligence Service is not initialized.")
        raise HTTPException(
            status_code=503,
            detail="Deal Intelligence Service is currently unavailable."
        )

    quotation_id = request_data.quotation_id

    try:
        result = service.analyze_deal(quotation_id)
        if result is None:
            logger.warning(f"Quotation {quotation_id} not found for Unified Deal Intelligence.")
            raise HTTPException(
                status_code=404,
                detail=f"Quotation {quotation_id} not found."
            )

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating deal intelligence for {quotation_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during Deal Intelligence evaluation."
        )
