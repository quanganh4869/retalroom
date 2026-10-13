from abc import ABC, abstractmethod

from rentflow_ai.schemas.maintenance import (
    MaintenanceClassifyRequest,
    MaintenanceClassifyResponse,
)


class BaseAIProvider(ABC):
    @abstractmethod
    async def classify_maintenance(
        self, request: MaintenanceClassifyRequest
    ) -> MaintenanceClassifyResponse:
        """Classify maintenance request into category and priority."""
        pass
