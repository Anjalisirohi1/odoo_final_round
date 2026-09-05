from fastapi import APIRouter, HTTPException, Request, Query
from typing import List, Optional

from src.schemas.mlops import (
    ModelRegistryEntry, ModelHealthReport, PerformanceReport,
    DriftReport, RetrainingRecommendation, OutcomeFeedbackRequest,
    PredictionObservation, ModelActivationResponse, ModelComparison
)
from src.core.logging import logger

router = APIRouter()

def get_mlops_service(request: Request):
    service = getattr(request.app.state, "mlops_service", None)
    if service is None:
        logger.error("MLOps Service is not initialized.")
        raise HTTPException(status_code=503, detail="MLOps Service is currently unavailable.")
    return service

@router.get("/models", response_model=List[ModelRegistryEntry])
async def list_models(request: Request):
    """Lists all registered models in the local model registry."""
    service = get_mlops_service(request)
    return service.list_models()

@router.get("/models/{model_name}", response_model=List[ModelRegistryEntry])
async def get_model_versions(model_name: str, request: Request):
    """Lists all versions registered for a given model."""
    service = get_mlops_service(request)
    models = service.list_models(model_name=model_name)
    if not models:
        raise HTTPException(status_code=404, detail=f"No models found for name '{model_name}'.")
    return models

@router.get("/models/{model_name}/active", response_model=ModelRegistryEntry)
async def get_active_model(model_name: str, request: Request):
    """Gets the currently active model version for a given model name."""
    service = get_mlops_service(request)
    active = service.get_active_model(model_name)
    if not active:
        raise HTTPException(status_code=404, detail=f"No active model found for '{model_name}'.")
    return active

@router.get("/models/{model_name}/health", response_model=ModelHealthReport)
async def get_model_health(
    model_name: str,
    request: Request,
    version: Optional[str] = Query(default=None, description="Optional model version")
):
    """Returns the operational model health assessment (0–100 score and tier)."""
    service = get_mlops_service(request)
    return service.get_model_health(model_name, version=version)

@router.get("/models/{model_name}/performance", response_model=PerformanceReport)
async def get_model_performance(
    model_name: str,
    request: Request,
    version: Optional[str] = Query(default=None, description="Optional model version"),
    window_size: Optional[int] = Query(default=None, description="Optional recent resolved window size")
):
    """Evaluates production accuracy metrics across resolved outcome feedback."""
    service = get_mlops_service(request)
    return service.get_performance_report(model_name, version=version, window_size=window_size)

@router.get("/models/{model_name}/drift", response_model=DriftReport)
async def get_model_drift(
    model_name: str,
    request: Request,
    version: Optional[str] = Query(default=None, description="Optional model version")
):
    """Returns covariate feature drift and prediction distribution drift report."""
    service = get_mlops_service(request)
    return service.get_drift_report(model_name, version=version)

@router.get("/models/{model_name}/retraining-advice", response_model=RetrainingRecommendation)
async def get_retraining_advice(
    model_name: str,
    request: Request,
    version: Optional[str] = Query(default=None, description="Optional model version")
):
    """Generates continuous learning retraining recommendations (NO automatic retraining)."""
    service = get_mlops_service(request)
    return service.get_retraining_advice(model_name, version=version)

@router.post("/feedback", response_model=PredictionObservation)
async def submit_outcome_feedback(
    feedback_req: OutcomeFeedbackRequest,
    request: Request
):
    """Attaches actual deal outcome (WON/LOST) and realized revenue to a prediction observation."""
    service = get_mlops_service(request)
    try:
        return service.record_feedback(feedback_req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error recording feedback: {e}")
        raise HTTPException(status_code=500, detail="Internal server error recording feedback.")

@router.post("/models/{model_name}/{version}/activate", response_model=ModelActivationResponse)
async def activate_model_version(
    model_name: str,
    version: str,
    request: Request
):
    """Explicitly promotes/activates a candidate model version, archiving the previous active model."""
    service = get_mlops_service(request)
    try:
        active_entry, prev_entry = service.activate_model(model_name, version)
        prev_ver = prev_entry.model_version if prev_entry else None
        return ModelActivationResponse(
            model_name=model_name,
            active_version=active_entry.model_version,
            previous_active_version=prev_ver,
            status=active_entry.status,
            message=f"Model '{model_name}' version '{version}' successfully activated."
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error activating model: {e}")
        raise HTTPException(status_code=500, detail="Internal server error activating model.")

@router.post("/models/{model_name}/compare", response_model=ModelComparison)
async def compare_champion_challenger(
    model_name: str,
    request: Request,
    challenger_version: str = Query(..., description="Challenger model version to compare against active Champion")
):
    """Compares the active Champion model with a candidate Challenger model."""
    service = get_mlops_service(request)
    try:
        return service.compare_models(model_name, challenger_version)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error comparing models: {e}")
        raise HTTPException(status_code=500, detail="Internal server error comparing models.")
