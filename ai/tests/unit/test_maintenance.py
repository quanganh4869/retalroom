import pytest
from pydantic import ValidationError

from rentflow_ai.providers.mock_provider import MockAIProvider
from rentflow_ai.schemas.maintenance import (
    MaintenanceCategory,
    MaintenanceClassifyRequest,
    SuggestedPriority,
)
from rentflow_ai.services.maintenance_service import MaintenanceService


@pytest.mark.asyncio
async def test_mock_provider_plumbing_leak() -> None:
    provider = MockAIProvider()
    request = MaintenanceClassifyRequest(
        title="Pipe leaking water",
        description="The bathroom pipe burst and water is leaking rapidly onto the floor.",
        room_number="102",
    )
    result = await provider.classify_maintenance(request)

    assert result.category == MaintenanceCategory.PLUMBING
    assert result.suggested_priority == SuggestedPriority.EMERGENCY
    assert result.is_ai_generated is True
    assert result.confidence_score >= 0.90


@pytest.mark.asyncio
async def test_mock_provider_electrical_flicker() -> None:
    provider = MockAIProvider()
    service = MaintenanceService(provider=provider)
    request = MaintenanceClassifyRequest(
        title="Living room lights flicker",
        description="The ceiling light has a flicker whenever switched on.",
    )
    result = await service.classify(request)

    assert result.category == MaintenanceCategory.ELECTRICAL
    assert result.suggested_priority == SuggestedPriority.MEDIUM
    assert result.confidence_score > 0.0


def test_invalid_request_schema() -> None:
    with pytest.raises(ValidationError):
        # Description too short (min length is 5)
        MaintenanceClassifyRequest(title="Leak", description="bad")
