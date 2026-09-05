from fastapi import APIRouter
from src.schemas.common import StatusResponse
from src.core.config import settings
from src.api.v1.recommendations import router as recommendations_router
from src.api.v1.anomalies import router as anomalies_router

api_router = APIRouter()

@api_router.get("/status", response_model=StatusResponse)
async def get_status():
    return StatusResponse(
        status="operational",
        api_version="v1",
        service=settings.APP_NAME
    )

api_router.include_router(recommendations_router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(anomalies_router, prefix="/anomalies", tags=["Anomalies"])
