from fastapi import APIRouter

from rentflow_ai.api.v1.endpoints.maintenance import router as maintenance_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(maintenance_router)
