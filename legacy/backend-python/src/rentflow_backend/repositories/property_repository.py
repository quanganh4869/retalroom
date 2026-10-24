from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from rentflow_backend.models.property import Property
from rentflow_backend.schemas.property import PropertyCreate, PropertyUpdate


class PropertyRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, property_id: str) -> Property | None:
        result = await self.session.execute(select(Property).where(Property.id == property_id))
        return result.scalars().first()

    async def get_by_name(self, name: str) -> Property | None:
        result = await self.session.execute(select(Property).where(Property.name == name))
        return result.scalars().first()

    async def list_all(self, skip: int = 0, limit: int = 20) -> tuple[list[Property], int]:
        count_stmt = select(func.count(Property.id))
        count_res = await self.session.execute(count_stmt)
        total = count_res.scalar_one()

        stmt = select(Property).order_by(Property.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def create(self, data: PropertyCreate) -> Property:
        prop = Property(
            name=data.name,
            address=data.address,
            city=data.city,
            total_floors=data.total_floors,
            description=data.description,
        )
        self.session.add(prop)
        await self.session.commit()
        await self.session.refresh(prop)
        return prop

    async def update(self, property_obj: Property, data: PropertyUpdate) -> Property:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(property_obj, field, value)

        await self.session.commit()
        await self.session.refresh(property_obj)
        return property_obj
