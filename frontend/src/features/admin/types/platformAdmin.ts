// Platform Admin Types & Initial Seed Data

export interface PlatformAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'SUPERADMIN' | 'SUPPORT_AGENT' | 'BILLING_ADMIN' | 'LANDLORD' | 'TENANT';
  organizationId?: string;
  organizationName?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'LOCKED';
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface PlatformOrganization {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  planId: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  planName: string;
  subscriptionStatus: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELED';
  roomsCount: number;
  propertiesCount: number;
  maxRoomsQuota: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  nextBillingDate: string;
  mrrVnd: number;
  joinedAt: string;
  address: string;
}

export interface SubscriptionPlan {
  id: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  maxRooms: number;
  maxProperties: number;
  features: string[];
  isPopular?: boolean;
  activeSubscribersCount: number;
  isActive: boolean;
}

export interface PlatformSubscription {
  id: string;
  organizationId: string;
  organizationName: string;
  planId: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  planName: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  amountVnd: number;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELED';
  startDate: string;
  currentPeriodEnd: string;
  paymentMethod: 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  autoRenew: boolean;
}

export interface PlatformSupportTicket {
  id: string;
  ticketNumber: string;
  organizationId: string;
  organizationName: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  category: 'BILLING' | 'TECHNICAL' | 'FEATURE_REQUEST' | 'SECURITY' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
    senderName: string;
    content: string;
    timestamp: string;
    isInternalNote?: boolean;
  }[];
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'LANDLORDS' | 'TENANTS' | 'GROWTH_AND_ABOVE';
  priority: 'INFO' | 'WARNING' | 'MAINTENANCE' | 'CRITICAL';
  status: 'PUBLISHED' | 'SCHEDULED' | 'DRAFT' | 'ARCHIVED';
  publishedAt: string;
  expiresAt?: string;
  createdBy: string;
}

export interface PlatformAuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: 'ACCOUNT' | 'ORGANIZATION' | 'SUBSCRIPTION' | 'SECURITY' | 'SYSTEM' | 'SETTING';
  targetId: string;
  ipAddress: string;
  location: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

// B. Security & Access Logs (Distinct from Audit Logs)
export interface PlatformLoginLog {
  id: string;
  timestamp: string;
  email: string;
  userName: string;
  role: string;
  organizationName?: string;
  ipAddress: string;
  location: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'API_CLIENT';
  browser: string;
  os: string;
  authMethod: 'PASSWORD' | 'PASSWORD_2FA' | 'GOOGLE_SSO' | 'MAGIC_LINK';
  status: 'SUCCESS' | 'FAILED' | 'CHALLENGE_REQUIRED' | 'BLOCKED';
  failureReason?: string;
}

export interface PlatformActiveSession {
  id: string;
  accountId: string;
  email: string;
  userName: string;
  role: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  device: string;
  isCurrentSession: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

export interface PlatformSecurityEvent {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'BRUTE_FORCE' | 'ACCOUNT_TAKEOVER' | 'RATE_LIMIT' | 'UNUSUAL_GEO' | 'API_ABUSE';
  title: string;
  description: string;
  targetEmail?: string;
  ipAddress: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  resolvedAt?: string;
  resolvedBy?: string;
}

// C. Commercial Transactions (SaaS Subscription Payments)
export interface PlatformTransaction {
  id: string;
  code: string;
  organizationId: string;
  organizationName: string;
  planName: string;
  amountVnd: number;
  paymentMethod: 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  gatewayRef: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

// F. System Operations (System & API Error Logs, Integrations)
export interface PlatformSystemLog {
  id: string;
  timestamp: string;
  service: 'API_GATEWAY' | 'AUTH_SVC' | 'BILLING_ENGINE' | 'AI_OCR_SVC' | 'NOTIFICATION_SVC';
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  correlationId: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint?: string;
  httpStatus?: number;
  durationMs: number;
  message: string;
  stackTraceSnippet?: string;
}

export interface PlatformIntegration {
  id: string;
  name: string;
  provider: string;
  category: 'PAYMENT' | 'SMS_OTP' | 'ZALO_ZNS' | 'AI_SERVICE' | 'STORAGE' | 'EMAIL';
  status: 'OPERATIONAL' | 'DEGRADED' | 'DISRUPTED' | 'CONFIG_REQUIRED';
  endpoint: string;
  authMode: 'API_KEY' | 'OAUTH2' | 'HMAC_SHA256' | 'MUTUAL_TLS';
  lastPingAt: string;
  latencyMs: number;
  errorRate24h: string;
  description: string;
}

// Roles & Permissions matrix
export interface PlatformRolePermission {
  role: 'SUPERADMIN' | 'SUPPORT_AGENT' | 'BILLING_ADMIN' | 'LANDLORD' | 'TENANT';
  title: string;
  description: string;
  userCount: number;
  permissions: {
    module: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    restrictedActions: string[];
  }[];
}

// Background Jobs
export interface PlatformBackgroundJob {
  id: string;
  jobType: 'BILLING_CYCLE_INVOICE' | 'METER_READING_REMINDER' | 'DATA_CLEANUP_RETENTION' | 'AI_OCR_BATCH' | 'PAYMENT_RECONCILIATION';
  title: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  attempts: number;
  durationMs: number;
  lastError?: string;
  payloadSummary: string;
}

// Backup & Retention Status
export interface PlatformBackupRecord {
  id: string;
  backupType: 'DATABASE_FULL' | 'DATABASE_SNAPSHOT' | 'MEDIA_STORAGE' | 'AUDIT_VAULT';
  status: 'COMPLETED' | 'RUNNING' | 'VERIFIED' | 'FAILED';
  fileSizeMb: number;
  location: string;
  completedAt: string;
  retentionDays: number;
  checksum: string;
  isSimulatedDemo: boolean;
}

// Initial Mock Datasets
export const initialPlatformAccounts: PlatformAccount[] = [
  {
    id: 'acc-001',
    name: 'Nguyễn Quốc Anh (SuperAdmin)',
    email: 'admin@rentflow.vn',
    phone: '0901 000 888',
    role: 'SUPERADMIN',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    createdAt: '2024-01-01 08:00',
    lastLoginAt: '2026-10-12 17:35',
  },
  {
    id: 'acc-002',
    name: 'Trần Văn Bảo (Support Ops)',
    email: 'bao.tran@rentflow.vn',
    phone: '0902 111 222',
    role: 'SUPPORT_AGENT',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    createdAt: '2024-03-15 09:30',
    lastLoginAt: '2026-10-12 16:10',
  },
  {
    id: 'acc-003',
    name: 'Nguyễn An (Chủ nhà)',
    email: 'nguyenan@rentflow.vn',
    phone: '0988 123 456',
    role: 'LANDLORD',
    organizationId: 'org-001',
    organizationName: 'Nguyễn An Property',
    status: 'ACTIVE',
    twoFactorEnabled: false,
    createdAt: '2024-01-15 10:20',
    lastLoginAt: '2026-10-12 15:45',
  },
  {
    id: 'acc-004',
    name: 'Trần Phúc Thịnh (Chủ nhà)',
    email: 'phucthinh@gmail.com',
    phone: '0903 999 888',
    role: 'LANDLORD',
    organizationId: 'org-002',
    organizationName: 'Phúc Thịnh Home',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    createdAt: '2024-06-10 14:00',
    lastLoginAt: '2026-10-11 19:20',
  },
  {
    id: 'acc-005',
    name: 'Vũ Minh Tâm (Chủ nhà)',
    email: 'tam.minh@yahoo.com',
    phone: '0912 345 678',
    role: 'LANDLORD',
    organizationId: 'org-003',
    organizationName: 'Minh Tâm Co-living',
    status: 'ACTIVE',
    twoFactorEnabled: false,
    createdAt: '2024-08-01 11:15',
    lastLoginAt: '2026-10-10 09:12',
  },
  {
    id: 'acc-006',
    name: 'Hoàng Gia Long (Chủ nhà)',
    email: 'long.hoanggia@gmail.com',
    phone: '0933 777 999',
    role: 'LANDLORD',
    organizationId: 'org-004',
    organizationName: 'Hoàng Gia Luxury Apartment',
    status: 'SUSPENDED',
    twoFactorEnabled: false,
    createdAt: '2024-09-12 13:40',
    lastLoginAt: '2026-10-05 10:00',
  },
];

export const initialPlatformOrganizations: PlatformOrganization[] = [
  {
    id: 'org-001',
    name: 'Nguyễn An Property',
    ownerName: 'Nguyễn An',
    ownerEmail: 'nguyenan@rentflow.vn',
    ownerPhone: '0988 123 456',
    planId: 'GROWTH',
    planName: 'Growth PRO',
    subscriptionStatus: 'ACTIVE',
    roomsCount: 24,
    propertiesCount: 3,
    maxRoomsQuota: 50,
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    nextBillingDate: '2026-11-15',
    mrrVnd: 299000,
    joinedAt: '2024-01-15',
    address: '123 Đường D2, Bình Thạnh, TP.HCM',
  },
  {
    id: 'org-002',
    name: 'Phúc Thịnh Home',
    ownerName: 'Trần Phúc Thịnh',
    ownerEmail: 'phucthinh@gmail.com',
    ownerPhone: '0903 999 888',
    planId: 'ENTERPRISE',
    planName: 'Enterprise SaaS',
    subscriptionStatus: 'ACTIVE',
    roomsCount: 80,
    propertiesCount: 5,
    maxRoomsQuota: 200,
    status: 'ACTIVE',
    billingCycle: 'ANNUAL',
    nextBillingDate: '2027-06-10',
    mrrVnd: 599000,
    joinedAt: '2024-06-10',
    address: '45/8 Cầu Giấy, Cầu Giấy, Hà Nội',
  },
  {
    id: 'org-003',
    name: 'Minh Tâm Co-living',
    ownerName: 'Vũ Minh Tâm',
    ownerEmail: 'tam.minh@yahoo.com',
    ownerPhone: '0912 345 678',
    planId: 'STARTER',
    planName: 'Starter Free',
    subscriptionStatus: 'ACTIVE',
    roomsCount: 8,
    propertiesCount: 1,
    maxRoomsQuota: 10,
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    nextBillingDate: 'Vĩnh viễn',
    mrrVnd: 0,
    joinedAt: '2024-08-01',
    address: '78 Lê Lợi, Quận 1, TP.HCM',
  },
  {
    id: 'org-004',
    name: 'Hoàng Gia Luxury Apartment',
    ownerName: 'Hoàng Gia Long',
    ownerEmail: 'long.hoanggia@gmail.com',
    ownerPhone: '0933 777 999',
    planId: 'GROWTH',
    planName: 'Growth PRO',
    subscriptionStatus: 'SUSPENDED',
    roomsCount: 35,
    propertiesCount: 2,
    maxRoomsQuota: 50,
    status: 'SUSPENDED',
    billingCycle: 'MONTHLY',
    nextBillingDate: '2026-10-01 (Quá hạn 12 ngày)',
    mrrVnd: 299000,
    joinedAt: '2024-09-12',
    address: '22 Hoàng Hoa Thám, Ba Đình, Hà Nội',
  },
];

export const initialSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    tagline: 'Dành cho chủ nhà cá nhân quản lý nhà trọ gia đình quy mô nhỏ',
    monthlyPrice: 0,
    annualPrice: 0,
    maxRooms: 10,
    maxProperties: 1,
    features: [
      'Quản lý tối đa 10 phòng',
      'Ghi chỉ số điện & nước tự tính tiền',
      'Xuất hóa đơn PDF & chia sẻ Zalo thủ công',
      'Quản lý hợp đồng & tiền cọc cơ bản',
    ],
    activeSubscribersCount: 428,
    isActive: true,
  },
  {
    id: 'GROWTH',
    name: 'Growth PRO',
    tagline: 'Phổ biến nhất cho chủ nhà chuyên nghiệp có từ 1-3 tòa nhà',
    monthlyPrice: 299000,
    annualPrice: 2990000, // 2 tháng miễn phí khi trả năm
    maxRooms: 50,
    maxProperties: 5,
    features: [
      'Quản lý tối đa 50 phòng',
      'Đầy đủ tính năng ghi số, thu nợ, cọc & hoàn cọc',
      'Gửi thông báo Zalo ZNS & SMS tự động',
      'Cổng thông tin cư dân trực tuyến (Tenant Portal)',
      'OCR tự đọc chỉ số đồng hồ điện nước qua AI camera',
      'Thống kê doanh thu & báo cáo tỷ lệ lấp đầy chuyên sâu',
    ],
    isPopular: true,
    activeSubscribersCount: 890,
    isActive: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'Dành cho chuỗi căn hộ dịch vụ, chung cư mini quy mô lớn',
    monthlyPrice: 599000,
    annualPrice: 5990000,
    maxRooms: 200,
    maxProperties: 20,
    features: [
      'Quản lý lên tới 200 phòng (mở rộng theo yêu cầu)',
      'Tất cả tính năng của gói Growth PRO',
      'Tích hợp xuất hóa đơn điện tử VAT',
      'Phân quyền tài khoản đa quản lý / lễ tân',
      'Hỗ trợ kỹ thuật ưu tiên 24/7 & Dedicated CSM',
      'Tích hợp khóa cửa thông minh Tuya / TTlock API',
    ],
    activeSubscribersCount: 102,
    isActive: true,
  },
];

export const initialPlatformSubscriptions: PlatformSubscription[] = [
  {
    id: 'sub-001',
    organizationId: 'org-001',
    organizationName: 'Nguyễn An Property',
    planId: 'GROWTH',
    planName: 'Growth PRO',
    billingCycle: 'MONTHLY',
    amountVnd: 299000,
    status: 'ACTIVE',
    startDate: '2024-01-15',
    currentPeriodEnd: '2026-11-15',
    paymentMethod: 'VNPAY',
    autoRenew: true,
  },
  {
    id: 'sub-002',
    organizationId: 'org-002',
    organizationName: 'Phúc Thịnh Home',
    planId: 'ENTERPRISE',
    planName: 'Enterprise SaaS',
    billingCycle: 'ANNUAL',
    amountVnd: 5990000,
    status: 'ACTIVE',
    startDate: '2024-06-10',
    currentPeriodEnd: '2027-06-10',
    paymentMethod: 'BANK_TRANSFER',
    autoRenew: true,
  },
  {
    id: 'sub-003',
    organizationId: 'org-003',
    organizationName: 'Minh Tâm Co-living',
    planId: 'STARTER',
    planName: 'Starter Free',
    billingCycle: 'MONTHLY',
    amountVnd: 0,
    status: 'ACTIVE',
    startDate: '2024-08-01',
    currentPeriodEnd: '2099-12-31',
    paymentMethod: 'CREDIT_CARD',
    autoRenew: false,
  },
  {
    id: 'sub-004',
    organizationId: 'org-004',
    organizationName: 'Hoàng Gia Luxury Apartment',
    planId: 'GROWTH',
    planName: 'Growth PRO',
    billingCycle: 'MONTHLY',
    amountVnd: 299000,
    status: 'PAST_DUE',
    startDate: '2024-09-12',
    currentPeriodEnd: '2026-10-01',
    paymentMethod: 'VNPAY',
    autoRenew: true,
  },
];

export const initialPlatformSupportTickets: PlatformSupportTicket[] = [
  {
    id: 'ticket-001',
    ticketNumber: 'SUP-1042',
    organizationId: 'org-001',
    organizationName: 'Nguyễn An Property',
    requesterName: 'Nguyễn An',
    requesterEmail: 'nguyenan@rentflow.vn',
    subject: 'Hỏi cách kết nối máy in nhiệt Bluetooth để in hóa đơn tiền phòng',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    assignedTo: 'Trần Văn Bảo',
    createdAt: '2026-10-11 09:20',
    updatedAt: '2026-10-11 10:15',
    messages: [
      {
        id: 'msg-01',
        sender: 'CUSTOMER',
        senderName: 'Nguyễn An',
        content: 'Cho tôi hỏi cách kết nối máy in hóa đơn nhiệt Bluetooth để in phiếu thu trực tiếp từ điện thoại khi khách trả tiền mặt?',
        timestamp: '2026-10-11 09:20',
      },
      {
        id: 'msg-02',
        sender: 'AGENT',
        senderName: 'Trần Văn Bảo (RentFlow Support)',
        content: 'Dạ chào anh An, trên giao diện In hóa đơn, anh chọn khổ giấy 80mm hoặc 58mm và bấm nút In. Trình duyệt Safari/Chrome sẽ tự mở hộp thoại in và dò sóng Bluetooth đến máy in bill nhiệt đã ghép đôi ạ.',
        timestamp: '2026-10-11 10:15',
      },
    ],
  },
  {
    id: 'ticket-002',
    ticketNumber: 'SUP-1041',
    organizationId: 'org-002',
    organizationName: 'Phúc Thịnh Home',
    requesterName: 'Trần Phúc Thịnh',
    requesterEmail: 'phucthinh@gmail.com',
    subject: 'Cần nâng cấp thêm 50 phòng vượt trần gói Enterprise',
    category: 'BILLING',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: 'Trần Văn Bảo',
    createdAt: '2026-10-12 11:30',
    updatedAt: '2026-10-12 14:00',
    messages: [
      {
        id: 'msg-03',
        sender: 'CUSTOMER',
        senderName: 'Trần Phúc Thịnh',
        content: 'Bên mình chuẩn bị nhận bàn giao thêm 1 tòa 45 phòng ở Thanh Xuân, hiện gói Enterprise 80 phòng sắp chạm trần. Nhờ đội ngũ tư vấn gói mở rộng hạn mức.',
        timestamp: '2026-10-12 11:30',
      },
      {
        id: 'msg-04',
        sender: 'AGENT',
        senderName: 'Trần Văn Bảo (RentFlow Support)',
        content: 'Dạ em chào anh Thịnh, em đã nhận thông tin. Bộ phận kinh doanh sẽ liên hệ anh qua số 0903 999 888 để gửi báo giá Add-on pack +50 phòng (ưu đãi 150k/tháng) ngay trong chiều nay ạ.',
        timestamp: '2026-10-12 14:00',
      },
    ],
  },
  {
    id: 'ticket-003',
    ticketNumber: 'SUP-1043',
    organizationId: 'org-004',
    organizationName: 'Hoàng Gia Luxury Apartment',
    requesterName: 'Hoàng Gia Long',
    requesterEmail: 'long.hoanggia@gmail.com',
    subject: 'Giao dịch gia hạn qua VNPay bị trừ tiền nhưng gói chưa kích hoạt',
    category: 'BILLING',
    priority: 'URGENT',
    status: 'OPEN',
    createdAt: '2026-10-12 16:45',
    updatedAt: '2026-10-12 16:45',
    messages: [
      {
        id: 'msg-05',
        sender: 'CUSTOMER',
        senderName: 'Hoàng Gia Long',
        content: 'Tôi vừa thanh toán 299.000đ qua VNPay lúc 16h40, tài khoản ngân hàng đã trừ tiền mã giao dịch VNP-847291 nhưng hệ thống RentFlow vẫn báo tài khoản quá hạn.',
        timestamp: '2026-10-12 16:45',
      },
    ],
  },
];

export const initialPlatformAnnouncements: PlatformAnnouncement[] = [
  {
    id: 'anc-001',
    title: 'Bảo trì nâng cấp hạ tầng Cloud Database định kỳ',
    content: 'RentFlow sẽ bảo trì máy chủ cơ sở dữ liệu vào lúc 02:00 - 03:00 sáng Chủ Nhật ngày 18/10/2026. Trong thời gian này, các tính năng lập hóa đơn có thể gián đoạn khoảng 5 phút.',
    targetAudience: 'ALL',
    priority: 'MAINTENANCE',
    status: 'PUBLISHED',
    publishedAt: '2026-10-10 10:00',
    expiresAt: '2026-10-18 04:00',
    createdBy: 'admin@rentflow.vn',
  },
  {
    id: 'anc-002',
    title: 'Cập nhật tính năng: Quét mã QR thanh toán động VietQR tự đối soát',
    content: 'Tính năng mới đã chính thức khả dụng cho toàn bộ các chủ nhà từ gói Growth PRO trở lên. Cư dân quét mã QR ngân hàng sẽ được gạch nợ tự động trong 3 giây.',
    targetAudience: 'GROWTH_AND_ABOVE',
    priority: 'INFO',
    status: 'PUBLISHED',
    publishedAt: '2026-10-08 14:30',
    createdBy: 'admin@rentflow.vn',
  },
];

export const initialPlatformAuditLogs: PlatformAuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-12 17:35:12',
    actorEmail: 'admin@rentflow.vn',
    actorRole: 'SUPERADMIN',
    action: 'Đăng nhập Platform Console',
    targetType: 'SECURITY',
    targetId: 'Session-Auth',
    ipAddress: '118.69.182.10',
    location: 'Hà Nội, VN',
    status: 'SUCCESS',
    details: 'Đăng nhập thành công qua 2FA TOTP',
  },
  {
    id: 'log-002',
    timestamp: '2026-10-12 16:45:30',
    actorEmail: 'system-gateway@rentflow.vn',
    actorRole: 'SYSTEM',
    action: 'Webhook thanh toán VNPay',
    targetType: 'SUBSCRIPTION',
    targetId: 'sub-004',
    ipAddress: '103.1.238.10',
    location: 'TP.HCM, VN',
    status: 'WARNING',
    details: 'Mã lỗi IPN: Chữ ký checksum không khớp, chờ đối soát thủ công',
  },
  {
    id: 'log-003',
    timestamp: '2026-10-12 14:15:22',
    actorEmail: 'bao.tran@rentflow.vn',
    actorRole: 'SUPPORT_AGENT',
    action: 'Cập nhật trạng thái Ticket SUP-1041',
    targetType: 'SYSTEM',
    targetId: 'SUP-1041',
    ipAddress: '14.161.40.12',
    location: 'Hà Nội, VN',
    status: 'SUCCESS',
    details: 'Chuyển trạng thái sang IN_PROGRESS và phân công xử lý',
  },
  {
    id: 'log-004',
    timestamp: '2026-10-12 10:20:05',
    actorEmail: 'admin@rentflow.vn',
    actorRole: 'SUPERADMIN',
    action: 'Tạm ngưng tổ chức org-004',
    targetType: 'ORGANIZATION',
    targetId: 'org-004',
    ipAddress: '118.69.182.10',
    location: 'Hà Nội, VN',
    status: 'SUCCESS',
    details: 'Tạm ngưng do quá hạn hóa đơn SaaS 12 ngày không xử lý',
  },
  {
    id: 'log-005',
    timestamp: '2026-10-11 14:32:00',
    actorEmail: 'public-register@rentflow.vn',
    actorRole: 'SYSTEM',
    action: 'Đăng ký tài khoản chủ nhà mới',
    targetType: 'ACCOUNT',
    targetId: 'acc-006',
    ipAddress: '115.78.21.90',
    location: 'TP.HCM, VN',
    status: 'SUCCESS',
    details: 'Đăng ký tổ chức Hoàng Gia Luxury Apartment qua Landing page',
  },
];

export const initialPlatformLoginLogs: PlatformLoginLog[] = [
  {
    id: 'login-001',
    timestamp: '2026-10-12 17:35:10',
    email: 'admin@rentflow.vn',
    userName: 'Nguyễn Quốc Anh (SuperAdmin)',
    role: 'SUPERADMIN',
    ipAddress: '118.69.182.10',
    location: 'Hà Nội, Việt Nam',
    deviceType: 'DESKTOP',
    browser: 'Chrome 129.0',
    os: 'Windows 11',
    authMethod: 'PASSWORD_2FA',
    status: 'SUCCESS',
  },
  {
    id: 'login-002',
    timestamp: '2026-10-12 16:40:22',
    email: 'long.hoanggia@gmail.com',
    userName: 'Hoàng Gia Long',
    role: 'LANDLORD',
    organizationName: 'Hoàng Gia Luxury Apartment',
    ipAddress: '115.78.21.90',
    location: 'TP.HCM, Việt Nam',
    deviceType: 'MOBILE',
    browser: 'Safari Mobile 18.0',
    os: 'iOS 18.1',
    authMethod: 'PASSWORD',
    status: 'SUCCESS',
  },
  {
    id: 'login-003',
    timestamp: '2026-10-12 15:12:05',
    email: 'phucthinh@gmail.com',
    userName: 'Trần Phúc Thịnh',
    role: 'LANDLORD',
    organizationName: 'Phúc Thịnh Home',
    ipAddress: '14.238.10.45',
    location: 'Hà Nội, Việt Nam',
    deviceType: 'DESKTOP',
    browser: 'Firefox 130.0',
    os: 'macOS Sonoma',
    authMethod: 'GOOGLE_SSO',
    status: 'SUCCESS',
  },
  {
    id: 'login-004',
    timestamp: '2026-10-12 14:02:18',
    email: 'unknown-attacker@proton.me',
    userName: 'Không xác định',
    role: 'UNAUTHENTICATED',
    ipAddress: '45.154.255.82',
    location: 'Frankfurt, Đức (VPN / Tor Node)',
    deviceType: 'API_CLIENT',
    browser: 'Python-requests 2.31',
    os: 'Linux x86_64',
    authMethod: 'PASSWORD',
    status: 'FAILED',
    failureReason: 'Sai mật khẩu (Tài khoản mục tiêu: admin@rentflow.vn, brute-force detected)',
  },
  {
    id: 'login-005',
    timestamp: '2026-10-12 14:02:15',
    email: 'unknown-attacker@proton.me',
    userName: 'Không xác định',
    role: 'UNAUTHENTICATED',
    ipAddress: '45.154.255.82',
    location: 'Frankfurt, Đức (VPN / Tor Node)',
    deviceType: 'API_CLIENT',
    browser: 'Python-requests 2.31',
    os: 'Linux x86_64',
    authMethod: 'PASSWORD',
    status: 'BLOCKED',
    failureReason: 'WAF Rate Limit: Vượt quá 10 lần thử trong 60 giây',
  },
  {
    id: 'login-006',
    timestamp: '2026-10-12 11:22:40',
    email: 'tam.minh@yahoo.com',
    userName: 'Vũ Minh Tâm',
    role: 'LANDLORD',
    organizationName: 'Minh Tâm Co-living',
    ipAddress: '171.244.33.120',
    location: 'Đà Nẵng, Việt Nam',
    deviceType: 'DESKTOP',
    browser: 'Edge 129.0',
    os: 'Windows 10',
    authMethod: 'PASSWORD',
    status: 'SUCCESS',
  },
];

export const initialPlatformActiveSessions: PlatformActiveSession[] = [
  {
    id: 'sess-001',
    accountId: 'acc-001',
    email: 'admin@rentflow.vn',
    userName: 'Nguyễn Quốc Anh (SuperAdmin)',
    role: 'SUPERADMIN',
    ipAddress: '118.69.182.10',
    location: 'Hà Nội, Việt Nam',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0',
    device: 'Desktop • Chrome 129 on Windows 11',
    isCurrentSession: true,
    createdAt: '2026-10-12 17:35:10',
    lastActiveAt: 'Vừa xong',
    expiresAt: '2026-10-19 17:35:10',
  },
  {
    id: 'sess-002',
    accountId: 'acc-002',
    email: 'bao.tran@rentflow.vn',
    userName: 'Trần Văn Bảo (Support Ops)',
    role: 'SUPPORT_AGENT',
    ipAddress: '14.161.40.12',
    location: 'Hà Nội, Việt Nam',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/130.0',
    device: 'Desktop • Firefox on Windows 10',
    isCurrentSession: false,
    createdAt: '2026-10-12 08:30:00',
    lastActiveAt: '12 phút trước',
    expiresAt: '2026-10-19 08:30:00',
  },
  {
    id: 'sess-003',
    accountId: 'acc-003',
    email: 'nguyenan@rentflow.vn',
    userName: 'Nguyễn An (Chủ nhà)',
    role: 'LANDLORD',
    ipAddress: '118.69.182.10',
    location: 'Hà Nội, Việt Nam',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/18.0',
    device: 'Desktop • Safari on macOS',
    isCurrentSession: false,
    createdAt: '2026-10-12 15:45:00',
    lastActiveAt: '35 phút trước',
    expiresAt: '2026-10-19 15:45:00',
  },
  {
    id: 'sess-004',
    accountId: 'acc-004',
    email: 'phucthinh@gmail.com',
    userName: 'Trần Phúc Thịnh',
    role: 'LANDLORD',
    ipAddress: '14.238.10.45',
    location: 'Hà Nội, Việt Nam',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X)',
    device: 'Mobile • RentFlow iOS App',
    isCurrentSession: false,
    createdAt: '2026-10-12 15:12:05',
    lastActiveAt: '1 giờ trước',
    expiresAt: '2026-10-19 15:12:05',
  },
];

export const initialPlatformSecurityEvents: PlatformSecurityEvent[] = [
  {
    id: 'sec-001',
    timestamp: '2026-10-12 14:02:18',
    severity: 'HIGH',
    category: 'BRUTE_FORCE',
    title: 'Phát hiện chuỗi dò quét mật khẩu từ IP quốc tế',
    description: 'IP 45.154.255.82 đã thực hiện 12 lần đăng nhập thất bại liên tiếp vào tài khoản quản trị trong 45 giây. Hệ thống WAF đã tự động đưa địa chỉ IP vào danh sách chặn tạm thời 24h.',
    targetEmail: 'admin@rentflow.vn',
    ipAddress: '45.154.255.82',
    status: 'RESOLVED',
    resolvedAt: '2026-10-12 14:03:00',
    resolvedBy: 'Hệ thống tự động (Automated SecOps)',
  },
  {
    id: 'sec-002',
    timestamp: '2026-10-12 16:45:30',
    severity: 'MEDIUM',
    category: 'RATE_LIMIT',
    title: 'Cảnh báo chữ ký Webhook thanh toán không hợp lệ',
    description: 'Endpoint nhận callback IPN từ cổng thanh toán ghi nhận 3 request có checksum HMAC không trùng khớp. Giao dịch được chuyển sang trạng thái chờ đối soát thủ công.',
    ipAddress: '103.1.238.10',
    status: 'INVESTIGATING',
  },
  {
    id: 'sec-003',
    timestamp: '2026-10-11 09:15:00',
    severity: 'LOW',
    category: 'UNUSUAL_GEO',
    title: 'Đăng nhập từ vị trí mới chưa từng ghi nhận',
    description: 'Tài khoản tam.minh@yahoo.com đăng nhập lần đầu từ dải IP Đà Nẵng (171.244.33.120). Email xác thực thiết bị mới đã được gửi tới người dùng thành công.',
    targetEmail: 'tam.minh@yahoo.com',
    ipAddress: '171.244.33.120',
    status: 'RESOLVED',
    resolvedAt: '2026-10-11 09:20:00',
    resolvedBy: 'Người dùng xác nhận qua Email',
  },
];

export const initialPlatformTransactions: PlatformTransaction[] = [
  {
    id: 'tx-001',
    code: 'TXN-SaaS-20261012-01',
    organizationId: 'org-001',
    organizationName: 'Nguyễn An Property',
    planName: 'Growth PRO (1 Tháng)',
    amountVnd: 299000,
    paymentMethod: 'VNPAY',
    gatewayRef: 'VNP14892019',
    status: 'SUCCESS',
    createdAt: '2026-10-12 10:15:00',
    completedAt: '2026-10-12 10:15:32',
    notes: 'Tự động gia hạn thuê bao chu kỳ tháng 10/2026',
  },
  {
    id: 'tx-002',
    code: 'TXN-SaaS-20261010-02',
    organizationId: 'org-002',
    organizationName: 'Phúc Thịnh Home',
    planName: 'Enterprise SaaS (1 Năm)',
    amountVnd: 5990000,
    paymentMethod: 'BANK_TRANSFER',
    gatewayRef: 'MB-REF-89104',
    status: 'SUCCESS',
    createdAt: '2026-10-10 14:00:00',
    completedAt: '2026-10-10 14:05:00',
    notes: 'Gia hạn gói Enterprise thường niên, chiết khấu 2 tháng',
  },
  {
    id: 'tx-003',
    code: 'TXN-SaaS-20261012-03',
    organizationId: 'org-004',
    organizationName: 'Hoàng Gia Luxury Apartment',
    planName: 'Growth PRO (1 Tháng)',
    amountVnd: 299000,
    paymentMethod: 'VNPAY',
    gatewayRef: 'VNP-847291',
    status: 'PENDING',
    createdAt: '2026-10-12 16:40:00',
    notes: 'Tiền đã trừ phía ngân hàng, webhook IPN đang chờ đối soát khớp chữ ký',
  },
];

export const initialPlatformSystemLogs: PlatformSystemLog[] = [
  {
    id: 'syslog-001',
    timestamp: '2026-10-12 17:40:12',
    service: 'API_GATEWAY',
    level: 'INFO',
    correlationId: 'req-8891-23fa-91b0',
    httpMethod: 'GET',
    endpoint: '/api/v1/properties',
    httpStatus: 200,
    durationMs: 42,
    message: 'Tải danh sách bất động sản thành công cho org org-001',
  },
  {
    id: 'syslog-002',
    timestamp: '2026-10-12 16:45:30',
    service: 'BILLING_ENGINE',
    level: 'WARNING',
    correlationId: 'req-7712-45bb-12a1',
    httpMethod: 'POST',
    endpoint: '/api/v1/webhooks/vnpay/ipn',
    httpStatus: 400,
    durationMs: 88,
    message: 'IPN Signature Mismatch: Hash chuỗi tham số không khớp secret key của tenant',
    stackTraceSnippet: 'ValidationError: HMAC SHA512 hash verify failed at VNPayWebhookHandler.validateSignature (vnpay.py:112)',
  },
  {
    id: 'syslog-003',
    timestamp: '2026-10-12 15:30:10',
    service: 'AI_OCR_SVC',
    level: 'INFO',
    correlationId: 'req-6623-11aa-44bc',
    httpMethod: 'POST',
    endpoint: '/api/v1/ai/meter-read',
    httpStatus: 200,
    durationMs: 312,
    message: 'Nhận diện chỉ số đồng hồ điện thành công qua Camera AI (độ tin cậy 98.4%)',
  },
  {
    id: 'syslog-004',
    timestamp: '2026-10-12 14:02:15',
    service: 'AUTH_SVC',
    level: 'ERROR',
    correlationId: 'req-4412-99cc-77aa',
    httpMethod: 'POST',
    endpoint: '/api/v1/auth/login',
    httpStatus: 429,
    durationMs: 15,
    message: 'Rate limit exceeded: IP 45.154.255.82 vượt quá 10 request/phút',
  },
  {
    id: 'syslog-005',
    timestamp: '2026-10-12 12:00:00',
    service: 'NOTIFICATION_SVC',
    level: 'INFO',
    correlationId: 'cron-job-daily-billing-1200',
    durationMs: 1240,
    message: 'Đã hoàn thành kiểm tra và gửi thông báo nhắc nợ hóa đơn tự động cho 18 cư dân',
  },
];

export const initialPlatformIntegrations: PlatformIntegration[] = [
  {
    id: 'int-001',
    name: 'Cổng thanh toán VNPay QR Gateway',
    provider: 'VNPAY VN',
    category: 'PAYMENT',
    status: 'OPERATIONAL',
    endpoint: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    authMode: 'HMAC_SHA256',
    lastPingAt: '2 phút trước',
    latencyMs: 82,
    errorRate24h: '0.04%',
    description: 'Thanh toán trực tuyến quét mã VNPAY QR, thẻ nội địa Napas và quốc tế Visa/Mastercard.',
  },
  {
    id: 'int-002',
    name: 'VietQR - Mã QR chuyển khoản động Napas 247',
    provider: 'VietQR.io & NAPAS',
    category: 'PAYMENT',
    status: 'OPERATIONAL',
    endpoint: 'https://api.vietqr.io/v2/generate',
    authMode: 'API_KEY',
    lastPingAt: '1 phút trước',
    latencyMs: 45,
    errorRate24h: '0.00%',
    description: 'Sinh mã QR ngân hàng động kèm sẵn số tiền và nội dung hóa đơn để cư dân quét chuyển khoản tức thì.',
  },
  {
    id: 'int-003',
    name: 'Zalo ZNS Official Account API',
    provider: 'VNG / Zalo Cloud',
    category: 'ZALO_ZNS',
    status: 'OPERATIONAL',
    endpoint: 'https://business.openapi.zalo.me/message/template',
    authMode: 'OAUTH2',
    lastPingAt: '5 phút trước',
    latencyMs: 95,
    errorRate24h: '0.12%',
    description: 'Gửi tin nhắn mẫu thông báo tiền phòng, chỉ số điện nước và hóa đơn trực tiếp vào tài khoản Zalo cư dân.',
  },
  {
    id: 'int-004',
    name: 'RentFlow AI Vision OCR Service',
    provider: 'RentFlow Python AI Engine',
    category: 'AI_SERVICE',
    status: 'OPERATIONAL',
    endpoint: 'http://127.0.0.1:8001/ai/v1/meter-ocr',
    authMode: 'MUTUAL_TLS',
    lastPingAt: 'Vừa xong',
    latencyMs: 140,
    errorRate24h: '0.08%',
    description: 'Mô hình Computer Vision chuyên dụng đọc số công tơ điện cơ khí và điện tử từ ảnh chụp điện thoại.',
  },
  {
    id: 'int-005',
    name: 'Dịch vụ SMS Brandname CSKH',
    provider: 'eSMS Telecom VN',
    category: 'SMS_OTP',
    status: 'OPERATIONAL',
    endpoint: 'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json',
    authMode: 'API_KEY',
    lastPingAt: '10 phút trước',
    latencyMs: 160,
    errorRate24h: '0.21%',
    description: 'Gửi mã OTP xác thực đăng nhập 2FA và thông báo khẩn cấp khi người dùng không dùng Zalo.',
  },
];

export const initialPlatformRolePermissions: PlatformRolePermission[] = [
  {
    role: 'SUPERADMIN',
    title: 'SuperAdmin Nền tảng (Platform Operator)',
    description: 'Toàn quyền cấu hình hệ thống, quản lý tài khoản, xem audit logs, can thiệp thuê bao và hạ tầng.',
    userCount: 1,
    permissions: [
      { module: 'Tài khoản người dùng', view: true, create: true, edit: true, delete: true, restrictedActions: [] },
      { module: 'Tổ chức chủ nhà', view: true, create: true, edit: true, delete: true, restrictedActions: [] },
      { module: 'Gói dịch vụ & Doanh thu', view: true, create: true, edit: true, delete: true, restrictedActions: [] },
      { module: 'Audit Trail & Bảo mật', view: true, create: true, edit: true, delete: true, restrictedActions: [] },
      { module: 'Hạ tầng & Hệ thống', view: true, create: true, edit: true, delete: true, restrictedActions: [] },
    ],
  },
  {
    role: 'SUPPORT_AGENT',
    title: 'Hỗ trợ khách hàng (Support Ops)',
    description: 'Tiếp nhận và phản hồi Ticket, kiểm tra trạng thái tài khoản, không thể can thiệp cài đặt thanh toán hoặc xóa dữ liệu.',
    userCount: 2,
    permissions: [
      { module: 'Tài khoản người dùng', view: true, create: false, edit: false, delete: false, restrictedActions: ['Không thể reset pass', 'Không thể đổi quyền'] },
      { module: 'Tổ chức chủ nhà', view: true, create: false, edit: false, delete: false, restrictedActions: ['Chỉ xem thông tin liên hệ'] },
      { module: 'Ticket CSKH', view: true, create: true, edit: true, delete: false, restrictedActions: [] },
      { module: 'Audit Trail & Bảo mật', view: false, create: false, edit: false, delete: false, restrictedActions: ['Không được phép truy cập'] },
      { module: 'Hạ tầng & Hệ thống', view: true, create: false, edit: false, delete: false, restrictedActions: ['Chỉ xem trạng thái dịch vụ'] },
    ],
  },
  {
    role: 'BILLING_ADMIN',
    title: 'Quản trị viên Tài chính SaaS',
    description: 'Theo dõi doanh thu MRR, xác nhận đối soát thanh toán chuyển khoản, gia hạn thuê bao.',
    userCount: 1,
    permissions: [
      { module: 'Gói dịch vụ & Doanh thu', view: true, create: true, edit: true, delete: false, restrictedActions: [] },
      { module: 'Giao dịch đối soát', view: true, create: false, edit: true, delete: false, restrictedActions: [] },
      { module: 'Tổ chức chủ nhà', view: true, create: false, edit: true, delete: false, restrictedActions: ['Chỉ sửa gói dịch vụ'] },
      { module: 'Hạ tầng & Bảo mật', view: false, create: false, edit: false, delete: false, restrictedActions: ['Không được phép truy cập'] },
    ],
  },
  {
    role: 'LANDLORD',
    title: 'Chủ sở hữu bất động sản (Chủ nhà)',
    description: 'Quản lý toàn bộ tòa nhà, phòng trọ, cư dân, hợp đồng và thu tiền phòng trong tổ chức của riêng họ.',
    userCount: 1420,
    permissions: [
      { module: 'Bất động sản & Phòng', view: true, create: true, edit: true, delete: true, restrictedActions: ['Giới hạn trong quota gói SaaS'] },
      { module: 'Hợp đồng & Khách thuê', view: true, create: true, edit: true, delete: true, restrictedActions: [] },
      { module: 'Hóa đơn & Tiền phòng', view: true, create: true, edit: true, delete: true, restrictedActions: [] },
      { module: 'Cổng Admin Nền tảng', view: false, create: false, edit: false, delete: false, restrictedActions: ['Bị chặn truy cập (/platform/*)'] },
    ],
  },
  {
    role: 'TENANT',
    title: 'Cư dân / Khách thuê',
    description: 'Xem thông tin phòng thuê, chỉ số điện nước, nhận hóa đơn, thanh toán và gửi yêu cầu sửa chữa.',
    userCount: 3850,
    permissions: [
      { module: 'Cổng cư dân (Portal)', view: true, create: true, edit: false, delete: false, restrictedActions: ['Chỉ thấy phòng của chính mình'] },
      { module: 'Quản lý chủ nhà', view: false, create: false, edit: false, delete: false, restrictedActions: ['Bị chặn truy cập'] },
    ],
  },
];

export const initialPlatformBackgroundJobs: PlatformBackgroundJob[] = [
  {
    id: 'job-001',
    jobType: 'BILLING_CYCLE_INVOICE',
    title: 'Tự động tạo hóa đơn thuê bao chu kỳ ngày 15/10/2026',
    status: 'SUCCEEDED',
    createdAt: '2026-10-14 00:00:00',
    startedAt: '2026-10-14 00:00:02',
    completedAt: '2026-10-14 00:00:15',
    attempts: 1,
    durationMs: 13000,
    payloadSummary: 'Xử lý 42 tổ chức chủ nhà chu kỳ thanh toán giữa tháng',
  },
  {
    id: 'job-002',
    jobType: 'METER_READING_REMINDER',
    title: 'Gửi ZNS thông báo chốt điện nước định kỳ cho cư dân',
    status: 'RUNNING',
    createdAt: '2026-10-14 02:30:00',
    startedAt: '2026-10-14 02:30:05',
    attempts: 1,
    durationMs: 45000,
    payloadSummary: 'Gửi 128 tin nhắn Zalo ZNS tới các phòng trọ chưa chốt số',
  },
  {
    id: 'job-003',
    jobType: 'PAYMENT_RECONCILIATION',
    title: 'Đối soát giao dịch IPN cổng VNPay & VietQR 24h',
    status: 'SUCCEEDED',
    createdAt: '2026-10-13 23:00:00',
    startedAt: '2026-10-13 23:00:01',
    completedAt: '2026-10-13 23:00:08',
    attempts: 1,
    durationMs: 7200,
    payloadSummary: 'Đối soát 189 giao dịch thu tiền phòng và thuê bao SaaS',
  },
  {
    id: 'job-004',
    jobType: 'AI_OCR_BATCH',
    title: 'Xử lý nhận diện hàng loạt ảnh đồng hồ điện bị nghẽn',
    status: 'FAILED',
    createdAt: '2026-10-13 18:20:00',
    startedAt: '2026-10-13 18:20:02',
    completedAt: '2026-10-13 18:20:12',
    attempts: 3,
    durationMs: 10200,
    lastError: 'CUDA OutOfMemory: GPU VRAM vượt quá ngưỡng 95% khi xử lý batch 50 ảnh',
    payloadSummary: 'Batch nhận diện 50 ảnh chụp công tơ điện từ chủ nhà Phúc Thịnh',
  },
];

export const initialPlatformBackupRecords: PlatformBackupRecord[] = [
  {
    id: 'bk-20261014-01',
    backupType: 'DATABASE_FULL',
    status: 'VERIFIED',
    fileSizeMb: 1240,
    location: 'S3-ColdStorage / backups / postgres-rentflow-prod-20261014.dump.gz',
    completedAt: '2026-10-14 01:00:00',
    retentionDays: 30,
    checksum: 'sha256:8f43a912bb0e43d9943b1239aa81234981ef',
    isSimulatedDemo: true,
  },
  {
    id: 'bk-20261013-02',
    backupType: 'DATABASE_FULL',
    status: 'COMPLETED',
    fileSizeMb: 1215,
    location: 'S3-ColdStorage / backups / postgres-rentflow-prod-20261013.dump.gz',
    completedAt: '2026-10-13 01:00:00',
    retentionDays: 30,
    checksum: 'sha256:7b12c882aa9e11d8832a9910aa71139411bb',
    isSimulatedDemo: true,
  },
  {
    id: 'bk-20261012-03',
    backupType: 'MEDIA_STORAGE',
    status: 'COMPLETED',
    fileSizeMb: 8450,
    location: 'S3-ColdStorage / backups / media-contracts-photos-20261012.tar.gz',
    completedAt: '2026-10-12 03:00:00',
    retentionDays: 90,
    checksum: 'sha256:2f11a43299bc11d7742a0011bb51128411fa',
    isSimulatedDemo: true,
  },
];


