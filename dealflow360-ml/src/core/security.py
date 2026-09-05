import logging
from typing import Optional
from fastapi import Header, HTTPException, status
from src.core.config import settings

logger = logging.getLogger(__name__)

async def verify_api_key(x_api_key: Optional[str] = Header(default=None, alias="X-API-Key")) -> bool:
    """
    Verifies service-to-service API key authentication.
    Bypasses validation in development if ALLOW_UNAUTHENTICATED_DEV is enabled.
    """
    if settings.ALLOW_UNAUTHENTICATED_DEV:
        return True

    if not x_api_key:
        logger.warning("Authentication failed: Missing X-API-Key header.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "AUTHENTICATION_REQUIRED", "message": "Missing 'X-API-Key' header."}
        )

    if x_api_key != settings.ML_SERVICE_API_KEY:
        logger.warning("Authentication failed: Invalid X-API-Key header provided.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_API_KEY", "message": "Invalid API key provided."}
        )

    return True
