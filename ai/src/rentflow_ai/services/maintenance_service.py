import logging

from rentflow_ai.providers.base import BaseAIProvider
from rentflow_ai.schemas.maintenance import (
    MaintenanceClassifyRequest,
    MaintenanceClassifyResponse,
)

logger = logging.getLogger(__name__)


class MaintenanceService:
    def __init__(self, provider: BaseAIProvider) -> None:
        self.provider = provider

    async def classify(self, request: MaintenanceClassifyRequest) -> MaintenanceClassifyResponse:
        logger.info("Classifying maintenance request: %s", request.title)
        result = await self.provider.classify_maintenance(request)
        return result
