import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoints(async_client: AsyncClient) -> None:
    live_res = await async_client.get("/health/live")
    assert live_res.status_code == 200
    assert live_res.json()["status"] == "live"

    ready_res = await async_client.get("/health/ready")
    assert ready_res.status_code == 200
    assert ready_res.json()["status"] == "ready"


@pytest.mark.asyncio
async def test_classify_maintenance_api(async_client: AsyncClient) -> None:
    payload = {
        "title": "Air Conditioner Stopped Cooling",
        "description": "The bedroom AC is blowing warm air and making a loud rattling sound.",
        "room_number": "301",
    }
    response = await async_client.post("/api/v1/maintenance/classify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "hvac"
    assert "suggested_priority" in data
    assert data["is_ai_generated"] is True
    assert 0.0 <= data["confidence_score"] <= 1.0


@pytest.mark.asyncio
async def test_classify_maintenance_validation_error(async_client: AsyncClient) -> None:
    # Missing required description field
    payload = {"title": "AC broken"}
    response = await async_client.post("/api/v1/maintenance/classify", json=payload)
    assert response.status_code == 422
