import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PlatformAccount,
  PlatformOrganization,
  SubscriptionPlan,
  PlatformSubscription,
  PlatformSupportTicket,
  PlatformAnnouncement,
  PlatformAuditLog,
  initialPlatformAccounts,
  initialPlatformOrganizations,
  initialSubscriptionPlans,
  initialPlatformSubscriptions,
  initialPlatformSupportTickets,
  initialPlatformAnnouncements,
  initialPlatformAuditLogs,
} from './types/platformAdmin';

interface PlatformAdminContextType {
  accounts: PlatformAccount[];
  organizations: PlatformOrganization[];
  plans: SubscriptionPlan[];
  subscriptions: PlatformSubscription[];
  tickets: PlatformSupportTicket[];
  announcements: PlatformAnnouncement[];
  auditLogs: PlatformAuditLog[];
  // Actions
  toggleAccountStatus: (accountId: string, reason?: string) => void;
  updateAccountRole: (accountId: string, role: PlatformAccount['role']) => void;
  toggleOrganizationStatus: (orgId: string, reason?: string) => void;
  updateOrganizationPlan: (orgId: string, planId: SubscriptionPlan['id']) => void;
  updateTicketStatus: (ticketId: string, status: PlatformSupportTicket['status']) => void;
  replyToTicket: (ticketId: string, content: string, isInternal?: boolean, senderName?: string) => void;
  createAnnouncement: (announcement: Omit<PlatformAnnouncement, 'id' | 'publishedAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  refreshAuditLogs: () => void;
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

  const [plans] = useState<SubscriptionPlan[]>(() => {
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
        toggleAccountStatus,
        updateAccountRole,
        toggleOrganizationStatus,
        updateOrganizationPlan,
        updateTicketStatus,
        replyToTicket,
        createAnnouncement,
        deleteAnnouncement,
        refreshAuditLogs,
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
