from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.health import router as health_router
from app.api.projects import router as projects_router
from app.core.config import Settings, get_settings
from app.db.session import create_database_engine


def create_app(settings: Settings | None = None) -> FastAPI:
    config = settings or get_settings()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        application.state.database_engine = create_database_engine(config)
        try:
            yield
        finally:
            application.state.database_engine.dispose()

    application = FastAPI(
        title="DevForge AI API",
        description="Phase 1 infrastructure and service health API.",
        version="0.1.0",
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Content-Type"],
    )
    application.include_router(health_router)
    application.include_router(projects_router)

    @application.exception_handler(SQLAlchemyError)
    async def database_error(request, exc):
        return JSONResponse(status_code=503, content={"detail": "Database temporarily unavailable"})

    return application


app = create_app()
