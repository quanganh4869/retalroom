from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from rentflow_backend.api.v1.router import api_v1_router
from rentflow_backend.core.config import settings
from rentflow_backend.core.logging import setup_logging
from rentflow_backend.db.session import engine
from rentflow_backend.middleware.error_handler import (
    RequestLoggingMiddleware,
    register_exception_handlers,
)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    setup_logging()
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)
register_exception_handlers(app)

# API routes
app.include_router(api_v1_router)


@app.get("/health/live", tags=["health"])
async def health_live() -> JSONResponse:
    """Liveness probe: verifies process is alive."""
    return JSONResponse(content={"status": "live", "service": "rentflow-backend"})


@app.get("/health/ready", tags=["health"])
async def health_ready() -> JSONResponse:
    """Readiness probe: verifies database connectivity."""
    db_healthy = True
    db_error = None
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as exc:
        db_healthy = False
        db_error = str(exc)

    status_code = 200 if db_healthy else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if db_healthy else "unhealthy",
            "service": "rentflow-backend",
            "database": "connected" if db_healthy else f"disconnected: {db_error}",
        },
    )
