from fastapi import APIRouter
from src.schemas.common import StatusResponse
from src.core.config import settings

api_router = APIRouter()

@api_router.get("/status", response_model=StatusResponse)
async def get_status():
    return StatusResponse(
        status="operational",
        api_version="v1",
        service=settings.APP_NAME
    )

# Placeholders for future routes
# @api_router.post("/recommendations")
# @api_router.post("/anomaly/discount")
# @api_router.post("/deal-health")
# @api_router.post("/delivery/predict")
