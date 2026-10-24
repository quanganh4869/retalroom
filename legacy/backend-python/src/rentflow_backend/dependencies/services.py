from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from rentflow_backend.dependencies.database import get_db
from rentflow_backend.repositories.property_repository import PropertyRepository
from rentflow_backend.services.ai_client import AIServiceClient
from rentflow_backend.services.property_service import PropertyService
from rentflow_backend.services.security_service import SecurityService


def get_property_repository(
    session: AsyncSession = Depends(get_db),
) -> PropertyRepository:
    return PropertyRepository(session=session)


def get_property_service(
    repo: PropertyRepository = Depends(get_property_repository),
) -> PropertyService:
    return PropertyService(repository=repo)


def get_security_service(
    session: AsyncSession = Depends(get_db),
) -> SecurityService:
    return SecurityService(session=session)


def get_ai_client() -> AIServiceClient:
    return AIServiceClient()
