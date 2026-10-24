import csv
import io
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from rentflow_backend.models.security import BlockedIP, LoginLog, SecurityAlert
from rentflow_backend.schemas.security import (
    BlockedIPCreate,
    BlockedIPListResponse,
    BlockedIPResponse,
    BlockedIPStats,
    BlockedIPUnblockRequest,
    DistributionItem,
    LoginAnalyticsResponse,
    LoginEventDetailResponse,
    LoginLogListResponse,
    LoginLogResponse,
    LoginOverviewStats,
    SecurityAlertListResponse,
    SecurityAlertResponse,
    SecurityAlertStats,
    SecurityAlertUpdateRequest,
    SuspiciousSourceItem,
    TimelineDataPoint,
)


def utc_now() -> datetime:
    return datetime.now(UTC)


def to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


class SecurityService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _ensure_seeded(self) -> None:
        """Seed initial security data if tables are empty."""
        count_stmt = select(func.count()).select_from(LoginLog)
        count_result = await self.session.execute(count_stmt)
        count = count_result.scalar() or 0
        if count > 0:
            return

        now = utc_now()

        # Seed Login Logs
        sample_logs = [
            LoginLog(
                id="login-001",
                timestamp=now - timedelta(minutes=15),
                email="admin@rentflow.vn",
                user_name="Nguyễn Quốc Anh (SuperAdmin)",
                role="SUPERADMIN",
                organization_name="RentFlow Core HQ",
                ip_address="118.69.182.10",
                location="Hà Nội, Việt Nam",
                device_type="DESKTOP",
                browser="Chrome 129.0",
                os="Windows 11",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0",
                auth_method="PASSWORD_2FA",
                status="SUCCESS",
                is_suspicious=False,
            ),
            LoginLog(
                id="login-002",
                timestamp=now - timedelta(hours=1, minutes=10),
                email="long.hoanggia@gmail.com",
                user_name="Hoàng Gia Long",
                role="LANDLORD",
                organization_name="Hoàng Gia Luxury Apartment",
                ip_address="115.78.21.90",
                location="TP.HCM, Việt Nam",
                device_type="MOBILE",
                browser="Safari Mobile 18.0",
                os="iOS 18.1",
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15",
                auth_method="PASSWORD",
                status="SUCCESS",
                is_suspicious=False,
            ),
            LoginLog(
                id="login-003",
                timestamp=now - timedelta(hours=2, minutes=20),
                email="phucthinh@gmail.com",
                user_name="Trần Phúc Thịnh",
                role="LANDLORD",
                organization_name="Phúc Thịnh Home",
                ip_address="14.238.10.45",
                location="Hà Nội, Việt Nam",
                device_type="DESKTOP",
                browser="Firefox 130.0",
                os="macOS Sonoma",
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:130.0) Gecko/20100101 Firefox/130.0",
                auth_method="GOOGLE_SSO",
                status="SUCCESS",
                is_suspicious=False,
            ),
            LoginLog(
                id="login-004",
                timestamp=now - timedelta(hours=3, minutes=45),
                email="attacker-probe@proton.me",
                user_name="Không xác định",
                role="UNAUTHENTICATED",
                organization_name=None,
                ip_address="45.154.255.82",
                location="Frankfurt, Đức (Tor Node / Proxy)",
                device_type="API_CLIENT",
                browser="Python-requests 2.31",
                os="Linux x86_64",
                user_agent="python-requests/2.31.0",
                auth_method="PASSWORD",
                status="FAILED",
                failure_reason="Sai mật khẩu liên tiếp (Brute-force detected)",
                is_suspicious=True,
            ),
            LoginLog(
                id="login-005",
                timestamp=now - timedelta(hours=3, minutes=46),
                email="attacker-probe@proton.me",
                user_name="Không xác định",
                role="UNAUTHENTICATED",
                organization_name=None,
                ip_address="45.154.255.82",
                location="Frankfurt, Đức (Tor Node / Proxy)",
                device_type="API_CLIENT",
                browser="Python-requests 2.31",
                os="Linux x86_64",
                user_agent="python-requests/2.31.0",
                auth_method="PASSWORD",
                status="BLOCKED",
                failure_reason="WAF Rate Limit: Vượt ngưỡng 10 lần thử trong 60 giây. Đã tự động đưa vào danh sách chặn 24h.",
                is_suspicious=True,
            ),
            LoginLog(
                id="login-006",
                timestamp=now - timedelta(hours=5),
                email="tam.minh@yahoo.com",
                user_name="Vũ Minh Tâm",
                role="LANDLORD",
                organization_name="Minh Tâm Co-living",
                ip_address="171.244.33.120",
                location="Đà Nẵng, Việt Nam",
                device_type="DESKTOP",
                browser="Edge 129.0",
                os="Windows 10",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129.0 Edge/129.0",
                auth_method="PASSWORD",
                status="SUCCESS",
                is_suspicious=False,
            ),
            LoginLog(
                id="login-007",
                timestamp=now - timedelta(days=1, hours=2),
                email="lan.nguyen@gmail.com",
                user_name="Nguyễn Thị Lan",
                role="TENANT",
                organization_name=None,
                ip_address="27.72.105.15",
                location="Hà Nội, Việt Nam",
                device_type="MOBILE",
                browser="Chrome Mobile 129.0",
                os="Android 14",
                user_agent="Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Chrome/129.0",
                auth_method="PASSWORD",
                status="SUCCESS",
                is_suspicious=False,
            ),
            LoginLog(
                id="login-008",
                timestamp=now - timedelta(days=1, hours=4),
                email="unknown@scan.net",
                user_name="Không xác định",
                role="UNAUTHENTICATED",
                organization_name=None,
                ip_address="103.1.238.10",
                location="Singapore (Cloud VPS)",
                device_type="API_CLIENT",
                browser="Go-http-client 1.1",
                os="Linux x86_64",
                user_agent="Go-http-client/1.1",
                auth_method="PASSWORD",
                status="BLOCKED",
                failure_reason="Địa chỉ IP nằm trong danh sách đen Cloudflare/WAF",
                is_suspicious=True,
            ),
            LoginLog(
                id="login-009",
                timestamp=now - timedelta(days=2, hours=1),
                email="bao.tran@rentflow.vn",
                user_name="Trần Văn Bảo (Support Ops)",
                role="SUPPORT_AGENT",
                organization_name="RentFlow Core HQ",
                ip_address="14.161.40.12",
                location="Hà Nội, Việt Nam",
                device_type="DESKTOP",
                browser="Firefox 130.0",
                os="Windows 10",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
                auth_method="PASSWORD_2FA",
                status="SUCCESS",
                is_suspicious=False,
            ),
            LoginLog(
                id="login-010",
                timestamp=now - timedelta(days=2, hours=3),
                email="hieu.le@outlook.com",
                user_name="Lê Trung Hiếu",
                role="LANDLORD",
                organization_name="Hiếu Phát Real Estate",
                ip_address="113.161.70.32",
                location="Hải Phòng, Việt Nam",
                device_type="TABLET",
                browser="Safari 17.5",
                os="iPadOS 17.5",
                user_agent="Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15",
                auth_method="GOOGLE_SSO",
                status="SUCCESS",
                is_suspicious=False,
            ),
            LoginLog(
                id="login-011",
                timestamp=now - timedelta(days=3, hours=5),
                email="phucthinh@gmail.com",
                user_name="Trần Phúc Thịnh",
                role="LANDLORD",
                organization_name="Phúc Thịnh Home",
                ip_address="14.238.10.45",
                location="Hà Nội, Việt Nam",
                device_type="MOBILE",
                browser="RentFlow App (iOS)",
                os="iOS 18.0",
                user_agent="RentFlow/1.4.0 (iPhone; iOS 18.0)",
                auth_method="PASSWORD",
                status="SUCCESS",
                is_suspicious=False,
            ),
            LoginLog(
                id="login-012",
                timestamp=now - timedelta(days=4, hours=2),
                email="scanner-bot@shodan.io",
                user_name="Scanner Bot",
                role="UNAUTHENTICATED",
                organization_name=None,
                ip_address="198.20.70.1",
                location="Texas, Mỹ",
                device_type="API_CLIENT",
                browser="Zgrab 2.0",
                os="Linux",
                user_agent="Mozilla/5.0 zgrab/0.x",
                auth_method="PASSWORD",
                status="FAILED",
                failure_reason="Thử dò quét endpoint quản trị",
                is_suspicious=True,
            ),
        ]
        for log in sample_logs:
            self.session.add(log)

        # Seed Blocked IPs
        sample_blocked = [
            BlockedIP(
                id="block-001",
                ip_address="45.154.255.82",
                block_source="AUTOMATIC",
                reason="Dò quét brute-force mật khẩu quản trị (>10 lần/phút)",
                blocked_at=now - timedelta(hours=3, minutes=46),
                expires_at=now + timedelta(hours=20, minutes=14),
                status="ACTIVE",
                created_by="WAF Engine v2",
                notes="IP xuất xứ từ Frankfurt, Đức (Tor Exit Node)",
            ),
            BlockedIP(
                id="block-002",
                ip_address="103.1.238.10",
                block_source="MANUAL",
                reason="Spam webhook callback và giả mạo chữ ký HMAC",
                blocked_at=now - timedelta(days=1),
                expires_at=now + timedelta(days=6),
                status="ACTIVE",
                created_by="admin@rentflow.vn",
                notes="Đã kiểm tra dải mạng, không thuộc đối tác cổng thanh toán chính thức.",
            ),
            BlockedIP(
                id="block-003",
                ip_address="194.26.29.112",
                block_source="AUTOMATIC",
                reason="Quét lỗ hổng API Gateway",
                blocked_at=now - timedelta(days=7),
                expires_at=now - timedelta(days=6),
                status="EXPIRED",
                created_by="WAF Engine v2",
                notes="Đã tự động hết hạn 24h sau khi khóa.",
            ),
        ]
        for b in sample_blocked:
            self.session.add(b)

        # Seed Security Alerts
        sample_alerts = [
            SecurityAlert(
                id="sec-001",
                timestamp=now - timedelta(hours=3, minutes=45),
                severity="HIGH",
                category="BRUTE_FORCE",
                title="Phát hiện chuỗi dò quét mật khẩu từ IP quốc tế",
                description="IP 45.154.255.82 đã thực hiện 12 lần đăng nhập thất bại liên tiếp vào tài khoản quản trị trong 45 giây. Hệ thống WAF đã tự động đưa địa chỉ IP vào danh sách chặn tạm thời 24h.",
                target_email="admin@rentflow.vn",
                ip_address="45.154.255.82",
                status="RESOLVED",
                detection_rule="RULE_AUTH_BRUTEFORCE_THRESHOLD_10",
                related_event_ids="login-004,login-005",
                investigation_notes="Hệ thống WAF đã kích hoạt tự động, xác nhận không có tài khoản nào bị xâm nhập.",
                assigned_to="admin@rentflow.vn",
                resolved_at=now - timedelta(hours=3, minutes=30),
                resolved_by="admin@rentflow.vn",
            ),
            SecurityAlert(
                id="sec-002",
                timestamp=now - timedelta(hours=8),
                severity="MEDIUM",
                category="RATE_LIMIT",
                title="Cảnh báo chữ ký Webhook thanh toán không hợp lệ",
                description="Endpoint nhận callback IPN từ cổng thanh toán ghi nhận 3 request có checksum HMAC không trùng khớp. Giao dịch được chuyển sang trạng thái chờ đối soát thủ công.",
                target_email=None,
                ip_address="103.1.238.10",
                status="INVESTIGATING",
                detection_rule="RULE_PAYMENT_HMAC_MISMATCH",
                related_event_ids="login-008",
                investigation_notes="Đang liên hệ bên cổng thanh toán để đối soát log checksum.",
                assigned_to="Trần Văn Bảo (Support Ops)",
            ),
            SecurityAlert(
                id="sec-003",
                timestamp=now - timedelta(days=1, hours=2),
                severity="LOW",
                category="UNUSUAL_GEO",
                title="Đăng nhập từ vị trí mới chưa từng ghi nhận",
                description="Tài khoản tam.minh@yahoo.com đăng nhập lần đầu từ dải IP Đà Nẵng (171.244.33.120). Email xác thực thiết bị mới đã được gửi tới người dùng thành công.",
                target_email="tam.minh@yahoo.com",
                ip_address="171.244.33.120",
                status="RESOLVED",
                detection_rule="RULE_GEO_ANOMALY_FIRST_TIME",
                related_event_ids="login-006",
                investigation_notes="Chủ tài khoản đã bấm link Xác nhận danh tính qua email lúc 11:25.",
                assigned_to="Hệ thống tự động",
                resolved_at=now - timedelta(days=1, hours=1),
                resolved_by="Người dùng qua Email",
            ),
            SecurityAlert(
                id="sec-004",
                timestamp=now - timedelta(minutes=40),
                severity="CRITICAL",
                category="ACCOUNT_TAKEOVER",
                title="Cảnh báo nỗ lực thay đổi mật khẩu từ IP lạ không trùng phiên",
                description="Tài khoản owner@coliving.vn có yêu cầu đặt lại mật khẩu từ địa chỉ IP không trùng khớp với phiên đăng nhập đang hoạt động. Mã OTP đã gửi qua SMS.",
                target_email="owner@coliving.vn",
                ip_address="185.220.101.5",
                status="OPEN",
                detection_rule="RULE_ACCOUNT_TAKEOVER_SESSION_MISMATCH",
                related_event_ids=None,
                investigation_notes=None,
                assigned_to=None,
            ),
        ]
        for a in sample_alerts:
            self.session.add(a)

        await self.session.commit()

    async def list_login_logs(
        self,
        page: int = 1,
        page_size: int = 25,
        search: str | None = None,
        status: str | None = None,
        auth_method: str | None = None,
        role: str | None = None,
        device_type: str | None = None,
        os: str | None = None,
        is_suspicious: bool | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        time_range: str | None = None,
    ) -> LoginLogListResponse:
        await self._ensure_seeded()

        query = select(LoginLog)

        # Time range filter
        if time_range:
            now = utc_now()
            if time_range == "24h":
                query = query.where(LoginLog.timestamp >= now - timedelta(hours=24))
            elif time_range == "7d":
                query = query.where(LoginLog.timestamp >= now - timedelta(days=7))
            elif time_range == "30d":
                query = query.where(LoginLog.timestamp >= now - timedelta(days=30))

        if from_date:
            query = query.where(LoginLog.timestamp >= from_date)
        if to_date:
            query = query.where(LoginLog.timestamp <= to_date)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(
                or_(
                    LoginLog.email.ilike(search_pattern),
                    LoginLog.user_name.ilike(search_pattern),
                    LoginLog.ip_address.ilike(search_pattern),
                    LoginLog.id.ilike(search_pattern),
                    LoginLog.failure_reason.ilike(search_pattern),
                    LoginLog.location.ilike(search_pattern),
                )
            )

        if status and status != "ALL":
            query = query.where(LoginLog.status == status)

        if auth_method and auth_method != "ALL":
            query = query.where(LoginLog.auth_method == auth_method)

        if role and role != "ALL":
            query = query.where(LoginLog.role == role)

        if device_type and device_type != "ALL":
            query = query.where(LoginLog.device_type == device_type)

        if os and os != "ALL":
            query = query.where(LoginLog.os.ilike(f"%{os}%"))

        if is_suspicious is not None and is_suspicious:
            query = query.where(LoginLog.is_suspicious.is_(True))

        # Total count for filtered query
        count_stmt = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_stmt)).scalar() or 0

        # Pagination & ordering
        query = query.order_by(LoginLog.timestamp.desc())
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.session.execute(query)
        logs = result.scalars().all()

        # Compute Overview Stats (for cards)
        all_logs_query = select(LoginLog)
        if time_range:
            now = utc_now()
            if time_range == "24h":
                all_logs_query = all_logs_query.where(LoginLog.timestamp >= now - timedelta(hours=24))
            elif time_range == "7d":
                all_logs_query = all_logs_query.where(LoginLog.timestamp >= now - timedelta(days=7))
            elif time_range == "30d":
                all_logs_query = all_logs_query.where(LoginLog.timestamp >= now - timedelta(days=30))

        all_logs_res = (await self.session.execute(all_logs_query)).scalars().all()
        total_logins = len(all_logs_res)
        successful_logins = sum(1 for l in all_logs_res if l.status == "SUCCESS")
        failed_logins = sum(1 for l in all_logs_res if l.status in ("FAILED", "BLOCKED"))

        # Currently blocked IPs count
        blocked_ip_count_stmt = select(func.count()).where(BlockedIP.status == "ACTIVE")
        currently_blocked = (await self.session.execute(blocked_ip_count_stmt)).scalar() or 0

        total_pages = max(1, (total + page_size - 1) // page_size)

        return LoginLogListResponse(
            items=[LoginLogResponse.model_validate(l) for l in logs],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            stats=LoginOverviewStats(
                totalLogins=total_logins,
                successfulLogins=successful_logins,
                failedLogins=failed_logins,
                currentlyBlockedIps=currently_blocked,
            ),
        )

    async def get_login_event_detail(self, event_id: str) -> LoginEventDetailResponse:
        await self._ensure_seeded()

        stmt = select(LoginLog).where(LoginLog.id == event_id)
        result = await self.session.execute(stmt)
        event = result.scalar_one_or_none()
        if not event:
            raise ValueError(f"Không tìm thấy sự kiện đăng nhập với ID: {event_id}")

        # Fetch related events (same email or same IP, excluding this event)
        rel_stmt = (
            select(LoginLog)
            .where(
                or_(LoginLog.email == event.email, LoginLog.ip_address == event.ip_address),
                LoginLog.id != event.id,
            )
            .order_by(LoginLog.timestamp.desc())
            .limit(5)
        )
        rel_result = await self.session.execute(rel_stmt)
        related = rel_result.scalars().all()

        # Check if IP is blocked
        blocked_stmt = select(BlockedIP).where(
            BlockedIP.ip_address == event.ip_address, BlockedIP.status == "ACTIVE"
        )
        blocked_record = (await self.session.execute(blocked_stmt)).scalar_one_or_none()

        blocked_dict = None
        if blocked_record:
            blocked_dict = {
                "id": blocked_record.id,
                "ipAddress": blocked_record.ip_address,
                "blockSource": blocked_record.block_source,
                "reason": blocked_record.reason,
                "blockedAt": blocked_record.blocked_at.isoformat(),
                "expiresAt": (
                    blocked_record.expires_at.isoformat() if blocked_record.expires_at else None
                ),
            }

        return LoginEventDetailResponse(
            event=LoginLogResponse.model_validate(event),
            relatedEvents=[LoginLogResponse.model_validate(r) for r in related],
            isIpBlocked=blocked_record is not None,
            blockedIpRecord=blocked_dict,
        )

    async def get_login_analytics(self, time_range: str = "7d") -> LoginAnalyticsResponse:
        await self._ensure_seeded()

        now = utc_now()
        days = 7
        if time_range == "24h":
            days = 1
        elif time_range == "30d":
            days = 30

        start_time = now - timedelta(days=days)
        prev_start_time = start_time - timedelta(days=days)

        # Current period query
        stmt = select(LoginLog).where(LoginLog.timestamp >= start_time).order_by(LoginLog.timestamp.asc())
        current_logs = (await self.session.execute(stmt)).scalars().all()

        # Previous period query
        prev_stmt = (
            select(LoginLog)
            .where(LoginLog.timestamp >= prev_start_time, LoginLog.timestamp < start_time)
        )
        prev_logs = (await self.session.execute(prev_stmt)).scalars().all()

        total = len(current_logs)
        success = sum(1 for l in current_logs if l.status == "SUCCESS")
        failed = sum(1 for l in current_logs if l.status == "FAILED")
        blocked = sum(1 for l in current_logs if l.status == "BLOCKED")
        success_rate = round((success / total * 100), 1) if total > 0 else 100.0

        prev_total = len(prev_logs)
        prev_success = sum(1 for l in prev_logs if l.status == "SUCCESS")
        prev_failed = sum(1 for l in prev_logs if l.status == "FAILED")
        prev_blocked = sum(1 for l in prev_logs if l.status == "BLOCKED")

        pct_change_total = round(((total - prev_total) / prev_total * 100), 1) if prev_total > 0 else 0.0
        pct_change_failed = (
            round(((failed - prev_failed) / prev_failed * 100), 1) if prev_failed > 0 else 0.0
        )

        # Timeline generation
        timeline: list[TimelineDataPoint] = []
        if time_range == "24h":
            # Hourly buckets
            for h in range(24):
                slot_start = start_time + timedelta(hours=h)
                slot_end = slot_start + timedelta(hours=1)
                slot_logs = [l for l in current_logs if slot_start <= to_utc(l.timestamp) < slot_end]
                s = sum(1 for l in slot_logs if l.status == "SUCCESS")
                f = sum(1 for l in slot_logs if l.status == "FAILED")
                b = sum(1 for l in slot_logs if l.status == "BLOCKED")
                timeline.append(
                    TimelineDataPoint(
                        timestamp=slot_start.isoformat(),
                        label=slot_start.strftime("%H:00"),
                        success=s,
                        failed=f,
                        blocked=b,
                        total=len(slot_logs),
                    )
                )
        else:
            # Daily buckets
            for d in range(days):
                slot_start = (start_time + timedelta(days=d)).replace(
                    hour=0, minute=0, second=0, microsecond=0
                )
                slot_end = slot_start + timedelta(days=1)
                slot_logs = [l for l in current_logs if slot_start <= to_utc(l.timestamp) < slot_end]
                s = sum(1 for l in slot_logs if l.status == "SUCCESS")
                f = sum(1 for l in slot_logs if l.status == "FAILED")
                b = sum(1 for l in slot_logs if l.status == "BLOCKED")
                timeline.append(
                    TimelineDataPoint(
                        timestamp=slot_start.isoformat(),
                        label=slot_start.strftime("%d/%m"),
                        success=s,
                        failed=f,
                        blocked=b,
                        total=len(slot_logs),
                    )
                )

        # Auth Method Distribution
        method_counts: dict[str, int] = {}
        for l in current_logs:
            method_counts[l.auth_method] = method_counts.get(l.auth_method, 0) + 1

        method_labels = {
            "PASSWORD": "Mật khẩu tiêu chuẩn",
            "PASSWORD_2FA": "Mật khẩu + 2FA TOTP",
            "GOOGLE_SSO": "Google SSO",
            "MAGIC_LINK": "Magic Link qua Email",
        }
        method_dist: list[DistributionItem] = []
        for m, c in method_counts.items():
            method_dist.append(
                DistributionItem(
                    key=m,
                    label=method_labels.get(m, m),
                    count=c,
                    percentage=round((c / total * 100), 1) if total > 0 else 0.0,
                )
            )

        # Status Distribution
        status_counts = {"SUCCESS": success, "FAILED": failed, "BLOCKED": blocked}
        status_labels = {
            "SUCCESS": "Đăng nhập thành công",
            "FAILED": "Đăng nhập thất bại",
            "BLOCKED": "Bị hệ thống WAF/Security chặn",
        }
        status_dist: list[DistributionItem] = [
            DistributionItem(
                key=k,
                label=status_labels[k],
                count=v,
                percentage=round((v / total * 100), 1) if total > 0 else 0.0,
            )
            for k, v in status_counts.items()
        ]

        # Suspicious sources calculation
        ip_failures: dict[str, list[LoginLog]] = {}
        for l in current_logs:
            if l.status in ("FAILED", "BLOCKED") or l.is_suspicious:
                ip_failures.setdefault(l.ip_address, []).append(l)

        # Get blocked ips set
        blocked_ips_set = set(
            (
                await self.session.execute(
                    select(BlockedIP.ip_address).where(BlockedIP.status == "ACTIVE")
                )
            )
            .scalars()
            .all()
        )

        suspicious_sources: list[SuspiciousSourceItem] = []
        for ip, logs in ip_failures.items():
            accounts = list({l.email for l in logs})
            last_log = max(logs, key=lambda x: to_utc(x.timestamp))
            reason = last_log.failure_reason or "Nhiều lần xác thực thất bại"
            suspicious_sources.append(
                SuspiciousSourceItem(
                    ipAddress=ip,
                    location=last_log.location,
                    failedAttempts=len(logs),
                    accountsTargeted=accounts,
                    lastSeen=last_log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    riskReason=reason,
                    isBlocked=ip in blocked_ips_set,
                )
            )

        suspicious_sources.sort(key=lambda x: x.failed_attempts, reverse=True)

        return LoginAnalyticsResponse(
            timeRange=time_range,
            totalAttempts=total,
            successCount=success,
            failedCount=failed,
            blockedCount=blocked,
            successRate=success_rate,
            previousPeriodComparison={
                "prevTotal": prev_total,
                "prevSuccess": prev_success,
                "prevFailed": prev_failed,
                "prevBlocked": prev_blocked,
                "pctChangeTotal": pct_change_total,
                "pctChangeFailed": pct_change_failed,
            },
            activityTimeline=timeline,
            authMethodDistribution=method_dist,
            statusDistribution=status_dist,
            suspiciousSources=suspicious_sources,
        )

    async def export_login_logs_csv(
        self,
        search: str | None = None,
        status: str | None = None,
        auth_method: str | None = None,
        role: str | None = None,
        ids: list[str] | None = None,
    ) -> str:
        await self._ensure_seeded()

        query = select(LoginLog)
        if ids:
            query = query.where(LoginLog.id.in_(ids))
        else:
            if search:
                pat = f"%{search.strip()}%"
                query = query.where(
                    or_(
                        LoginLog.email.ilike(pat),
                        LoginLog.user_name.ilike(pat),
                        LoginLog.ip_address.ilike(pat),
                    )
                )
            if status and status != "ALL":
                query = query.where(LoginLog.status == status)
            if auth_method and auth_method != "ALL":
                query = query.where(LoginLog.auth_method == auth_method)
            if role and role != "ALL":
                query = query.where(LoginLog.role == role)

        query = query.order_by(LoginLog.timestamp.desc())
        logs = (await self.session.execute(query)).scalars().all()

        output = io.StringIO()
        # UTF-8 BOM for Excel compatibility
        output.write("\ufeff")
        writer = csv.writer(output)
        writer.writerow(
            [
                "Mã Sự Kiện",
                "Thời Gian",
                "Email",
                "Tên Người Dùng",
                "Vai Trò",
                "Tổ Chức",
                "Địa Chỉ IP",
                "Vị Trí",
                "Thiết Bị",
                "Trình Duyệt",
                "Hệ Điều Hành",
                "Phương Thức",
                "Trạng Thái",
                "Lý Do Thất Bại",
            ]
        )

        for l in logs:
            writer.writerow(
                [
                    l.id,
                    l.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    l.email,
                    l.user_name,
                    l.role,
                    l.organization_name or "",
                    l.ip_address,
                    l.location,
                    l.device_type,
                    l.browser,
                    l.os,
                    l.auth_method,
                    l.status,
                    l.failure_reason or "",
                ]
            )

        return output.getvalue()

    # --- Blocked IP Operations ---
    async def list_blocked_ips(
        self,
        search: str | None = None,
        status: str | None = None,
        block_source: str | None = None,
    ) -> BlockedIPListResponse:
        await self._ensure_seeded()

        query = select(BlockedIP)

        if search:
            pat = f"%{search.strip()}%"
            query = query.where(
                or_(BlockedIP.ip_address.ilike(pat), BlockedIP.reason.ilike(pat))
            )

        if status and status != "ALL":
            query = query.where(BlockedIP.status == status)

        if block_source and block_source != "ALL":
            query = query.where(BlockedIP.block_source == block_source)

        query = query.order_by(BlockedIP.blocked_at.desc())
        items = (await self.session.execute(query)).scalars().all()

        # Stats
        all_items = (await self.session.execute(select(BlockedIP))).scalars().all()
        currently_blocked = sum(1 for b in all_items if b.status == "ACTIVE")
        auto_blocked = sum(1 for b in all_items if b.status == "ACTIVE" and b.block_source == "AUTOMATIC")
        manually_blocked = sum(1 for b in all_items if b.status == "ACTIVE" and b.block_source == "MANUAL")

        return BlockedIPListResponse(
            items=[BlockedIPResponse.model_validate(b) for b in items],
            total=len(items),
            stats=BlockedIPStats(
                currentlyBlocked=currently_blocked,
                autoBlocked=auto_blocked,
                manuallyBlocked=manually_blocked,
            ),
        )

    async def create_blocked_ip(
        self, data: BlockedIPCreate, operator_email: str = "admin@rentflow.vn"
    ) -> BlockedIPResponse:
        await self._ensure_seeded()

        # Check existing active block
        stmt = select(BlockedIP).where(BlockedIP.ip_address == data.ip_address)
        existing = (await self.session.execute(stmt)).scalar_one_or_none()

        now = utc_now()
        expires_at = (
            now + timedelta(hours=data.duration_hours) if data.duration_hours > 0 else None
        )

        if existing:
            existing.status = "ACTIVE"
            existing.reason = data.reason
            existing.blocked_at = now
            existing.expires_at = expires_at
            existing.block_source = "MANUAL"
            existing.created_by = operator_email
            existing.unblocked_at = None
            existing.unblocked_by = None
            existing.unblock_reason = None
            existing.notes = data.notes
            await self.session.commit()
            await self.session.refresh(existing)
            return BlockedIPResponse.model_validate(existing)

        new_block = BlockedIP(
            id=f"block-{uuid.uuid4().hex[:8]}",
            ip_address=data.ip_address,
            block_source="MANUAL",
            reason=data.reason,
            blocked_at=now,
            expires_at=expires_at,
            status="ACTIVE",
            created_by=operator_email,
            notes=data.notes,
        )
        self.session.add(new_block)
        await self.session.commit()
        await self.session.refresh(new_block)
        return BlockedIPResponse.model_validate(new_block)

    async def unblock_ip(
        self,
        block_id: str,
        data: BlockedIPUnblockRequest,
        operator_email: str = "admin@rentflow.vn",
    ) -> BlockedIPResponse:
        await self._ensure_seeded()

        stmt = select(BlockedIP).where(BlockedIP.id == block_id)
        record = (await self.session.execute(stmt)).scalar_one_or_none()
        if not record:
            raise ValueError(f"Không tìm thấy bản ghi chặn với ID: {block_id}")

        record.status = "UNBLOCKED"
        record.unblocked_at = utc_now()
        record.unblocked_by = operator_email
        record.unblock_reason = data.unblock_reason

        await self.session.commit()
        await self.session.refresh(record)
        return BlockedIPResponse.model_validate(record)

    # --- Security Alerts Operations ---
    async def list_security_alerts(
        self,
        search: str | None = None,
        severity: str | None = None,
        status: str | None = None,
        category: str | None = None,
    ) -> SecurityAlertListResponse:
        await self._ensure_seeded()

        query = select(SecurityAlert)

        if search:
            pat = f"%{search.strip()}%"
            query = query.where(
                or_(
                    SecurityAlert.id.ilike(pat),
                    SecurityAlert.title.ilike(pat),
                    SecurityAlert.description.ilike(pat),
                    SecurityAlert.ip_address.ilike(pat),
                    SecurityAlert.target_email.ilike(pat),
                )
            )

        if severity and severity != "ALL":
            query = query.where(SecurityAlert.severity == severity)

        if status and status != "ALL":
            query = query.where(SecurityAlert.status == status)

        if category and category != "ALL":
            query = query.where(SecurityAlert.category == category)

        query = query.order_by(SecurityAlert.timestamp.desc())
        items = (await self.session.execute(query)).scalars().all()

        # Stats
        all_alerts = (await self.session.execute(select(SecurityAlert))).scalars().all()
        new_alerts = sum(1 for a in all_alerts if a.status == "OPEN")
        investigating = sum(1 for a in all_alerts if a.status == "INVESTIGATING")
        unresolved_critical = sum(
            1 for a in all_alerts if a.severity in ("CRITICAL", "HIGH") and a.status in ("OPEN", "INVESTIGATING")
        )

        return SecurityAlertListResponse(
            items=[SecurityAlertResponse.model_validate(a) for a in items],
            total=len(items),
            stats=SecurityAlertStats(
                newAlerts=new_alerts,
                investigating=investigating,
                unresolvedCritical=unresolved_critical,
            ),
        )

    async def get_security_alert(self, alert_id: str) -> SecurityAlertResponse:
        await self._ensure_seeded()

        stmt = select(SecurityAlert).where(SecurityAlert.id == alert_id)
        alert = (await self.session.execute(stmt)).scalar_one_or_none()
        if not alert:
            raise ValueError(f"Không tìm thấy cảnh báo với ID: {alert_id}")
        return SecurityAlertResponse.model_validate(alert)

    async def update_security_alert(
        self,
        alert_id: str,
        data: SecurityAlertUpdateRequest,
        operator_email: str = "admin@rentflow.vn",
    ) -> SecurityAlertResponse:
        await self._ensure_seeded()

        stmt = select(SecurityAlert).where(SecurityAlert.id == alert_id)
        alert = (await self.session.execute(stmt)).scalar_one_or_none()
        if not alert:
            raise ValueError(f"Không tìm thấy cảnh báo với ID: {alert_id}")

        if data.status:
            alert.status = data.status
            if data.status == "RESOLVED":
                alert.resolved_at = utc_now()
                alert.resolved_by = operator_email

        if data.assigned_to is not None:
            alert.assigned_to = data.assigned_to

        if data.resolution_note:
            note_entry = f"[{utc_now().strftime('%Y-%m-%d %H:%M')}] {operator_email}: {data.resolution_note}"
            alert.investigation_notes = (
                f"{alert.investigation_notes}\n{note_entry}"
                if alert.investigation_notes
                else note_entry
            )

        await self.session.commit()
        await self.session.refresh(alert)
        return SecurityAlertResponse.model_validate(alert)

    async def add_security_alert_note(
        self, alert_id: str, note: str, operator_email: str = "admin@rentflow.vn"
    ) -> SecurityAlertResponse:
        await self._ensure_seeded()

        stmt = select(SecurityAlert).where(SecurityAlert.id == alert_id)
        alert = (await self.session.execute(stmt)).scalar_one_or_none()
        if not alert:
            raise ValueError(f"Không tìm thấy cảnh báo với ID: {alert_id}")

        note_entry = f"[{utc_now().strftime('%Y-%m-%d %H:%M')}] {operator_email}: {note}"
        alert.investigation_notes = (
            f"{alert.investigation_notes}\n{note_entry}"
            if alert.investigation_notes
            else note_entry
        )

        await self.session.commit()
        await self.session.refresh(alert)
        return SecurityAlertResponse.model_validate(alert)
