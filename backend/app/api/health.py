from typing import Literal

from fastapi import APIRouter, Request, Response
from pydantic import BaseModel

from app.db.session import database_is_ready

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["healthy", "degraded"]
    service: str = "DevForge AI API"
    version: str = "0.1.0"
    database: Literal["connected", "unavailable"]


@router.get("/health", response_model=HealthResponse)
def health(request: Request, response: Response) -> HealthResponse:
    ready = database_is_ready(request.app.state.database_engine)
    response.status_code = 200 if ready else 503
    response.headers["Cache-Control"] = "no-store"
    return HealthResponse(
        status="healthy" if ready else "degraded",
        database="connected" if ready else "unavailable",
    )


@router.get("/health/live")
def liveness() -> dict[str, str]:
    return {"status": "alive"}
