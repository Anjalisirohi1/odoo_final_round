from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class ModelStatus(str, Enum):
    CANDIDATE = "CANDIDATE"
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"
    DEPRECATED = "DEPRECATED"

class TrainingRunStatus(str, Enum):
    STARTED = "STARTED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class DriftLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"

class PerformanceStatus(str, Enum):
    STABLE = "STABLE"
    MINOR_DEGRADATION = "MINOR_DEGRADATION"
    SIGNIFICANT_DEGRADATION = "SIGNIFICANT_DEGRADATION"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"

class RetrainingPriority(str, Enum):
    NONE = "NONE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class RetrainingDecision(str, Enum):
    NO_ACTION = "NO_ACTION"
    MONITOR = "MONITOR"
    RETRAIN_RECOMMENDED = "RETRAIN_RECOMMENDED"
    RETRAIN_HIGH_PRIORITY = "RETRAIN_HIGH_PRIORITY"

class ModelHealthClassification(str, Enum):
    EXCELLENT = "EXCELLENT"
    HEALTHY = "HEALTHY"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class ActualOutcome(str, Enum):
    WON = "WON"
    LOST = "LOST"
    PENDING = "PENDING"

class ModelMetrics(BaseModel):
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None
    roc_auc: Optional[float] = None
    brier_score: Optional[float] = None
    additional_metrics: Dict[str, Any] = Field(default_factory=dict)

class ModelRegistryEntry(BaseModel):
    model_name: str
    model_version: str
    status: ModelStatus = ModelStatus.CANDIDATE
    created_at: str
    trained_at: Optional[str] = None
    training_dataset_version: Optional[str] = None
    training_samples: Optional[int] = None
    feature_count: Optional[int] = None
    algorithm: Optional[str] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    artifact_path: Optional[str] = None
    checksum: Optional[str] = None
    is_active: bool = False

class TrainingRun(BaseModel):
    run_id: str
    model_name: str
    model_version: str
    started_at: str
    completed_at: Optional[str] = None
    status: TrainingRunStatus
    dataset_version: Optional[str] = None
    training_samples: Optional[int] = None
    validation_samples: Optional[int] = None
    features: List[str] = Field(default_factory=list)
    candidate_models: Dict[str, Any] = Field(default_factory=dict)
    selected_model: Optional[str] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    artifact_path: Optional[str] = None
    duration_seconds: Optional[float] = None
    error_message: Optional[str] = None

class DatasetLineage(BaseModel):
    dataset_name: str
    dataset_version: str
    generated_at: str
    row_count: int
    column_count: int
    feature_columns: List[str]
    target_column: Optional[str] = None
    data_checksum: str
    source: str = "SyntheticDataProvider"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class PredictionObservation(BaseModel):
    prediction_id: str
    model_name: str
    model_version: str
    quotation_id: str
    predicted_outcome: str
    conversion_probability: float
    confidence: str
    expected_revenue: float
    timestamp: str
    feature_snapshot: Dict[str, Any] = Field(default_factory=dict)
    actual_outcome: ActualOutcome = ActualOutcome.PENDING
    actual_revenue: Optional[float] = None
    outcome_timestamp: Optional[str] = None

class OutcomeFeedbackRequest(BaseModel):
    prediction_id: Optional[str] = None
    quotation_id: Optional[str] = None
    actual_outcome: ActualOutcome
    actual_revenue: Optional[float] = None
    outcome_timestamp: Optional[datetime] = None

class PerformanceReport(BaseModel):
    model_name: str
    model_version: str
    sample_size: int
    resolved_count: int
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None
    roc_auc: Optional[float] = None
    brier_score: Optional[float] = None
    expected_revenue_total: Optional[float] = None
    actual_revenue_total: Optional[float] = None
    revenue_mae: Optional[float] = None
    revenue_mape: Optional[float] = None
    status: PerformanceStatus
    description: str

class PerformanceDegradationReport(BaseModel):
    model_name: str
    model_version: str
    training_metrics: Dict[str, float]
    production_metrics: Dict[str, float]
    metric_drops: Dict[str, float]
    status: PerformanceStatus
    description: str

class FeatureDriftResult(BaseModel):
    feature: str
    metric: str = "PSI"
    score: float
    level: DriftLevel
    training_mean: Optional[float] = None
    production_mean: Optional[float] = None
    details: Dict[str, Any] = Field(default_factory=dict)

class PredictionDriftResult(BaseModel):
    metric: str = "PSI"
    score: float
    level: DriftLevel
    training_distribution: Dict[str, float] = Field(default_factory=dict)
    production_distribution: Dict[str, float] = Field(default_factory=dict)

class DriftReport(BaseModel):
    model_name: str
    model_version: str
    sample_size: int
    features_analyzed: int
    low_drift_count: int
    moderate_drift_count: int
    high_drift_count: int
    feature_drift_results: List[FeatureDriftResult]
    prediction_drift: PredictionDriftResult
    overall_drift: DriftLevel
    generated_at: str

class RetrainingRecommendation(BaseModel):
    model_name: str
    model_version: str
    recommendation: RetrainingDecision
    priority: RetrainingPriority
    reasons: List[str]
    metrics_summary: Dict[str, Any] = Field(default_factory=dict)
    generated_at: str

class ModelHealthReport(BaseModel):
    model_name: str
    model_version: str
    health_score: float = Field(..., ge=0.0, le=100.0)
    classification: ModelHealthClassification
    components: Dict[str, float]
    reasons: List[str]
    generated_at: str

class ModelComparison(BaseModel):
    model_name: str
    champion_version: str
    challenger_version: str
    champion_metrics: Dict[str, float]
    challenger_metrics: Dict[str, float]
    metric_diffs: Dict[str, float]
    recommended: str
    reasons: List[str]

class ModelActivationResponse(BaseModel):
    model_name: str
    active_version: str
    previous_active_version: Optional[str] = None
    status: ModelStatus
    message: str
