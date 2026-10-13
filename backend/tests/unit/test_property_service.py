import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from rentflow_backend.exceptions.custom import (
    ConflictException,
    NotFoundException,
)
from rentflow_backend.repositories.property_repository import PropertyRepository
from rentflow_backend.schemas.property import PropertyCreate, PropertyUpdate
from rentflow_backend.services.property_service import PropertyService


@pytest.mark.asyncio
async def test_create_and_get_property(db_session: AsyncSession) -> None:
    repo = PropertyRepository(session=db_session)
    service = PropertyService(repository=repo)

    data = PropertyCreate(
        name="Sunrise Apartments",
        address="123 Nguyen Trai",
        city="Hanoi",
        total_floors=5,
        description="Modern serviced apartments",
    )
    created = await service.create_property(data)

    assert created.id is not None
    assert created.name == "Sunrise Apartments"
    assert created.city == "Hanoi"
    assert created.total_floors == 5

    fetched = await service.get_property(created.id)
    assert fetched.id == created.id
    assert fetched.name == "Sunrise Apartments"


@pytest.mark.asyncio
async def test_create_duplicate_property_name_raises_conflict(
    db_session: AsyncSession,
) -> None:
    repo = PropertyRepository(session=db_session)
    service = PropertyService(repository=repo)

    data = PropertyCreate(
        name="Green Garden",
        address="45 Le Duan",
        city="Da Nang",
        total_floors=3,
    )
    await service.create_property(data)

    with pytest.raises(ConflictException):
        await service.create_property(data)


@pytest.mark.asyncio
async def test_get_nonexistent_property_raises_not_found(
    db_session: AsyncSession,
) -> None:
    repo = PropertyRepository(session=db_session)
    service = PropertyService(repository=repo)

    with pytest.raises(NotFoundException):
        await service.get_property("non-existent-uuid")


@pytest.mark.asyncio
async def test_update_property(db_session: AsyncSession) -> None:
    repo = PropertyRepository(session=db_session)
    service = PropertyService(repository=repo)

    created = await service.create_property(
        PropertyCreate(
            name="Old Villa",
            address="10 Pasteur",
            city="Ho Chi Minh",
            total_floors=2,
        )
    )

    updated = await service.update_property(
        created.id, PropertyUpdate(name="Renovated Villa", total_floors=3)
    )

    assert updated.name == "Renovated Villa"
    assert updated.total_floors == 3
    assert updated.city == "Ho Chi Minh"
