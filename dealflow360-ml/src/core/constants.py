API_V1_STR = "/api/v1"

# Deal Health Constants & Defaults
DEFAULT_HEALTH_WEIGHTS = {
    "conversion_potential": 0.25,
    "engagement": 0.20,
    "financial_health": 0.20,
    "momentum": 0.15,
    "risk_safety": 0.20
}

HEALTH_CLASSIFICATIONS = {
    "EXCELLENT": 80.0,
    "HEALTHY": 60.0,
    "AT_RISK": 40.0,
    "CRITICAL": 0.0
}

MOMENTUM_SCORES = {
    "STRONG_POSITIVE": 0.95,
    "POSITIVE": 0.80,
    "STABLE": 0.60,
    "DECLINING": 0.40,
    "STAGNANT": 0.15
}

# Deal Intelligence Classifications & Defaults
INTELLIGENCE_CLASSIFICATIONS = {
    "STRONG_OPPORTUNITY": 80.0,
    "POSITIVE": 60.0,
    "MIXED": 40.0,
    "AT_RISK": 20.0,
    "CRITICAL": 0.0
}

DEFAULT_INTELLIGENCE_WEIGHTS = {
    "conversion": 0.35,
    "health": 0.35,
    "risk_penalty": 0.30
}

