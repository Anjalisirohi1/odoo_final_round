from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "DealFlow360 AI Intelligence Service"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    
    RECOMMENDATION_MIN_SUPPORT: float = 0.02
    RECOMMENDATION_MIN_CONFIDENCE: float = 0.30
    RECOMMENDATION_MIN_LIFT: float = 1.0
    RECOMMENDATION_MAX_RESULTS: int = 10

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
