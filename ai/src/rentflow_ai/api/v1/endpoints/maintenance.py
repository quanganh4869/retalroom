from fastapi import APIRouter, Depends

from rentflow_ai.providers.factory import get_ai_provider
from rentflow_ai.schemas.maintenance import (
    MaintenanceClassifyRequest,
    MaintenanceClassifyResponse,
)
from rentflow_ai.services.maintenance_service import MaintenanceService

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


def get_maintenance_service() -> MaintenanceService:
    provider = get_ai_provider()
    return MaintenanceService(provider=provider)


@router.post("/classify", response_model=MaintenanceClassifyResponse)
async def classify_maintenance(
    request: MaintenanceClassifyRequest,
    service: MaintenanceService = Depends(get_maintenance_service),
) -> MaintenanceClassifyResponse:
    """Classify maintenance issue category and suggested priority (AI recommendation)."""
    return await service.classify(request)
