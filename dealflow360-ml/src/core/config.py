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
    
    # Classification Thresholds
    DEAL_HEALTH_EXCELLENT_THRESHOLD: float = Field(default=80.0)
    DEAL_HEALTH_HEALTHY_THRESHOLD: float = Field(default=60.0)
    DEAL_HEALTH_AT_RISK_THRESHOLD: float = Field(default=40.0)

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
