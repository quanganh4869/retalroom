import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PlatformAccount,
  PlatformOrganization,
  SubscriptionPlan,
  PlatformSubscription,
  PlatformSupportTicket,
  PlatformAnnouncement,
  PlatformAuditLog,
  PlatformLoginLog,
  PlatformActiveSession,
  PlatformSecurityEvent,
  PlatformTransaction,
  PlatformSystemLog,
  PlatformIntegration,
  PlatformRolePermission,
  PlatformBackgroundJob,
  PlatformBackupRecord,
  initialPlatformAccounts,
  initialPlatformOrganizations,
  initialSubscriptionPlans,
  initialPlatformSubscriptions,
  initialPlatformSupportTickets,
  initialPlatformAnnouncements,
  initialPlatformAuditLogs,
  initialPlatformLoginLogs,
  initialPlatformActiveSessions,
  initialPlatformSecurityEvents,
  initialPlatformTransactions,
  initialPlatformSystemLogs,
  initialPlatformIntegrations,
  initialPlatformRolePermissions,
  initialPlatformBackgroundJobs,
  initialPlatformBackupRecords,
} from './types/platformAdmin';

interface PlatformAdminContextType {
  accounts: PlatformAccount[];
  organizations: PlatformOrganization[];
  plans: SubscriptionPlan[];
  subscriptions: PlatformSubscription[];
  tickets: PlatformSupportTicket[];
  announcements: PlatformAnnouncement[];
  auditLogs: PlatformAuditLog[];
  loginLogs: PlatformLoginLog[];
  activeSessions: PlatformActiveSession[];
  securityEvents: PlatformSecurityEvent[];
  transactions: PlatformTransaction[];
  systemLogs: PlatformSystemLog[];
  integrations: PlatformIntegration[];
  rolePermissions: PlatformRolePermission[];
  backgroundJobs: PlatformBackgroundJob[];
  backupRecords: PlatformBackupRecord[];
  // Actions
  createAccount: (data: Omit<PlatformAccount, 'id' | 'createdAt' | 'lastLoginAt'>) => void;
  updateAccount: (accountId: string, data: Partial<PlatformAccount>) => void;
  toggleAccountStatus: (accountId: string, reason?: string) => void;
  updateAccountRole: (accountId: string, role: PlatformAccount['role']) => void;
  toggleOrganizationStatus: (orgId: string, reason?: string) => void;
  updateOrganizationPlan: (orgId: string, planId: SubscriptionPlan['id']) => void;
  updatePlan: (planId: SubscriptionPlan['id'], data: Partial<SubscriptionPlan>) => void;
  updateTicketStatus: (ticketId: string, status: PlatformSupportTicket['status']) => void;
  replyToTicket: (ticketId: string, content: string, isInternal?: boolean, senderName?: string) => void;
  createAnnouncement: (announcement: Omit<PlatformAnnouncement, 'id' | 'publishedAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  refreshAuditLogs: () => void;
  revokeSession: (sessionId: string, reason?: string) => void;
  resolveSecurityEvent: (eventId: string, resolutionNote?: string) => void;
  testIntegrationPing: (integrationId: string) => void;
  retryBackgroundJob: (jobId: string) => void;
  resetDemoData: () => void;
  // Computed SaaS Metrics
  metrics: {
    totalAccounts: number;
    activeLandlords: number;
    totalManagedRooms: number;
    totalOrganizations: number;
    mrrVnd: number;
    activeSubscriptionsCount: number;
    pendingTicketsCount: number;
    systemUptime: string;
    securityThreatsCount: number;
    activeSessionsCount: number;
  };
}

const PlatformAdminContext = createContext<PlatformAdminContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'rentflow_platform_admin_';

export const PlatformAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<PlatformAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}accounts`);
    return saved ? JSON.parse(saved) : initialPlatformAccounts;
  });

  const [organizations, setOrganizations] = useState<PlatformOrganization[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}organizations`);
    return saved ? JSON.parse(saved) : initialPlatformOrganizations;
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}plans`);
    return saved ? JSON.parse(saved) : initialSubscriptionPlans;
  });

  const [subscriptions] = useState<PlatformSubscription[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}subscriptions`);
    return saved ? JSON.parse(saved) : initialPlatformSubscriptions;
  });

  const [tickets, setTickets] = useState<PlatformSupportTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tickets`);
    return saved ? JSON.parse(saved) : initialPlatformSupportTickets;
  });

  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}announcements`);
    return saved ? JSON.parse(saved) : initialPlatformAnnouncements;
  });

  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}auditLogs`);
    return saved ? JSON.parse(saved) : initialPlatformAuditLogs;
  });

  const [loginLogs] = useState<PlatformLoginLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}loginLogs`);
    return saved ? JSON.parse(saved) : initialPlatformLoginLogs;
  });

  const [activeSessions, setActiveSessions] = useState<PlatformActiveSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activeSessions`);
    return saved ? JSON.parse(saved) : initialPlatformActiveSessions;
  });

  const [securityEvents, setSecurityEvents] = useState<PlatformSecurityEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}securityEvents`);
    return saved ? JSON.parse(saved) : initialPlatformSecurityEvents;
  });

  const [transactions] = useState<PlatformTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : initialPlatformTransactions;
  });

  const [systemLogs] = useState<PlatformSystemLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}systemLogs`);
    return saved ? JSON.parse(saved) : initialPlatformSystemLogs;
  });

  const [integrations, setIntegrations] = useState<PlatformIntegration[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}integrations`);
    return saved ? JSON.parse(saved) : initialPlatformIntegrations;
  });

  const [rolePermissions] = useState<PlatformRolePermission[]>(() => {
    return initialPlatformRolePermissions;
  });

  const [backgroundJobs, setBackgroundJobs] = useState<PlatformBackgroundJob[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}backgroundJobs`);
    return saved ? JSON.parse(saved) : initialPlatformBackgroundJobs;
  });

  const [backupRecords, setBackupRecords] = useState<PlatformBackupRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}backupRecords`);
    return saved ? JSON.parse(saved) : initialPlatformBackupRecords;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}accounts`, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}organizations`, JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}plans`, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}subscriptions`, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tickets`, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}announcements`, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}activeSessions`, JSON.stringify(activeSessions));
  }, [activeSessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}securityEvents`, JSON.stringify(securityEvents));
  }, [securityEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}backgroundJobs`, JSON.stringify(backgroundJobs));
  }, [backgroundJobs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}backupRecords`, JSON.stringify(backupRecords));
  }, [backupRecords]);

  // Log an audit event
  const appendAuditLog = (action: string, targetType: PlatformAuditLog['targetType'], targetId: string, details: string) => {
    const newLog: PlatformAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorEmail: 'admin@rentflow.vn',
      actorRole: 'SUPERADMIN',
      action,
      targetType,
      targetId,
      ipAddress: '118.69.182.10',
      location: 'Hà Nội, VN',
      status: 'SUCCESS',
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const toggleAccountStatus = (accountId: string, reason?: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          const nextStatus = acc.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          appendAuditLog(
            nextStatus === 'ACTIVE' ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
            'ACCOUNT',
            acc.id,
            `${acc.email} - Trạng thái mới: ${nextStatus}. ${reason ? `Lý do: ${reason}` : ''}`
          );
          return { ...acc, status: nextStatus };
        }
        return acc;
      })
    );
  };

  const updateAccountRole = (accountId: string, role: PlatformAccount['role']) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          appendAuditLog('Phân quyền tài khoản', 'ACCOUNT', acc.id, `Đổi vai trò thành ${role}`);
          return { ...acc, role };
        }
        return acc;
      })
    );
  };

  const toggleOrganizationStatus = (orgId: string, reason?: string) => {
    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id === orgId) {
          const nextStatus = org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          appendAuditLog(
            nextStatus === 'ACTIVE' ? 'Kích hoạt lại tổ chức' : 'Tạm ngưng tổ chức',
            'ORGANIZATION',
            org.id,
            `${org.name} -> ${nextStatus}. ${reason ? `Lý do: ${reason}` : ''}`
          );
          return {
            ...org,
            status: nextStatus,
            subscriptionStatus: nextStatus === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
          };
        }
        return org;
      })
    );
  };

  const updateOrganizationPlan = (orgId: string, planId: SubscriptionPlan['id']) => {
    const targetPlan = plans.find((p) => p.id === planId);
    if (!targetPlan) return;

    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id === orgId) {
          appendAuditLog(
            'Điều chỉnh gói dịch vụ',
            'ORGANIZATION',
            org.id,
            `Chuyển sang gói ${targetPlan.name} (Hạn mức: ${targetPlan.maxRooms} phòng)`
          );
          return {
            ...org,
            planId: targetPlan.id,
            planName: targetPlan.name,
            maxRoomsQuota: targetPlan.maxRooms,
            mrrVnd: targetPlan.monthlyPrice,
          };
        }
        return org;
      })
    );
  };

  const updatePlan = (planId: SubscriptionPlan['id'], data: Partial<SubscriptionPlan>) => {
    setPlans((prev) => {
      const updated = prev.map((p) => {
        if (p.id === planId) {
          const newPlan = { ...p, ...data };
          appendAuditLog(
            'Cập nhật tham số gói SaaS',
            'SETTING',
            planId,
            `Gói ${newPlan.name}: Giá ${newPlan.monthlyPrice.toLocaleString('vi-VN')} đ/tháng, tối đa ${newPlan.maxRooms} phòng`
          );
          return newPlan;
        }
        return p;
      });
      localStorage.setItem(`${STORAGE_KEY_PREFIX}plans`, JSON.stringify(updated));
      return updated;
    });
  };

  const updateTicketStatus = (ticketId: string, status: PlatformSupportTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          appendAuditLog('Cập nhật trạng thái Ticket', 'SYSTEM', t.ticketNumber, `Trạng thái: ${status}`);
          return { ...t, status, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) };
        }
        return t;
      })
    );
  };

  const replyToTicket = (ticketId: string, content: string, isInternal: boolean = false, senderName: string = 'Đội ngũ Hỗ trợ RentFlow') => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newMessage = {
            id: `msg-${Date.now()}`,
            sender: (isInternal ? 'SYSTEM' : 'AGENT') as 'SYSTEM' | 'AGENT',
            senderName,
            content,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            isInternalNote: isInternal,
          };
          const nextStatus = isInternal ? t.status : 'RESOLVED';
          return {
            ...t,
            status: nextStatus,
            updatedAt: newMessage.timestamp,
            messages: [...t.messages, newMessage],
          };
        }
        return t;
      })
    );
  };

  const createAnnouncement = (announcement: Omit<PlatformAnnouncement, 'id' | 'publishedAt'>) => {
    const newAnc: PlatformAnnouncement = {
      ...announcement,
      id: `anc-${Date.now()}`,
      publishedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setAnnouncements((prev) => [newAnc, ...prev]);
    appendAuditLog('Đăng thông báo hệ thống', 'SYSTEM', newAnc.id, newAnc.title);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    appendAuditLog('Xóa thông báo hệ thống', 'SYSTEM', id, 'Đã thu hồi thông báo');
  };

  const refreshAuditLogs = () => {
    appendAuditLog('Làm mới Audit Logs', 'SECURITY', 'System', 'Truy vấn lịch sử kiểm toán mới nhất');
  };

  const revokeSession = (sessionId: string, reason?: string) => {
    const targetSession = activeSessions.find((s) => s.id === sessionId);
    if (!targetSession) return;
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    appendAuditLog(
      'Hủy phiên đăng nhập (Revoke Session)',
      'SECURITY',
      sessionId,
      `Đã thu hồi phiên của ${targetSession.email} (${targetSession.device}). ${reason ? `Lý do: ${reason}` : ''}`
    );
  };

  const resolveSecurityEvent = (eventId: string, resolutionNote?: string) => {
    setSecurityEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
          appendAuditLog(
            'Xử lý sự kiện bảo mật',
            'SECURITY',
            eventId,
            `Đã đóng sự cố: ${e.title}. Ghi chú: ${resolutionNote || 'Đã kiểm tra và vô hiệu hóa mối đe dọa'}`
          );
          return {
            ...e,
            status: 'RESOLVED',
            resolvedAt: nowStr,
            resolvedBy: 'Admin (admin@rentflow.vn)',
          };
        }
        return e;
      })
    );
  };

  const testIntegrationPing = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id === integrationId) {
          appendAuditLog('Kiểm tra kết nối tích hợp', 'SYSTEM', integrationId, `Ping thành công tới ${i.name}`);
          return { ...i, lastPingAt: 'Vừa xong', status: 'OPERATIONAL' };
        }
        return i;
      })
    );
  };

  // SaaS Computed Metrics
  const metrics = {
    totalAccounts: accounts.length + 1414, // Projected SaaS total
    activeLandlords: organizations.filter((o) => o.status === 'ACTIVE').length + 1416,
    totalManagedRooms: organizations.reduce((sum, o) => sum + o.roomsCount, 0) + 28500,
    totalOrganizations: organizations.length + 1416,
    mrrVnd: organizations.reduce((sum, o) => sum + (o.status === 'ACTIVE' ? o.mrrVnd : 0), 0) + 142000000,
    activeSubscriptionsCount: subscriptions.filter((s) => s.status === 'ACTIVE').length + 988,
    pendingTicketsCount: tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
    systemUptime: '99.98%',
    securityThreatsCount: securityEvents.filter((e) => e.status === 'OPEN' || e.status === 'INVESTIGATING').length,
    activeSessionsCount: activeSessions.length,
  };

  const createAccount = (data: Omit<PlatformAccount, 'id' | 'createdAt' | 'lastLoginAt'>) => {
    const newAcc: PlatformAccount = {
      ...data,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastLoginAt: 'Chưa đăng nhập',
    };
    setAccounts((prev) => [newAcc, ...prev]);
    appendAuditLog('Tạo tài khoản mới', 'ACCOUNT', newAcc.id, `Tạo tài khoản ${newAcc.email} (${newAcc.role})`);
  };

  const updateAccount = (accountId: string, data: Partial<PlatformAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          const updated = { ...acc, ...data };
          appendAuditLog('Cập nhật hồ sơ tài khoản', 'ACCOUNT', accountId, `Chỉnh sửa thông tin ${acc.email}`);
          return updated;
        }
        return acc;
      })
    );
  };

  const retryBackgroundJob = (jobId: string) => {
    setBackgroundJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          appendAuditLog('Thử lại tác vụ nền', 'SYSTEM', jobId, `Khởi động lại Job ${j.title}`);
          return {
            ...j,
            status: 'RUNNING',
            attempts: j.attempts + 1,
            startedAt: 'Vừa xong',
            lastError: undefined,
          };
        }
        return j;
      })
    );
  };

  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}accounts`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}organizations`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}plans`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}subscriptions`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}tickets`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}announcements`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}auditLogs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}activeSessions`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}securityEvents`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}backgroundJobs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}backupRecords`);

    setAccounts(initialPlatformAccounts);
    setOrganizations(initialPlatformOrganizations);
    setTickets(initialPlatformSupportTickets);
    setAnnouncements(initialPlatformAnnouncements);
    setAuditLogs(initialPlatformAuditLogs);
    setActiveSessions(initialPlatformActiveSessions);
    setSecurityEvents(initialPlatformSecurityEvents);
    setBackgroundJobs(initialPlatformBackgroundJobs);
    setBackupRecords(initialPlatformBackupRecords);
  };

  return (
    <PlatformAdminContext.Provider
      value={{
        accounts,
        organizations,
        plans,
        subscriptions,
        tickets,
        announcements,
        auditLogs,
        loginLogs,
        activeSessions,
        securityEvents,
        transactions,
        systemLogs,
        integrations,
        rolePermissions,
        backgroundJobs,
        backupRecords,
        createAccount,
        updateAccount,
        toggleAccountStatus,
        updateAccountRole,
        toggleOrganizationStatus,
        updateOrganizationPlan,
        updatePlan,
        updateTicketStatus,
        replyToTicket,
        createAnnouncement,
        deleteAnnouncement,
        refreshAuditLogs,
        revokeSession,
        resolveSecurityEvent,
        testIntegrationPing,
        retryBackgroundJob,
        resetDemoData,
        metrics,
      }}
    >
      {children}
    </PlatformAdminContext.Provider>
  );
};

export const usePlatformAdmin = () => {
  const context = useContext(PlatformAdminContext);
  if (!context) {
    throw new Error('usePlatformAdmin must be used within a PlatformAdminProvider');
  }
  return context;
};
