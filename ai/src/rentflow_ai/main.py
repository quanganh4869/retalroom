from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from rentflow_ai.api.v1.router import api_v1_router
from rentflow_ai.core.config import settings
from rentflow_ai.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    setup_logging()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
    lifespan=lifespan,
)

app.include_router(api_v1_router)


@app.get("/health/live", tags=["health"])
async def health_live() -> JSONResponse:
    """Liveness probe: verifies process is running."""
    return JSONResponse(content={"status": "live", "service": "rentflow-ai"})


@app.get("/health/ready", tags=["health"])
async def health_ready() -> JSONResponse:
    """Readiness probe: verifies dependencies are initialized."""
    return JSONResponse(
        content={
            "status": "ready",
            "service": "rentflow-ai",
            "provider": settings.AI_PROVIDER,
        }
    )
