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
from src.anomaly_detection.service import AnomalyDetectionService
from src.deal_health.service import DealHealthService
from src.prediction.service import DealPredictionService
import pandas as pd

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode.")
    
    # Initialize Recommendation Knowledge Base
    try:
        logger.info("Generating data for ML services initialization...")
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
        
        # Initialize Anomaly Detection Service
        quotations = [q.model_dump() for q in provider.get_quotations()]
        anomaly_service = AnomalyDetectionService({
            "n_estimators": settings.ANOMALY_N_ESTIMATORS,
            "contamination": settings.ANOMALY_CONTAMINATION,
            "random_state": settings.ANOMALY_RANDOM_STATE,
            "medium_threshold": settings.ANOMALY_MEDIUM_THRESHOLD,
            "high_threshold": settings.ANOMALY_HIGH_THRESHOLD,
            "critical_threshold": settings.ANOMALY_CRITICAL_THRESHOLD
        })
        anomaly_service.initialize(quotations)
        app.state.anomaly_service = anomaly_service
        
        # Initialize Deal Health Intelligence Service
        customers = [c.model_dump() for c in provider.get_customers()]
        quotation_items = [qi.model_dump() for qi in provider.get_quotation_items()]
        orders = [o.model_dump() for o in provider.get_orders()]
        deal_events = [e.model_dump() for e in provider.get_deal_events()]
        sales_reps = [r.model_dump() for r in provider.get_sales_representatives()]
        
        deal_health_service = DealHealthService(anomaly_service=anomaly_service)
        deal_health_service.initialize(
            quotations=quotations,
            customers=customers,
            quotation_items=quotation_items,
            orders=orders,
            deal_events=deal_events,
            sales_reps=sales_reps
        )
        app.state.deal_health_service = deal_health_service
        
        # Initialize Deal Prediction Service
        prediction_service = DealPredictionService(
            deal_health_service=deal_health_service,
            anomaly_service=anomaly_service
        )
        prediction_service.set_context_data(
            quotations=quotations,
            customers=customers,
            quotation_items=quotation_items,
            orders=orders,
            deal_events=deal_events
        )
        
        # Check if saved model exists; load if present, but DO NOT automatically retrain on startup
        if not prediction_service.load_model():
            logger.warning(
                "Prediction model artifact not found at configured directory. "
                "Prediction service will remain uninitialized until python scripts/train_prediction_model.py is executed."
            )
            
        app.state.prediction_service = prediction_service
        
    except Exception as e:
        logger.error(f"Failed to initialize ML services: {e}")
        app.state.recommendation_service = None
        app.state.anomaly_service = None
        app.state.deal_health_service = None
        app.state.prediction_service = None
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
