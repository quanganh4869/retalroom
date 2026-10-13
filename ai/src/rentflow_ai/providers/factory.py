from rentflow_ai.core.config import settings
from rentflow_ai.providers.base import BaseAIProvider
from rentflow_ai.providers.mock_provider import MockAIProvider
from rentflow_ai.providers.openai_provider import OpenAIProvider


def get_ai_provider() -> BaseAIProvider:
    if settings.AI_PROVIDER.lower() == "openai":
        return OpenAIProvider()
    return MockAIProvider()
