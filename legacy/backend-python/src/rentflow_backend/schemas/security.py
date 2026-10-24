from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class LoginLogBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    email: str
    user_name: str = Field(alias="userName")
    role: str = "UNAUTHENTICATED"
    organization_name: str | None = Field(default=None, alias="organizationName")
    ip_address: str = Field(alias="ipAddress")
    location: str = "Không rõ"
    device_type: str = Field(default="DESKTOP", alias="deviceType")
    browser: str = "Chrome"
    os: str = "Windows"
    user_agent: str | None = Field(default=None, alias="userAgent")
    auth_method: str = Field(default="PASSWORD", alias="authMethod")
    status: str = "SUCCESS"
    failure_reason: str | None = Field(default=None, alias="failureReason")
    is_suspicious: bool = Field(default=False, alias="isSuspicious")


class LoginLogResponse(LoginLogBase):
    id: str
    timestamp: datetime
    created_at: datetime = Field(alias="createdAt")


class LoginOverviewStats(BaseModel):
    total_logins: int = Field(alias="totalLogins")
    successful_logins: int = Field(alias="successfulLogins")
    failed_logins: int = Field(alias="failedLogins")
    currently_blocked_ips: int = Field(alias="currentlyBlockedIps")


class LoginLogListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[LoginLogResponse]
    total: int
    page: int
    page_size: int = Field(alias="pageSize")
    total_pages: int = Field(alias="totalPages")
    stats: LoginOverviewStats


class LoginEventDetailResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    event: LoginLogResponse
    related_events: list[LoginLogResponse] = Field(default_factory=list, alias="relatedEvents")
    is_ip_blocked: bool = Field(default=False, alias="isIpBlocked")
    blocked_ip_record: dict[str, Any] | None = Field(default=None, alias="blockedIpRecord")


class TimelineDataPoint(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    timestamp: str
    label: str
    success: int
    failed: int
    blocked: int
    total: int


class DistributionItem(BaseModel):
    key: str
    label: str
    count: int
    percentage: float


class SuspiciousSourceItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ip_address: str = Field(alias="ipAddress")
    location: str
    failed_attempts: int = Field(alias="failedAttempts")
    accounts_targeted: list[str] = Field(alias="accountsTargeted")
    last_seen: str = Field(alias="lastSeen")
    risk_reason: str = Field(alias="riskReason")
    is_blocked: bool = Field(alias="isBlocked")


class LoginAnalyticsResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    time_range: str = Field(alias="timeRange")
    total_attempts: int = Field(alias="totalAttempts")
    success_count: int = Field(alias="successCount")
    failed_count: int = Field(alias="failedCount")
    blocked_count: int = Field(alias="blockedCount")
    success_rate: float = Field(alias="successRate")
    previous_period_comparison: dict[str, Any] = Field(alias="previousPeriodComparison")
    activity_timeline: list[TimelineDataPoint] = Field(alias="activityTimeline")
    auth_method_distribution: list[DistributionItem] = Field(alias="authMethodDistribution")
    status_distribution: list[DistributionItem] = Field(alias="statusDistribution")
    suspicious_sources: list[SuspiciousSourceItem] = Field(alias="suspiciousSources")


# --- Blocked IP Schemas ---
class BlockedIPCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ip_address: str = Field(alias="ipAddress")
    reason: str
    duration_hours: int = Field(default=24, alias="durationHours")  # 0 = vĩnh viễn
    notes: str | None = None


class BlockedIPUnblockRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    unblock_reason: str = Field(alias="unblockReason")


class BlockedIPResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    ip_address: str = Field(alias="ipAddress")
    block_source: str = Field(alias="blockSource")
    reason: str
    blocked_at: datetime = Field(alias="blockedAt")
    expires_at: datetime | None = Field(default=None, alias="expiresAt")
    status: str
    created_by: str | None = Field(default=None, alias="createdBy")
    unblocked_at: datetime | None = Field(default=None, alias="unblockedAt")
    unblocked_by: str | None = Field(default=None, alias="unblockedBy")
    unblock_reason: str | None = Field(default=None, alias="unblockReason")
    notes: str | None = None


class BlockedIPStats(BaseModel):
    currently_blocked: int = Field(alias="currentlyBlocked")
    auto_blocked: int = Field(alias="autoBlocked")
    manually_blocked: int = Field(alias="manuallyBlocked")


class BlockedIPListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[BlockedIPResponse]
    total: int
    stats: BlockedIPStats


# --- Security Alert Schemas ---
class SecurityAlertResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    timestamp: datetime
    severity: str
    category: str
    title: str
    description: str
    target_email: str | None = Field(default=None, alias="targetEmail")
    ip_address: str = Field(alias="ipAddress")
    status: str
    detection_rule: str | None = Field(default=None, alias="detectionRule")
    related_event_ids: str | None = Field(default=None, alias="relatedEventIds")
    investigation_notes: str | None = Field(default=None, alias="investigationNotes")
    assigned_to: str | None = Field(default=None, alias="assignedTo")
    resolved_at: datetime | None = Field(default=None, alias="resolvedAt")
    resolved_by: str | None = Field(default=None, alias="resolvedBy")


class SecurityAlertStats(BaseModel):
    new_alerts: int = Field(alias="newAlerts")
    investigating: int = Field(alias="investigating")
    unresolved_critical: int = Field(alias="unresolvedCritical")


class SecurityAlertListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[SecurityAlertResponse]
    total: int
    stats: SecurityAlertStats


class SecurityAlertUpdateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: str | None = None
    assigned_to: str | None = Field(default=None, alias="assignedTo")
    resolution_note: str | None = Field(default=None, alias="resolutionNote")


class SecurityAlertAddNoteRequest(BaseModel):
    note: str
