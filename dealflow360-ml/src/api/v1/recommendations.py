from fastapi import APIRouter, Depends, HTTPException, Request
from src.schemas.recommendation import RecommendationRequest, RecommendationResponse
from src.recommendation.service import RecommendationService

router = APIRouter(tags=["recommendations"])

def get_recommendation_service(request: Request) -> RecommendationService:
    service = getattr(request.app.state, "recommendation_service", None)
    if not service or not service.is_initialized:
        raise HTTPException(
            status_code=503, 
            detail="Recommendation service is currently unavailable. Knowledge base may still be initializing."
        )
    return service

@router.post("/", response_model=RecommendationResponse)
def get_recommendations(
    req: RecommendationRequest,
    service: RecommendationService = Depends(get_recommendation_service)
):
    try:
        # Check empty or duplicate product_ids
        if not req.product_ids:
            raise ValueError("product_ids cannot be empty")
            
        return service.get_recommendations(req)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An internal error occurred.")
