from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

class StatusResponse(BaseModel):
    status: str
    api_version: str
    service: str

class ErrorResponse(BaseModel):
    detail: str
