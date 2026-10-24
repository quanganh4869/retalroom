import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from rentflow_backend.db.session import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class LoginLog(Base):
    __tablename__ = "login_logs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: f"login-{uuid.uuid4().hex[:8]}",
        index=True,
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        index=True,
        nullable=False,
    )
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    user_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="UNAUTHENTICATED", nullable=False)
    organization_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), index=True, nullable=False)
    location: Mapped[str] = mapped_column(String(255), default="Không rõ", nullable=False)
    device_type: Mapped[str] = mapped_column(String(50), default="DESKTOP", nullable=False)
    browser: Mapped[str] = mapped_column(String(100), default="Chrome", nullable=False)
    os: Mapped[str] = mapped_column(String(100), default="Windows", nullable=False)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    auth_method: Mapped[str] = mapped_column(String(50), default="PASSWORD", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SUCCESS", index=True, nullable=False)
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_suspicious: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )


class BlockedIP(Base):
    __tablename__ = "blocked_ips"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: f"block-{uuid.uuid4().hex[:8]}",
        index=True,
    )
    ip_address: Mapped[str] = mapped_column(String(45), unique=True, index=True, nullable=False)
    block_source: Mapped[str] = mapped_column(
        String(50), default="AUTOMATIC", nullable=False
    )  # AUTOMATIC, MANUAL
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    blocked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), default="ACTIVE", index=True, nullable=False
    )  # ACTIVE, EXPIRED, UNBLOCKED
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    unblocked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    unblocked_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    unblock_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class SecurityAlert(Base):
    __tablename__ = "security_alerts"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: f"sec-{uuid.uuid4().hex[:8]}",
        index=True,
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, index=True, nullable=False
    )
    severity: Mapped[str] = mapped_column(
        String(50), default="MEDIUM", index=True, nullable=False
    )  # CRITICAL, HIGH, MEDIUM, LOW
    category: Mapped[str] = mapped_column(
        String(50), default="BRUTE_FORCE", nullable=False
    )  # BRUTE_FORCE, RATE_LIMIT, UNUSUAL_GEO, ACCOUNT_TAKEOVER, API_ABUSE
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    target_email: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), index=True, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="OPEN", index=True, nullable=False
    )  # OPEN, INVESTIGATING, RESOLVED, DISMISSED
    detection_rule: Mapped[str | None] = mapped_column(String(255), nullable=True)
    related_event_ids: Mapped[str | None] = mapped_column(Text, nullable=True)
    investigation_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
