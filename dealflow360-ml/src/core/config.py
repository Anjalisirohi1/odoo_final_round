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

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
