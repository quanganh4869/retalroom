import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_security_login_logs_flow(async_client: AsyncClient) -> None:
    # 1. First fetch triggers auto-seed and returns paginated items
    res = await async_client.get("/api/v1/security/login-logs?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["items"]) <= 10
    assert "stats" in data
    assert data["stats"]["totalLogins"] > 0

    first_event_id = data["items"][0]["id"]

    # 2. Get detail of first event
    detail_res = await async_client.get(f"/api/v1/security/login-logs/{first_event_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["event"]["id"] == first_event_id
    assert "relatedEvents" in detail_data
    assert "isIpBlocked" in detail_data

    # 3. Filter by status
    success_res = await async_client.get("/api/v1/security/login-logs?status=SUCCESS")
    assert success_res.status_code == 200
    for item in success_res.json()["items"]:
        assert item["status"] == "SUCCESS"

    # 4. Search query
    search_res = await async_client.get("/api/v1/security/login-logs?search=admin@rentflow.vn")
    assert search_res.status_code == 200
    assert len(search_res.json()["items"]) >= 1


@pytest.mark.asyncio
async def test_security_analytics_api(async_client: AsyncClient) -> None:
    res = await async_client.get("/api/v1/security/login-logs/analytics?time_range=7d")
    assert res.status_code == 200
    data = res.json()
    assert data["timeRange"] == "7d"
    assert "totalAttempts" in data
    assert "activityTimeline" in data
    assert len(data["activityTimeline"]) > 0
    assert "authMethodDistribution" in data
    assert "statusDistribution" in data
    assert "suspiciousSources" in data


@pytest.mark.asyncio
async def test_security_export_csv_api(async_client: AsyncClient) -> None:
    res = await async_client.get("/api/v1/security/login-logs/export-csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "attachment;" in res.headers["content-disposition"]
    csv_text = res.text
    assert "Mã Sự Kiện" in csv_text
    assert "Thời Gian" in csv_text


@pytest.mark.asyncio
async def test_security_blocked_ips_crud(async_client: AsyncClient) -> None:
    # 1. List initial blocked IPs
    res = await async_client.get("/api/v1/security/blocked-ips")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert "stats" in data

    # 2. Add manual block
    new_ip = "192.0.2.45"
    payload = {
        "ipAddress": new_ip,
        "reason": "Thử nghiệm brute-force qua API",
        "durationHours": 24,
        "notes": "Test block automated",
    }
    create_res = await async_client.post("/api/v1/security/blocked-ips", json=payload)
    assert create_res.status_code == 201
    created_item = create_res.json()
    assert created_item["ipAddress"] == new_ip
    assert created_item["status"] == "ACTIVE"
    block_id = created_item["id"]

    # 3. Unblock IP
    unblock_res = await async_client.post(
        f"/api/v1/security/blocked-ips/{block_id}/unblock",
        json={"unblockReason": "Khách hàng đã xác minh danh tính"},
    )
    assert unblock_res.status_code == 200
    assert unblock_res.json()["status"] == "UNBLOCKED"
    assert unblock_res.json()["unblockReason"] == "Khách hàng đã xác minh danh tính"


@pytest.mark.asyncio
async def test_security_alerts_flow(async_client: AsyncClient) -> None:
    # 1. List alerts
    res = await async_client.get("/api/v1/security/alerts")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    first_alert = data["items"][0]
    alert_id = first_alert["id"]

    # 2. Update alert status
    patch_res = await async_client.patch(
        f"/api/v1/security/alerts/{alert_id}",
        json={"status": "INVESTIGATING", "assignedTo": "SecOps Specialist"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "INVESTIGATING"
    assert patch_res.json()["assignedTo"] == "SecOps Specialist"

    # 3. Append note
    note_res = await async_client.post(
        f"/api/v1/security/alerts/{alert_id}/notes",
        json={"note": "Đã kiểm tra log traffic, xác nhận chặn IP thành công."},
    )
    assert note_res.status_code == 200
    assert "Đã kiểm tra log traffic" in note_res.json()["investigationNotes"]
