from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = "DealFlow360 AI Intelligence Service"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    
    # Phase 3 Recommendation Engine Settings
    RECOMMENDATION_MIN_SUPPORT: float = Field(default=0.01)
    RECOMMENDATION_MIN_CONFIDENCE: float = Field(default=0.2)
    RECOMMENDATION_MIN_LIFT: float = Field(default=1.0)
    RECOMMENDATION_MAX_RESULTS: int = Field(default=5)
    
    # Phase 4 Anomaly Detection Engine Settings
    ANOMALY_N_ESTIMATORS: int = Field(default=200)
    ANOMALY_CONTAMINATION: float = Field(default=0.05)
    ANOMALY_RANDOM_STATE: int = Field(default=42)
    ANOMALY_MEDIUM_THRESHOLD: float = Field(default=0.30)
    ANOMALY_HIGH_THRESHOLD: float = Field(default=0.55)
    ANOMALY_CRITICAL_THRESHOLD: float = Field(default=0.75)

    # Phase 5 Deal Health Intelligence Engine Settings
    DEAL_HEALTH_WEIGHT_CONVERSION: float = Field(default=0.25)
    DEAL_HEALTH_WEIGHT_ENGAGEMENT: float = Field(default=0.20)
    DEAL_HEALTH_WEIGHT_FINANCIAL: float = Field(default=0.20)
    DEAL_HEALTH_WEIGHT_MOMENTUM: float = Field(default=0.15)
    DEAL_HEALTH_WEIGHT_RISK_SAFETY: float = Field(default=0.20)
    
    DEAL_HEALTH_EXCELLENT_THRESHOLD: float = Field(default=80.0)
    DEAL_HEALTH_HEALTHY_THRESHOLD: float = Field(default=60.0)
    DEAL_HEALTH_AT_RISK_THRESHOLD: float = Field(default=40.0)
    
    # Phase 6 Deal Outcome Prediction & Forecasting Settings
    PREDICTION_MODEL_DIR: str = Field(default="artifacts/prediction")
    PREDICTION_MODEL_FILE: str = Field(default="best_model.joblib")
    PREDICTION_RANDOM_STATE: int = Field(default=42)
    PREDICTION_TEST_SIZE: float = Field(default=0.20)
    PREDICTION_SELECTION_METRIC: str = Field(default="roc_auc")
    
    CONFIDENCE_HIGH_THRESHOLD: float = Field(default=0.60)
    CONFIDENCE_MEDIUM_THRESHOLD: float = Field(default=0.30)
    
    PRIORITY_WEIGHT_CONVERSION: float = Field(default=0.35)
    PRIORITY_WEIGHT_REVENUE: float = Field(default=0.25)
    PRIORITY_WEIGHT_HEALTH: float = Field(default=0.20)
    PRIORITY_WEIGHT_MOMENTUM: float = Field(default=0.10)
    PRIORITY_WEIGHT_RISK_PENALTY: float = Field(default=0.10)
    
    PRIORITY_CRITICAL_THRESHOLD: float = Field(default=80.0)
    PRIORITY_HIGH_THRESHOLD: float = Field(default=60.0)
    PRIORITY_MEDIUM_THRESHOLD: float = Field(default=40.0)

    # Phase 7 Unified Deal Intelligence Engine Settings
    INTELLIGENCE_WEIGHT_CONVERSION: float = Field(default=0.35)
    INTELLIGENCE_WEIGHT_HEALTH: float = Field(default=0.35)
    INTELLIGENCE_WEIGHT_RISK_PENALTY: float = Field(default=0.30)
    INTELLIGENCE_AGREEMENT_BONUS: float = Field(default=5.0)
    INTELLIGENCE_AGREEMENT_PENALTY: float = Field(default=5.0)

    INTELLIGENCE_STRONG_OPPORTUNITY_THRESHOLD: float = Field(default=80.0)
    INTELLIGENCE_POSITIVE_THRESHOLD: float = Field(default=60.0)
    INTELLIGENCE_MIXED_THRESHOLD: float = Field(default=40.0)
    INTELLIGENCE_AT_RISK_THRESHOLD: float = Field(default=20.0)

    BUSINESS_IMPACT_CRITICAL_REVENUE: float = Field(default=250000.0)
    BUSINESS_IMPACT_HIGH_REVENUE: float = Field(default=100000.0)
    BUSINESS_IMPACT_MEDIUM_REVENUE: float = Field(default=25000.0)

    CONFLICT_HIGH_PREDICTION_THRESHOLD: float = Field(default=0.70)
    CONFLICT_LOW_PREDICTION_THRESHOLD: float = Field(default=0.40)
    CONFLICT_HEALTHY_THRESHOLD: float = Field(default=70.0)

    INTELLIGENCE_MAX_TOP_INSIGHTS: int = Field(default=5)
    INTELLIGENCE_MAX_ACTIONS: int = Field(default=5)

    # Phase 8 MLOps, Model Monitoring & Continuous Learning Engine Settings
    MLOPS_REGISTRY_DIR: str = Field(default="artifacts/registry")
    MLOPS_TRAINING_RUNS_DIR: str = Field(default="artifacts/training_runs")
    MLOPS_LINEAGE_DIR: str = Field(default="artifacts/lineage")
    MLOPS_PREDICTION_LOGS_DIR: str = Field(default="artifacts/prediction_logs")

    DRIFT_PSI_LOW_THRESHOLD: float = Field(default=0.10)
    DRIFT_PSI_HIGH_THRESHOLD: float = Field(default=0.25)
    MINIMUM_DRIFT_SAMPLE_SIZE: int = Field(default=30)

    PERFORMANCE_DEGRADATION_MINOR: float = Field(default=0.05)
    PERFORMANCE_DEGRADATION_SIGNIFICANT: float = Field(default=0.10)
    MINIMUM_PERFORMANCE_SAMPLE_SIZE: int = Field(default=10)

    RETRAINING_MIN_NEW_FEEDBACK: int = Field(default=50)
    MODEL_MAX_AGE_DAYS: int = Field(default=90)

    MODEL_HEALTH_WEIGHT_PERFORMANCE: float = Field(default=0.35)
    MODEL_HEALTH_WEIGHT_DRIFT: float = Field(default=0.30)
    MODEL_HEALTH_WEIGHT_FEEDBACK: float = Field(default=0.20)
    MODEL_HEALTH_WEIGHT_FRESHNESS: float = Field(default=0.15)

    # Phase 9 Explainable AI (XAI) & Trustworthy Decision Intelligence Settings
    XAI_ENABLED: bool = Field(default=True)
    XAI_MAX_DRIVERS: int = Field(default=3)
    XAI_MIN_CONTRIBUTION_THRESHOLD: float = Field(default=0.01)
    XAI_IMPACT_VERY_HIGH_THRESHOLD: float = Field(default=0.25)
    XAI_IMPACT_HIGH_THRESHOLD: float = Field(default=0.12)
    XAI_IMPACT_MEDIUM_THRESHOLD: float = Field(default=0.04)
    XAI_GLOBAL_IMPORTANCE_CACHE_ENABLED: bool = Field(default=True)
    XAI_FALLBACK_ENABLED: bool = Field(default=True)

    # Phase 10 Production Data Integration Layer Settings
    DATA_PROVIDER: str = Field(default="synthetic")
    DATABASE_URL: Optional[str] = Field(default=None)
    DATABASE_POOL_SIZE: int = Field(default=5)
    DATABASE_MAX_OVERFLOW: int = Field(default=10)
    DATABASE_TIMEOUT_SECONDS: float = Field(default=5.0)
    BACKEND_API_URL: Optional[str] = Field(default=None)
    BACKEND_API_TIMEOUT_SECONDS: float = Field(default=5.0)
    ML_SERVICE_API_KEY: str = Field(default="dev-ml-key-123")
    ALLOW_UNAUTHENTICATED_DEV: bool = Field(default=True)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def validate_weights(self) -> None:
        total = (
            self.DEAL_HEALTH_WEIGHT_CONVERSION
            + self.DEAL_HEALTH_WEIGHT_ENGAGEMENT
            + self.DEAL_HEALTH_WEIGHT_FINANCIAL
            + self.DEAL_HEALTH_WEIGHT_MOMENTUM
            + self.DEAL_HEALTH_WEIGHT_RISK_SAFETY
        )
        if not abs(total - 1.0) < 1e-5:
            raise ValueError(f"Deal Health weights must sum to 1.0 (got {total})")

settings = Settings()
settings.validate_weights()
