from typing import Any

from fastapi import APIRouter, Depends, Query, status

from rentflow_backend.dependencies.services import (
    get_ai_client,
    get_property_service,
)
from rentflow_backend.schemas.property import (
    PropertyCreate,
    PropertyListResponse,
    PropertyResponse,
    PropertyUpdate,
)
from rentflow_backend.services.ai_client import AIServiceClient
from rentflow_backend.services.property_service import PropertyService

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=PropertyListResponse)
async def list_properties(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    service: PropertyService = Depends(get_property_service),
) -> PropertyListResponse:
    """Retrieve paginated list of rental properties."""
    return await service.list_properties(page=page, page_size=page_size)


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    data: PropertyCreate,
    service: PropertyService = Depends(get_property_service),
) -> PropertyResponse:
    """Register a new rental property."""
    return await service.create_property(data)


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: str,
    service: PropertyService = Depends(get_property_service),
) -> PropertyResponse:
    """Fetch details of a single rental property by ID."""
    return await service.get_property(property_id)


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    data: PropertyUpdate,
    service: PropertyService = Depends(get_property_service),
) -> PropertyResponse:
    """Update details of an existing property."""
    return await service.update_property(property_id, data)


@router.post("/{property_id}/maintenance/classify-ai")
async def classify_maintenance_for_property(
    property_id: str,
    payload: dict[str, Any],
    service: PropertyService = Depends(get_property_service),
    ai_client: AIServiceClient = Depends(get_ai_client),
) -> dict[str, Any]:
    """Delegate maintenance issue triage to AI service for a specific property."""
    await service.get_property(property_id)
    result = await ai_client.classify_maintenance(payload)
    return result
