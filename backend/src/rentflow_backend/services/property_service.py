import logging

from rentflow_backend.exceptions.custom import (
    ConflictException,
    NotFoundException,
)
from rentflow_backend.repositories.property_repository import PropertyRepository
from rentflow_backend.schemas.property import (
    PropertyCreate,
    PropertyListResponse,
    PropertyResponse,
    PropertyUpdate,
)

logger = logging.getLogger(__name__)


class PropertyService:
    def __init__(self, repository: PropertyRepository) -> None:
        self.repository = repository

    async def get_property(self, property_id: str) -> PropertyResponse:
        prop = await self.repository.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Property", property_id)
        return PropertyResponse.model_validate(prop)

    async def list_properties(self, page: int = 1, page_size: int = 20) -> PropertyListResponse:
        skip = (page - 1) * page_size
        items, total = await self.repository.list_all(skip=skip, limit=page_size)
        return PropertyListResponse(
            items=[PropertyResponse.model_validate(p) for p in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def create_property(self, data: PropertyCreate) -> PropertyResponse:
        existing = await self.repository.get_by_name(data.name)
        if existing:
            raise ConflictException(f"Property with name '{data.name}' already exists.")

        logger.info("Creating property: %s in %s", data.name, data.city)
        created = await self.repository.create(data)
        return PropertyResponse.model_validate(created)

    async def update_property(self, property_id: str, data: PropertyUpdate) -> PropertyResponse:
        prop = await self.repository.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Property", property_id)

        if data.name and data.name != prop.name:
            existing = await self.repository.get_by_name(data.name)
            if existing:
                raise ConflictException(f"Property with name '{data.name}' already exists.")

        updated = await self.repository.update(prop, data)
        return PropertyResponse.model_validate(updated)
