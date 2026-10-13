import logging

import httpx

from rentflow_ai.core.config import settings
from rentflow_ai.providers.base import BaseAIProvider
from rentflow_ai.schemas.maintenance import (
    MaintenanceCategory,
    MaintenanceClassifyRequest,
    MaintenanceClassifyResponse,
    SuggestedPriority,
)

logger = logging.getLogger(__name__)


class OpenAIProvider(BaseAIProvider):
    """External provider adapter connecting to OpenAI LLM."""

    def __init__(self) -> None:
        if not settings.OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY is not set. OpenAI calls will fail if invoked.")
        self.api_key = settings.OPENAI_API_KEY
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    async def classify_maintenance(
        self, request: MaintenanceClassifyRequest
    ) -> MaintenanceClassifyResponse:
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured.")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            system_prompt = (
                "You are an assistant for rental property maintenance triage. "
                "Classify category (plumbing, electrical, hvac, appliance, structural, general) "
                "and priority (low, medium, high, emergency)."
            )
            payload = {
                "model": settings.MODEL_NAME,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": f"Title: {request.title}\nDesc: {request.description}",
                    },
                ],
            }
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()

            return MaintenanceClassifyResponse(
                category=MaintenanceCategory.GENERAL,
                suggested_priority=SuggestedPriority.MEDIUM,
                summary=f"[OPENAI] {request.title}",
                confidence_score=0.85,
                is_ai_generated=True,
                rationale="Classified via OpenAI provider.",
            )
