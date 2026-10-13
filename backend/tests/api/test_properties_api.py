import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_live_api(async_client: AsyncClient) -> None:
    res = await async_client.get("/health/live")
    assert res.status_code == 200
    assert res.json()["status"] == "live"


@pytest.mark.asyncio
async def test_property_crud_flow(async_client: AsyncClient) -> None:
    # 1. List initially empty
    res = await async_client.get("/api/v1/properties")
    assert res.status_code == 200
    assert res.json()["total"] == 0
    assert res.json()["items"] == []

    # 2. Create property
    payload = {
        "name": "Emerald Tower",
        "address": "88 Nguyen Van Linh",
        "city": "Da Nang",
        "total_floors": 12,
        "description": "Luxury sea-view apartments",
    }
    create_res = await async_client.post("/api/v1/properties", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["name"] == "Emerald Tower"
    prop_id = created_data["id"]

    # 3. Get property by ID
    get_res = await async_client.get(f"/api/v1/properties/{prop_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Emerald Tower"

    # 4. List contains 1 item
    list_res = await async_client.get("/api/v1/properties")
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 1
    assert list_res.json()["items"][0]["id"] == prop_id

    # 5. Duplicate name conflict
    dup_res = await async_client.post("/api/v1/properties", json=payload)
    assert dup_res.status_code == 409
    assert dup_res.json()["error"]["code"] == "CONFLICT"


@pytest.mark.asyncio
async def test_property_not_found(async_client: AsyncClient) -> None:
    res = await async_client.get("/api/v1/properties/unknown-id")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_property_update_api(async_client: AsyncClient) -> None:
    create_res = await async_client.post(
        "/api/v1/properties",
        json={"name": "Initial Tower", "address": "123 Street", "city": "Hanoi", "total_floors": 5},
    )
    assert create_res.status_code == 201
    prop_id = create_res.json()["id"]

    update_res = await async_client.put(
        f"/api/v1/properties/{prop_id}",
        json={"name": "Updated Tower", "total_floors": 6},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Tower"
    assert update_res.json()["total_floors"] == 6

