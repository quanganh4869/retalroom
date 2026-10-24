import logging
from typing import Any

import httpx

from rentflow_backend.core.config import settings
from rentflow_backend.exceptions.custom import ExternalServiceException

logger = logging.getLogger(__name__)


class AIServiceClient:
    """Client for delegating AI operations to the independent AI service."""

    def __init__(self) -> None:
        self.base_url = settings.AI_SERVICE_URL
        self.timeout = settings.AI_SERVICE_TIMEOUT_SECONDS

    async def classify_maintenance(self, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.base_url}/api/v1/maintenance/classify"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    logger.error(
                        "AI service returned error %s: %s",
                        response.status_code,
                        response.text,
                    )
                    raise ExternalServiceException("rentflow-ai", f"Status {response.status_code}")
                data: dict[str, Any] = response.json()
                return data
        except httpx.RequestError as exc:
            logger.error("Failed to connect to AI service: %s", exc)
            raise ExternalServiceException("rentflow-ai", "Service unreachable") from exc
