export interface LoginLogItem {
  id: string;
  timestamp: string;
  email: string;
  userName: string;
  role: string;
  organizationName?: string | null;
  ipAddress: string;
  location: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'API_CLIENT';
  browser: string;
  os: string;
  userAgent?: string | null;
  authMethod: 'PASSWORD' | 'PASSWORD_2FA' | 'GOOGLE_SSO' | 'MAGIC_LINK';
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  failureReason?: string | null;
  isSuspicious: boolean;
}

export interface LoginOverviewStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  currentlyBlockedIps: number;
}

export interface LoginLogListResponse {
  items: LoginLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: LoginOverviewStats;
}

export interface TimelineDataPoint {
  timestamp: string;
  label: string;
  success: number;
  failed: number;
  blocked: number;
  total: number;
}

export interface DistributionItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface SuspiciousSourceItem {
  ipAddress: string;
  location: string;
  failedAttempts: number;
  accountsTargeted: string[];
  lastSeen: string;
  riskReason: string;
  isBlocked: boolean;
}

export interface LoginAnalyticsData {
  timeRange: string;
  totalAttempts: number;
  successCount: number;
  failedCount: number;
  blockedCount: number;
  successRate: number;
  previousPeriodComparison: {
    prevTotal: number;
    prevSuccess: number;
    prevFailed: number;
    prevBlocked: number;
    pctChangeTotal: number;
    pctChangeFailed: number;
  };
  activityTimeline: TimelineDataPoint[];
  authMethodDistribution: DistributionItem[];
  statusDistribution: DistributionItem[];
  suspiciousSources: SuspiciousSourceItem[];
}

export interface BlockedIPItem {
  id: string;
  ipAddress: string;
  blockSource: 'AUTOMATIC' | 'MANUAL';
  reason: string;
  blockedAt: string;
  expiresAt?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'UNBLOCKED';
  createdBy?: string | null;
  unblockedAt?: string | null;
  unblockedBy?: string | null;
  unblockReason?: string | null;
  notes?: string | null;
}

export interface BlockedIPStats {
  currentlyBlocked: number;
  autoBlocked: number;
  manuallyBlocked: number;
}

export interface BlockedIPListResponse {
  items: BlockedIPItem[];
  total: number;
  stats: BlockedIPStats;
}

export interface SecurityAlertItem {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'BRUTE_FORCE' | 'RATE_LIMIT' | 'UNUSUAL_GEO' | 'ACCOUNT_TAKEOVER' | 'API_ABUSE';
  title: string;
  description: string;
  targetEmail?: string | null;
  ipAddress: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  detectionRule?: string | null;
  relatedEventIds?: string | null;
  investigationNotes?: string | null;
  assignedTo?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}

export interface SecurityAlertStats {
  newAlerts: number;
  investigating: number;
  unresolvedCritical: number;
}

export interface SecurityAlertListResponse {
  items: SecurityAlertItem[];
  total: number;
  stats: SecurityAlertStats;
}

export interface LoginEventDetailData {
  event: LoginLogItem;
  relatedEvents: LoginLogItem[];
  isIpBlocked: boolean;
  blockedIpRecord?: {
    id: string;
    ipAddress: string;
    blockSource: string;
    reason: string;
    blockedAt: string;
    expiresAt?: string | null;
  } | null;
}

export interface AdvancedFilterState {
  fromDate: string;
  toDate: string;
  status: string;
  authMethod: string;
  role: string;
  deviceType: string;
  os: string;
  isSuspiciousOnly: boolean;
}
