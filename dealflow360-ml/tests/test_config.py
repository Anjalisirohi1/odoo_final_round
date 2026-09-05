from src.core.config import Settings

def test_config_loading():
    settings = Settings()
    assert settings.APP_NAME == "DealFlow360 AI Intelligence Service"
    assert settings.APP_VERSION == "1.0.0"
