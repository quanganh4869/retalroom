from fastapi import APIRouter

from rentflow_backend.api.v1.endpoints.properties import (
    router as properties_router,
)

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(properties_router)
