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
