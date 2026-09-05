from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from src.core.config import settings
from src.core.logging import logger
from src.core.constants import API_V1_STR
from src.api.v1.router import api_router
from src.schemas.common import HealthResponse

from contextlib import asynccontextmanager

from src.data.providers.synthetic_provider import SyntheticDataProvider
from src.recommendation.service import RecommendationService
import pandas as pd

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode.")
    
    # Initialize Recommendation Knowledge Base
    try:
        logger.info("Generating data for Recommendation Engine initialization...")
        provider = SyntheticDataProvider(seed=42, num_customers=100, num_products=50, num_quotations=1000)
        
        orders_df = pd.DataFrame([o.model_dump() for o in provider.get_orders()])
        order_items_df = pd.DataFrame([oi.model_dump() for oi in provider.get_order_items()])
        products_df = pd.DataFrame([p.model_dump() for p in provider.get_products()])
        customers_df = pd.DataFrame([c.model_dump() for c in provider.get_customers()])
        
        rec_service = RecommendationService({
            "min_support": settings.RECOMMENDATION_MIN_SUPPORT,
            "min_confidence": settings.RECOMMENDATION_MIN_CONFIDENCE,
            "min_lift": settings.RECOMMENDATION_MIN_LIFT,
            "max_results": settings.RECOMMENDATION_MAX_RESULTS
        })
        
        rec_service.build_knowledge_base(orders_df, order_items_df, products_df, customers_df)
        app.state.recommendation_service = rec_service
        
    except Exception as e:
        logger.error(f"Failed to initialize recommendation engine: {e}")
        app.state.recommendation_service = None
        raise e
        
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="DealFlow360 AI Intelligence Service",
    lifespan=lifespan
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )

app.include_router(api_router, prefix=API_V1_STR)

@app.get("/", include_in_schema=False)
async def root():
    return {"message": f"Welcome to {settings.APP_NAME}"}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        service="dealflow360-ai",
        version=settings.APP_VERSION
    )
