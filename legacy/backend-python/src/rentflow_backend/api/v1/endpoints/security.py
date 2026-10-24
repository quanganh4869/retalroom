from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from rentflow_backend.dependencies.services import get_security_service
from rentflow_backend.schemas.security import (
    BlockedIPCreate,
    BlockedIPListResponse,
    BlockedIPResponse,
    BlockedIPUnblockRequest,
    LoginAnalyticsResponse,
    LoginEventDetailResponse,
    LoginLogListResponse,
    SecurityAlertAddNoteRequest,
    SecurityAlertListResponse,
    SecurityAlertResponse,
    SecurityAlertUpdateRequest,
)
from rentflow_backend.services.security_service import SecurityService

router = APIRouter(prefix="/security", tags=["security"])


# --- 1. Login Logs Endpoints ---
@router.get("/login-logs", response_model=LoginLogListResponse)
async def list_login_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    auth_method: str | None = Query(default=None),
    role: str | None = Query(default=None),
    device_type: str | None = Query(default=None),
    os: str | None = Query(default=None),
    is_suspicious: bool | None = Query(default=None),
    from_date: datetime | None = Query(default=None),
    to_date: datetime | None = Query(default=None),
    time_range: str | None = Query(default=None),
    service: SecurityService = Depends(get_security_service),
) -> LoginLogListResponse:
    """Retrieve filtered, paginated authentication login logs with overview stats."""
    return await service.list_login_logs(
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        auth_method=auth_method,
        role=role,
        device_type=device_type,
        os=os,
        is_suspicious=is_suspicious,
        from_date=from_date,
        to_date=to_date,
        time_range=time_range,
    )


@router.get("/login-logs/export-csv")
async def export_login_logs_csv(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    auth_method: str | None = Query(default=None),
    role: str | None = Query(default=None),
    ids: str | None = Query(default=None),
    service: SecurityService = Depends(get_security_service),
) -> Response:
    """Export matching login records to CSV."""
    selected_ids = [i.strip() for i in ids.split(",") if i.strip()] if ids else None
    csv_content = await service.export_login_logs_csv(
        search=search,
        status=status,
        auth_method=auth_method,
        role=role,
        ids=selected_ids,
    )
    filename = f"rentflow_login_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/login-logs/analytics", response_model=LoginAnalyticsResponse)
async def get_login_analytics(
    time_range: str = Query(default="7d"),
    service: SecurityService = Depends(get_security_service),
) -> LoginAnalyticsResponse:
    """Retrieve security analytics metrics, timeline, and distribution."""
    return await service.get_login_analytics(time_range=time_range)


@router.get("/login-logs/{event_id}", response_model=LoginEventDetailResponse)
async def get_login_event_detail(
    event_id: str,
    service: SecurityService = Depends(get_security_service),
) -> LoginEventDetailResponse:
    """Fetch forensic details for a specific authentication event."""
    try:
        return await service.get_login_event_detail(event_id=event_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


# --- 2. Blocked IPs Endpoints ---
@router.get("/blocked-ips", response_model=BlockedIPListResponse)
async def list_blocked_ips(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    block_source: str | None = Query(default=None),
    service: SecurityService = Depends(get_security_service),
) -> BlockedIPListResponse:
    """Retrieve list of blocked IPs and status statistics."""
    return await service.list_blocked_ips(
        search=search,
        status=status,
        block_source=block_source,
    )


@router.post("/blocked-ips", response_model=BlockedIPResponse, status_code=status.HTTP_201_CREATED)
async def create_blocked_ip(
    data: BlockedIPCreate,
    service: SecurityService = Depends(get_security_service),
) -> BlockedIPResponse:
    """Manually add an IP address to the blocklist."""
    return await service.create_blocked_ip(data=data)


@router.post("/blocked-ips/{block_id}/unblock", response_model=BlockedIPResponse)
async def unblock_ip(
    block_id: str,
    data: BlockedIPUnblockRequest,
    service: SecurityService = Depends(get_security_service),
) -> BlockedIPResponse:
    """Unblock an IP address with justification reason."""
    try:
        return await service.unblock_ip(block_id=block_id, data=data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


# --- 3. Security Alerts Endpoints ---
@router.get("/alerts", response_model=SecurityAlertListResponse)
async def list_security_alerts(
    search: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    status: str | None = Query(default=None),
    category: str | None = Query(default=None),
    service: SecurityService = Depends(get_security_service),
) -> SecurityAlertListResponse:
    """Retrieve security incident alerts and investigation stats."""
    return await service.list_security_alerts(
        search=search,
        severity=severity,
        status=status,
        category=category,
    )


@router.get("/alerts/{alert_id}", response_model=SecurityAlertResponse)
async def get_security_alert(
    alert_id: str,
    service: SecurityService = Depends(get_security_service),
) -> SecurityAlertResponse:
    """Fetch details of a single security alert."""
    try:
        return await service.get_security_alert(alert_id=alert_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/alerts/{alert_id}", response_model=SecurityAlertResponse)
async def update_security_alert(
    alert_id: str,
    data: SecurityAlertUpdateRequest,
    service: SecurityService = Depends(get_security_service),
) -> SecurityAlertResponse:
    """Update alert investigation status or assignee."""
    try:
        return await service.update_security_alert(alert_id=alert_id, data=data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/alerts/{alert_id}/notes", response_model=SecurityAlertResponse)
async def add_security_alert_note(
    alert_id: str,
    data: SecurityAlertAddNoteRequest,
    service: SecurityService = Depends(get_security_service),
) -> SecurityAlertResponse:
    """Append investigation note to a security alert."""
    try:
        return await service.add_security_alert_note(alert_id=alert_id, note=data.note)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
