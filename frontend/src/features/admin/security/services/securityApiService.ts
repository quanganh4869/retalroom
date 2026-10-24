import { apiClient } from '@/services/api/client';
import {
  LoginLogListResponse,
  LoginEventDetailData,
  LoginAnalyticsData,
  BlockedIPListResponse,
  BlockedIPItem,
  SecurityAlertListResponse,
  SecurityAlertItem,
  AdvancedFilterState,
  LoginLogItem,
} from '../types';

// Fallback seed data in case backend is offline
const LOCAL_STORAGE_PREFIX = 'rentflow_sec_';

const initialFallbackLogs: LoginLogItem[] = [
  {
    id: 'login-001',
    timestamp: '2026-10-23 15:30:10',
    email: 'admin@rentflow.vn',
    userName: 'Nguyễn Quốc Anh (SuperAdmin)',
    role: 'SUPERADMIN',
    organizationName: 'RentFlow Core HQ',
    ipAddress: '118.69.182.10',
    location: 'Hà Nội, Việt Nam',
    deviceType: 'DESKTOP',
    browser: 'Chrome 129.0',
    os: 'Windows 11',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0',
    authMethod: 'PASSWORD_2FA',
    status: 'SUCCESS',
    isSuspicious: false,
  },
  {
    id: 'login-002',
    timestamp: '2026-10-23 14:40:22',
    email: 'long.hoanggia@gmail.com',
    userName: 'Hoàng Gia Long',
    role: 'LANDLORD',
    organizationName: 'Hoàng Gia Luxury Apartment',
    ipAddress: '115.78.21.90',
    location: 'TP.HCM, Việt Nam',
    deviceType: 'MOBILE',
    browser: 'Safari Mobile 18.0',
    os: 'iOS 18.1',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X)',
    authMethod: 'PASSWORD',
    status: 'SUCCESS',
    isSuspicious: false,
  },
  {
    id: 'login-003',
    timestamp: '2026-10-23 13:12:05',
    email: 'phucthinh@gmail.com',
    userName: 'Trần Phúc Thịnh',
    role: 'LANDLORD',
    organizationName: 'Phúc Thịnh Home',
    ipAddress: '14.238.10.45',
    location: 'Hà Nội, Việt Nam',
    deviceType: 'DESKTOP',
    browser: 'Firefox 130.0',
    os: 'macOS Sonoma',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:130.0)',
    authMethod: 'GOOGLE_SSO',
    status: 'SUCCESS',
    isSuspicious: false,
  },
  {
    id: 'login-004',
    timestamp: '2026-10-23 11:45:18',
    email: 'attacker-probe@proton.me',
    userName: 'Không xác định',
    role: 'UNAUTHENTICATED',
    organizationName: null,
    ipAddress: '45.154.255.82',
    location: 'Frankfurt, Đức (Tor Node / Proxy)',
    deviceType: 'API_CLIENT',
    browser: 'Python-requests 2.31',
    os: 'Linux x86_64',
    userAgent: 'python-requests/2.31.0',
    authMethod: 'PASSWORD',
    status: 'FAILED',
    failureReason: 'Sai mật khẩu liên tiếp (Brute-force detected)',
    isSuspicious: true,
  },
  {
    id: 'login-005',
    timestamp: '2026-10-23 11:45:15',
    email: 'attacker-probe@proton.me',
    userName: 'Không xác định',
    role: 'UNAUTHENTICATED',
    organizationName: null,
    ipAddress: '45.154.255.82',
    location: 'Frankfurt, Đức (Tor Node / Proxy)',
    deviceType: 'API_CLIENT',
    browser: 'Python-requests 2.31',
    os: 'Linux x86_64',
    userAgent: 'python-requests/2.31.0',
    authMethod: 'PASSWORD',
    status: 'BLOCKED',
    failureReason: 'WAF Rate Limit: Vượt ngưỡng 10 lần thử trong 60 giây',
    isSuspicious: true,
  },
  {
    id: 'login-006',
    timestamp: '2026-10-23 09:22:40',
    email: 'tam.minh@yahoo.com',
    userName: 'Vũ Minh Tâm',
    role: 'LANDLORD',
    organizationName: 'Minh Tâm Co-living',
    ipAddress: '171.244.33.120',
    location: 'Đà Nẵng, Việt Nam',
    deviceType: 'DESKTOP',
    browser: 'Edge 129.0',
    os: 'Windows 10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/129.0',
    authMethod: 'PASSWORD',
    status: 'SUCCESS',
    isSuspicious: false,
  },
  {
    id: 'login-007',
    timestamp: '2026-10-22 16:15:00',
    email: 'lan.nguyen@gmail.com',
    userName: 'Nguyễn Thị Lan',
    role: 'TENANT',
    organizationName: null,
    ipAddress: '27.72.105.15',
    location: 'Hà Nội, Việt Nam',
    deviceType: 'MOBILE',
    browser: 'Chrome Mobile 129.0',
    os: 'Android 14',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B)',
    authMethod: 'PASSWORD',
    status: 'SUCCESS',
    isSuspicious: false,
  },
  {
    id: 'login-008',
    timestamp: '2026-10-22 14:00:00',
    email: 'unknown@scan.net',
    userName: 'Không xác định',
    role: 'UNAUTHENTICATED',
    organizationName: null,
    ipAddress: '103.1.238.10',
    location: 'Singapore (Cloud VPS)',
    deviceType: 'API_CLIENT',
    browser: 'Go-http-client 1.1',
    os: 'Linux x86_64',
    userAgent: 'Go-http-client/1.1',
    authMethod: 'PASSWORD',
    status: 'BLOCKED',
    failureReason: 'Địa chỉ IP nằm trong danh sách đen Cloudflare/WAF',
    isSuspicious: true,
  },
  {
    id: 'login-009',
    timestamp: '2026-10-21 17:30:00',
    email: 'bao.tran@rentflow.vn',
    userName: 'Trần Văn Bảo (Support Ops)',
    role: 'SUPPORT_AGENT',
    organizationName: 'RentFlow Core HQ',
    ipAddress: '14.161.40.12',
    location: 'Hà Nội, Việt Nam',
    deviceType: 'DESKTOP',
    browser: 'Firefox 130.0',
    os: 'Windows 10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0)',
    authMethod: 'PASSWORD_2FA',
    status: 'SUCCESS',
    isSuspicious: false,
  },
  {
    id: 'login-010',
    timestamp: '2026-10-21 10:11:45',
    email: 'hieu.le@outlook.com',
    userName: 'Lê Trung Hiếu',
    role: 'LANDLORD',
    organizationName: 'Hiếu Phát Real Estate',
    ipAddress: '113.161.70.32',
    location: 'Hải Phòng, Việt Nam',
    deviceType: 'TABLET',
    browser: 'Safari 17.5',
    os: 'iPadOS 17.5',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X)',
    authMethod: 'GOOGLE_SSO',
    status: 'SUCCESS',
    isSuspicious: false,
  },
];

const initialFallbackBlockedIPs: BlockedIPItem[] = [
  {
    id: 'block-001',
    ipAddress: '45.154.255.82',
    blockSource: 'AUTOMATIC',
    reason: 'Dò quét brute-force mật khẩu quản trị (>10 lần/phút)',
    blockedAt: '2026-10-23 11:45:15',
    expiresAt: '2026-10-24 11:45:15',
    status: 'ACTIVE',
    createdBy: 'WAF Engine v2',
    notes: 'IP xuất xứ từ Frankfurt, Đức (Tor Exit Node)',
  },
  {
    id: 'block-002',
    ipAddress: '103.1.238.10',
    blockSource: 'MANUAL',
    reason: 'Spam webhook callback và giả mạo chữ ký HMAC',
    blockedAt: '2026-10-22 14:00:00',
    expiresAt: '2026-10-29 14:00:00',
    status: 'ACTIVE',
    createdBy: 'admin@rentflow.vn',
    notes: 'Đã kiểm tra dải mạng, không thuộc đối tác cổng thanh toán chính thức.',
  },
  {
    id: 'block-003',
    ipAddress: '194.26.29.112',
    blockSource: 'AUTOMATIC',
    reason: 'Quét lỗ hổng API Gateway',
    blockedAt: '2026-10-15 08:30:00',
    expiresAt: '2026-10-16 08:30:00',
    status: 'EXPIRED',
    createdBy: 'WAF Engine v2',
    notes: 'Đã tự động hết hạn 24h sau khi khóa.',
  },
];

const initialFallbackAlerts: SecurityAlertItem[] = [
  {
    id: 'sec-001',
    timestamp: '2026-10-23 11:45:18',
    severity: 'HIGH',
    category: 'BRUTE_FORCE',
    title: 'Phát hiện chuỗi dò quét mật khẩu từ IP quốc tế',
    description: 'IP 45.154.255.82 đã thực hiện 12 lần đăng nhập thất bại liên tiếp vào tài khoản quản trị trong 45 giây. Hệ thống WAF đã tự động đưa địa chỉ IP vào danh sách chặn tạm thời 24h.',
    targetEmail: 'admin@rentflow.vn',
    ipAddress: '45.154.255.82',
    status: 'RESOLVED',
    detectionRule: 'RULE_AUTH_BRUTEFORCE_THRESHOLD_10',
    relatedEventIds: 'login-004,login-005',
    investigationNotes: 'Hệ thống WAF đã kích hoạt tự động, xác nhận không có tài khoản nào bị xâm nhập.',
    assignedTo: 'admin@rentflow.vn',
    resolvedAt: '2026-10-23 12:00:00',
    resolvedBy: 'admin@rentflow.vn',
  },
  {
    id: 'sec-002',
    timestamp: '2026-10-23 08:00:00',
    severity: 'MEDIUM',
    category: 'RATE_LIMIT',
    title: 'Cảnh báo chữ ký Webhook thanh toán không hợp lệ',
    description: 'Endpoint nhận callback IPN từ cổng thanh toán ghi nhận 3 request có checksum HMAC không trùng khớp. Giao dịch được chuyển sang trạng thái chờ đối soát thủ công.',
    targetEmail: null,
    ipAddress: '103.1.238.10',
    status: 'INVESTIGATING',
    detectionRule: 'RULE_PAYMENT_HMAC_MISMATCH',
    relatedEventIds: 'login-008',
    investigationNotes: 'Đang liên hệ bên cổng thanh toán để đối soát log checksum.',
    assignedTo: 'Trần Văn Bảo (Support Ops)',
  },
  {
    id: 'sec-003',
    timestamp: '2026-10-22 09:22:40',
    severity: 'LOW',
    category: 'UNUSUAL_GEO',
    title: 'Đăng nhập từ vị trí mới chưa từng ghi nhận',
    description: 'Tài khoản tam.minh@yahoo.com đăng nhập lần đầu từ dải IP Đà Nẵng (171.244.33.120). Email xác thực thiết bị mới đã được gửi tới người dùng thành công.',
    targetEmail: 'tam.minh@yahoo.com',
    ipAddress: '171.244.33.120',
    status: 'RESOLVED',
    detectionRule: 'RULE_GEO_ANOMALY_FIRST_TIME',
    relatedEventIds: 'login-006',
    investigationNotes: 'Chủ tài khoản đã bấm link Xác nhận danh tính qua email lúc 11:25.',
    assignedTo: 'Hệ thống tự động',
    resolvedAt: '2026-10-22 10:30:00',
    resolvedBy: 'Người dùng qua Email',
  },
  {
    id: 'sec-004',
    timestamp: '2026-10-23 15:00:00',
    severity: 'CRITICAL',
    category: 'ACCOUNT_TAKEOVER',
    title: 'Cảnh báo nỗ lực thay đổi mật khẩu từ IP lạ không trùng phiên',
    description: 'Tài khoản owner@coliving.vn có yêu cầu đặt lại mật khẩu từ địa chỉ IP không trùng khớp với phiên đăng nhập đang hoạt động. Mã OTP đã gửi qua SMS.',
    targetEmail: 'owner@coliving.vn',
    ipAddress: '185.220.101.5',
    status: 'OPEN',
    detectionRule: 'RULE_ACCOUNT_TAKEOVER_SESSION_MISMATCH',
    relatedEventIds: null,
    investigationNotes: null,
    assignedTo: null,
  },
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(val));
  } catch {
    // Ignore storage quota
  }
}

export const securityApiService = {
  // 1. Fetch Login Logs
  async getLoginLogs(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    timeRange?: string;
    filters?: Partial<AdvancedFilterState>;
  }): Promise<LoginLogListResponse> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const search = params.search || '';
    const filters = params.filters || {};

    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('page_size', String(pageSize));
    if (search) q.set('search', search);
    if (params.timeRange) q.set('time_range', params.timeRange);
    if (filters.status && filters.status !== 'ALL') q.set('status', filters.status);
    if (filters.authMethod && filters.authMethod !== 'ALL') q.set('auth_method', filters.authMethod);
    if (filters.role && filters.role !== 'ALL') q.set('role', filters.role);
    if (filters.deviceType && filters.deviceType !== 'ALL') q.set('device_type', filters.deviceType);
    if (filters.os && filters.os !== 'ALL') q.set('os', filters.os);
    if (filters.isSuspiciousOnly) q.set('is_suspicious', 'true');
    if (filters.fromDate) q.set('from_date', filters.fromDate);
    if (filters.toDate) q.set('to_date', filters.toDate);

    try {
      const res = await apiClient<LoginLogListResponse>(`/api/v1/security/login-logs?${q.toString()}`);
      return res;
    } catch {
      // Local fallback logic
      const allLogs = getStored<LoginLogItem[]>('logs', initialFallbackLogs);
      const blockedIps = getStored<BlockedIPItem[]>('blocked', initialFallbackBlockedIPs);

      let filtered = allLogs.filter((log) => {
        const matchesSearch =
          !search ||
          log.email.toLowerCase().includes(search.toLowerCase()) ||
          log.userName.toLowerCase().includes(search.toLowerCase()) ||
          log.ipAddress.includes(search) ||
          log.id.toLowerCase().includes(search.toLowerCase()) ||
          (log.failureReason && log.failureReason.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus = !filters.status || filters.status === 'ALL' || log.status === filters.status;
        const matchesMethod = !filters.authMethod || filters.authMethod === 'ALL' || log.authMethod === filters.authMethod;
        const matchesRole = !filters.role || filters.role === 'ALL' || log.role === filters.role;
        const matchesDevice = !filters.deviceType || filters.deviceType === 'ALL' || log.deviceType === filters.deviceType;
        const matchesSuspicious = !filters.isSuspiciousOnly || log.isSuspicious;

        return matchesSearch && matchesStatus && matchesMethod && matchesRole && matchesDevice && matchesSuspicious;
      });

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const startIndex = (page - 1) * pageSize;
      const items = filtered.slice(startIndex, startIndex + pageSize);

      const currentlyBlocked = blockedIps.filter((b) => b.status === 'ACTIVE').length;
      const successCount = allLogs.filter((l) => l.status === 'SUCCESS').length;
      const failCount = allLogs.filter((l) => l.status !== 'SUCCESS').length;

      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
        stats: {
          totalLogins: allLogs.length,
          successfulLogins: successCount,
          failedLogins: failCount,
          currentlyBlockedIps: currentlyBlocked,
        },
      };
    }
  },

  // 2. Fetch single event detail
  async getLoginEventDetail(eventId: string): Promise<LoginEventDetailData> {
    try {
      const res = await apiClient<LoginEventDetailData>(`/api/v1/security/login-logs/${eventId}`);
      return res;
    } catch {
      const allLogs = getStored<LoginLogItem[]>('logs', initialFallbackLogs);
      const found = allLogs.find((l) => l.id === eventId);
      if (!found) {
        throw new Error(`Không tìm thấy sự kiện đăng nhập ID: ${eventId}`);
      }
      const related = allLogs.filter((l) => (l.email === found.email || l.ipAddress === found.ipAddress) && l.id !== found.id).slice(0, 5);
      const blockedIps = getStored<BlockedIPItem[]>('blocked', initialFallbackBlockedIPs);
      const blockedRec = blockedIps.find((b) => b.ipAddress === found.ipAddress && b.status === 'ACTIVE');

      return {
        event: found,
        relatedEvents: related,
        isIpBlocked: Boolean(blockedRec),
        blockedIpRecord: blockedRec
          ? {
              id: blockedRec.id,
              ipAddress: blockedRec.ipAddress,
              blockSource: blockedRec.blockSource,
              reason: blockedRec.reason,
              blockedAt: blockedRec.blockedAt,
              expiresAt: blockedRec.expiresAt,
            }
          : null,
      };
    }
  },

  // 3. Export CSV
  async exportLoginLogsCsv(params: { search?: string; status?: string; authMethod?: string; ids?: string[] }): Promise<void> {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.status && params.status !== 'ALL') q.set('status', params.status);
    if (params.authMethod && params.authMethod !== 'ALL') q.set('auth_method', params.authMethod);
    if (params.ids && params.ids.length > 0) q.set('ids', params.ids.join(','));

    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${BASE_URL}/api/v1/security/login-logs/export-csv?${q.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rentflow_login_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Local fallback CSV export
      const allLogs = getStored<LoginLogItem[]>('logs', initialFallbackLogs);
      const targetLogs = params.ids && params.ids.length > 0
        ? allLogs.filter((l) => params.ids!.includes(l.id))
        : allLogs;

      const headers = ['Mã Sự Kiện,Thời Gian,Email,Tên Người Dùng,Vai Trò,Tổ Chức,Địa Chỉ IP,Vị Trí,Thiết Bị,Phương Thức,Trạng Thái,Lý Do'];
      const rows = targetLogs.map((l) =>
        `"${l.id}","${l.timestamp}","${l.email}","${l.userName}","${l.role}","${l.organizationName || ''}","${l.ipAddress}","${l.location}","${l.deviceType} • ${l.browser}","${l.authMethod}","${l.status}","${l.failureReason || ''}"`
      );
      const csvText = '\uFEFF' + [headers, ...rows].join('\n');
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rentflow_login_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  },

  // 4. Fetch Analytics
  async getLoginAnalytics(timeRange = '7d'): Promise<LoginAnalyticsData> {
    try {
      const res = await apiClient<LoginAnalyticsData>(`/api/v1/security/login-logs/analytics?time_range=${timeRange}`);
      return res;
    } catch {
      // Offline fallback calculation
      const days = timeRange === '24h' ? 1 : timeRange === '30d' ? 30 : 7;
      const timeline = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        const s = Math.floor(180 + Math.random() * 40);
        const f = Math.floor(2 + Math.random() * 5);
        const b = Math.floor(Math.random() * 2);
        timeline.push({
          timestamp: d.toISOString(),
          label,
          success: s,
          failed: f,
          blocked: b,
          total: s + f + b,
        });
      }

      return {
        timeRange,
        totalAttempts: 1842,
        successCount: 1816,
        failedCount: 24,
        blockedCount: 2,
        successRate: 98.6,
        previousPeriodComparison: {
          prevTotal: 1720,
          prevSuccess: 1690,
          prevFailed: 28,
          prevBlocked: 2,
          pctChangeTotal: 7.1,
          pctChangeFailed: -14.3,
        },
        activityTimeline: timeline,
        authMethodDistribution: [
          { key: 'PASSWORD', label: 'Mật khẩu tiêu chuẩn', count: 1220, percentage: 66.2 },
          { key: 'PASSWORD_2FA', label: 'Mật khẩu + 2FA TOTP', count: 418, percentage: 22.7 },
          { key: 'GOOGLE_SSO', label: 'Google SSO', count: 184, percentage: 10.0 },
          { key: 'MAGIC_LINK', label: 'Magic Link qua Email', count: 20, percentage: 1.1 },
        ],
        statusDistribution: [
          { key: 'SUCCESS', label: 'Đăng nhập thành công', count: 1816, percentage: 98.6 },
          { key: 'FAILED', label: 'Đăng nhập thất bại', count: 24, percentage: 1.3 },
          { key: 'BLOCKED', label: 'Bị WAF / Hệ thống chặn', count: 2, percentage: 0.1 },
        ],
        suspiciousSources: [
          {
            ipAddress: '45.154.255.82',
            location: 'Frankfurt, Đức (Tor Node / Proxy)',
            failedAttempts: 12,
            accountsTargeted: ['admin@rentflow.vn', 'unknown-attacker@proton.me'],
            lastSeen: '2026-10-23 11:45:18',
            riskReason: 'Dò quét brute-force mật khẩu quản trị',
            isBlocked: true,
          },
          {
            ipAddress: '103.1.238.10',
            location: 'Singapore (Cloud VPS)',
            failedAttempts: 4,
            accountsTargeted: ['unknown@scan.net'],
            lastSeen: '2026-10-22 14:00:00',
            riskReason: 'Nằm trong danh sách đen Cloudflare/WAF',
            isBlocked: true,
          },
          {
            ipAddress: '198.20.70.1',
            location: 'Texas, Mỹ',
            failedAttempts: 3,
            accountsTargeted: ['scanner-bot@shodan.io'],
            lastSeen: '2026-10-20 18:22:10',
            riskReason: 'Shodan / Zgrab port scanner dò endpoint',
            isBlocked: false,
          },
        ],
      };
    }
  },

  // 5. Blocked IPs APIs
  async getBlockedIPs(params?: { search?: string; status?: string; blockSource?: string }): Promise<BlockedIPListResponse> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    if (params?.blockSource && params.blockSource !== 'ALL') q.set('block_source', params.blockSource);

    try {
      return await apiClient<BlockedIPListResponse>(`/api/v1/security/blocked-ips?${q.toString()}`);
    } catch {
      const all = getStored<BlockedIPItem[]>('blocked', initialFallbackBlockedIPs);
      let items = all;
      if (params?.search) {
        const s = params.search.toLowerCase();
        items = items.filter((b) => b.ipAddress.includes(s) || b.reason.toLowerCase().includes(s));
      }
      if (params?.status && params.status !== 'ALL') {
        items = items.filter((b) => b.status === params.status);
      }
      if (params?.blockSource && params.blockSource !== 'ALL') {
        items = items.filter((b) => b.blockSource === params.blockSource);
      }
      const currentlyBlocked = all.filter((b) => b.status === 'ACTIVE').length;
      const autoBlocked = all.filter((b) => b.status === 'ACTIVE' && b.blockSource === 'AUTOMATIC').length;
      const manuallyBlocked = all.filter((b) => b.status === 'ACTIVE' && b.blockSource === 'MANUAL').length;

      return {
        items,
        total: items.length,
        stats: {
          currentlyBlocked,
          autoBlocked,
          manuallyBlocked,
        },
      };
    }
  },

  async createBlockedIP(data: { ipAddress: string; reason: string; durationHours: number; notes?: string }): Promise<BlockedIPItem> {
    try {
      return await apiClient<BlockedIPItem>('/api/v1/security/blocked-ips', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const all = getStored<BlockedIPItem[]>('blocked', initialFallbackBlockedIPs);
      const existing = all.find((b) => b.ipAddress === data.ipAddress);
      const now = new Date();
      const exp = data.durationHours > 0 ? new Date(now.getTime() + data.durationHours * 3600000).toISOString() : null;

      if (existing) {
        existing.status = 'ACTIVE';
        existing.reason = data.reason;
        existing.expiresAt = exp;
        existing.blockSource = 'MANUAL';
        existing.notes = data.notes;
        setStored('blocked', all);
        return existing;
      }

      const newItem: BlockedIPItem = {
        id: `block-${Date.now().toString(36)}`,
        ipAddress: data.ipAddress,
        blockSource: 'MANUAL',
        reason: data.reason,
        blockedAt: now.toISOString(),
        expiresAt: exp,
        status: 'ACTIVE',
        createdBy: 'admin@rentflow.vn',
        notes: data.notes,
      };
      all.unshift(newItem);
      setStored('blocked', all);
      return newItem;
    }
  },

  async unblockIP(blockId: string, unblockReason: string): Promise<BlockedIPItem> {
    try {
      return await apiClient<BlockedIPItem>(`/api/v1/security/blocked-ips/${blockId}/unblock`, {
        method: 'POST',
        body: JSON.stringify({ unblockReason }),
      });
    } catch {
      const all = getStored<BlockedIPItem[]>('blocked', initialFallbackBlockedIPs);
      const item = all.find((b) => b.id === blockId);
      if (!item) throw new Error('Không tìm thấy bản ghi chặn');
      item.status = 'UNBLOCKED';
      item.unblockedAt = new Date().toISOString();
      item.unblockedBy = 'admin@rentflow.vn';
      item.unblockReason = unblockReason;
      setStored('blocked', all);
      return item;
    }
  },

  // 6. Security Alerts APIs
  async getSecurityAlerts(params?: { search?: string; severity?: string; status?: string; category?: string }): Promise<SecurityAlertListResponse> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.severity && params.severity !== 'ALL') q.set('severity', params.severity);
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    if (params?.category && params.category !== 'ALL') q.set('category', params.category);

    try {
      return await apiClient<SecurityAlertListResponse>(`/api/v1/security/alerts?${q.toString()}`);
    } catch {
      const all = getStored<SecurityAlertItem[]>('alerts', initialFallbackAlerts);
      let items = all;
      if (params?.search) {
        const s = params.search.toLowerCase();
        items = items.filter((a) => a.id.toLowerCase().includes(s) || a.title.toLowerCase().includes(s) || a.ipAddress.includes(s) || (a.targetEmail && a.targetEmail.toLowerCase().includes(s)));
      }
      if (params?.severity && params.severity !== 'ALL') {
        items = items.filter((a) => a.severity === params.severity);
      }
      if (params?.status && params.status !== 'ALL') {
        items = items.filter((a) => a.status === params.status);
      }
      if (params?.category && params.category !== 'ALL') {
        items = items.filter((a) => a.category === params.category);
      }

      const newAlerts = all.filter((a) => a.status === 'OPEN').length;
      const investigating = all.filter((a) => a.status === 'INVESTIGATING').length;
      const unresolvedCritical = all.filter((a) => (a.severity === 'CRITICAL' || a.severity === 'HIGH') && (a.status === 'OPEN' || a.status === 'INVESTIGATING')).length;

      return {
        items,
        total: items.length,
        stats: {
          newAlerts,
          investigating,
          unresolvedCritical,
        },
      };
    }
  },

  async updateSecurityAlert(alertId: string, data: { status?: string; assignedTo?: string; resolutionNote?: string }): Promise<SecurityAlertItem> {
    try {
      return await apiClient<SecurityAlertItem>(`/api/v1/security/alerts/${alertId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch {
      const all = getStored<SecurityAlertItem[]>('alerts', initialFallbackAlerts);
      const item = all.find((a) => a.id === alertId);
      if (!item) throw new Error('Không tìm thấy sự cố');
      if (data.status) {
        item.status = data.status as SecurityAlertItem['status'];
        if (data.status === 'RESOLVED') {
          item.resolvedAt = new Date().toISOString();
          item.resolvedBy = 'admin@rentflow.vn';
        }
      }
      if (data.assignedTo !== undefined) item.assignedTo = data.assignedTo;
      if (data.resolutionNote) {
        const note = `[${new Date().toISOString().slice(0, 16)}] admin@rentflow.vn: ${data.resolutionNote}`;
        item.investigationNotes = item.investigationNotes ? `${item.investigationNotes}\n${note}` : note;
      }
      setStored('alerts', all);
      return item;
    }
  },

  async addAlertNote(alertId: string, note: string): Promise<SecurityAlertItem> {
    try {
      return await apiClient<SecurityAlertItem>(`/api/v1/security/alerts/${alertId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
    } catch {
      const all = getStored<SecurityAlertItem[]>('alerts', initialFallbackAlerts);
      const item = all.find((a) => a.id === alertId);
      if (!item) throw new Error('Không tìm thấy sự cố');
      const noteEntry = `[${new Date().toISOString().slice(0, 16)}] admin@rentflow.vn: ${note}`;
      item.investigationNotes = item.investigationNotes ? `${item.investigationNotes}\n${noteEntry}` : noteEntry;
      setStored('alerts', all);
      return item;
    }
  },
};
