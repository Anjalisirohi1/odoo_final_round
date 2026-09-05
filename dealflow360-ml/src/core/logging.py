import logging
import sys
from .config import settings

def configure_logging():
    level_name = settings.LOG_LEVEL.upper()
    log_level = logging.getLevelNamesMapping().get(level_name, logging.INFO) if hasattr(logging, "getLevelNamesMapping") else logging.getLevelName(level_name)
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        stream=sys.stdout
    )
    
    logger = logging.getLogger("dealflow360_ai")
    return logger

logger = configure_logging()
