import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrandLoader } from '@/components/ui/LoadingSystem';
import { authService, onboardingService, UserProfile } from './services/authOnboardingService';

export type UserRole = 'LANDLORD' | 'TENANT' | 'SUPERADMIN' | 'ADMIN' | null;

export interface BankAccountInfo {
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountHolder: string;
  notificationEmail?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  provider?: string;
  onboardingStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  onboardingStep?: string;
  organizationName?: string;
  roomCode?: string;
  bankAccount?: BankAccountInfo;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  login: (email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserBank: (bank: BankAccountInfo) => void;
  updateUserOnboarding: (status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED', step: string, role?: UserRole) => void;
  syncSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESET_ACCOUNTS: Record<string, AuthUser> = {
  LANDLORD: {
    id: 'usr_landlord',
    name: 'Nguyễn An',
    email: 'nguyenan.property@gmail.com',
    phone: '0988 123 456',
    role: 'LANDLORD',
    organizationName: 'Nguyễn An Property',
    onboardingStatus: 'COMPLETED',
    onboardingStep: 'COMPLETE',
    bankAccount: {
      bankName: 'Techcombank',
      bankCode: 'TCB',
      accountNumber: '190345678901',
      accountHolder: 'NGUYEN AN',
      notificationEmail: 'nguyenan.property@gmail.com',
    },
  },
  TENANT: {
    id: 'usr_tenant',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@gmail.com',
    phone: '0901 234 567',
    role: 'TENANT',
    roomCode: 'P.101',
    organizationName: 'Nhà trọ Hưng Phát',
    onboardingStatus: 'COMPLETED',
    onboardingStep: 'COMPLETE',
  },
  SUPERADMIN: {
    id: 'usr_admin',
    name: 'Quản trị viên Hệ thống',
    email: 'admin@rentflow.vn',
    phone: '1900 6868',
    role: 'SUPERADMIN',
    organizationName: 'RentFlow Platform Headquarters',
    onboardingStatus: 'COMPLETED',
    onboardingStep: 'COMPLETE',
  },
  ADMIN: {
    id: 'usr_admin',
    name: 'Quản trị viên Hệ thống',
    email: 'admin@rentflow.vn',
    phone: '1900 6868',
    role: 'ADMIN',
    organizationName: 'RentFlow Platform Headquarters',
    onboardingStatus: 'COMPLETED',
    onboardingStep: 'COMPLETE',
  },
};

function mapProfileToAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    name: profile.fullName || 'Người dùng RentFlow',
    email: profile.email,
    phone: profile.phoneNumber || '',
    role: profile.role,
    avatar: profile.avatarUrl,
    provider: profile.provider,
    onboardingStatus: profile.onboardingStatus,
    onboardingStep: profile.onboardingStep,
    organizationName: profile.role === 'LANDLORD' ? 'Bất động sản RentFlow' : undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(true);

  // Restore authenticated session safely
  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem('rentflow_auth_user');
      const token = localStorage.getItem('access_token');

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);

          // If token exists, sync latest profile from backend asynchronously
          if (token) {
            try {
              const profile = await authService.getCurrentUser();
              const updated = mapProfileToAuthUser(profile);
              setUser(updated);
              localStorage.setItem('rentflow_auth_user', JSON.stringify(updated));
            } catch {
              // Token might have expired or backend unreachable; keep local state or rely on refresh
            }
          }
        } catch {
          localStorage.removeItem('rentflow_auth_user');
          setUser(null);
        }
      }
      setIsRestoringSession(false);
    };

    restore();
  }, []);

  const loginWithGoogle = async (idToken: string): Promise<AuthUser> => {
    const authData = await authService.loginWithGoogle(idToken);
    localStorage.setItem('access_token', authData.accessToken);
    if (authData.refreshToken) {
      localStorage.setItem('refresh_token', authData.refreshToken);
    }
    const authUser = mapProfileToAuthUser(authData.user);
    setUser(authUser);
    localStorage.setItem('rentflow_auth_user', JSON.stringify(authUser));
    return authUser;
  };

  const syncSession = useCallback(async () => {
    try {
      const statusRes = await onboardingService.getStatus();
      if (statusRes && statusRes.profile) {
        const updated = mapProfileToAuthUser(statusRes.profile);
        setUser(updated);
        localStorage.setItem('rentflow_auth_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Failed to sync session:', e);
    }
  }, []);

  const updateUserOnboarding = (
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
    step: string,
    role?: UserRole
  ) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: AuthUser = {
        ...prev,
        onboardingStatus: status,
        onboardingStep: step,
        role: role !== undefined ? role : prev.role,
      };
      localStorage.setItem('rentflow_auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const base = role ? PRESET_ACCOUNTS[role] || PRESET_ACCOUNTS.LANDLORD : PRESET_ACCOUNTS.LANDLORD;
    const authenticatedUser: AuthUser = {
      ...base,
      email: email || base.email,
    };
    setUser(authenticatedUser);
    localStorage.setItem('rentflow_auth_user', JSON.stringify(authenticatedUser));
    return true;
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refresh_token') || undefined;
    authService.logout(refreshToken);
    setUser(null);
    localStorage.removeItem('rentflow_auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const switchRole = (role: UserRole) => {
    if (!role) return;
    const updatedUser = PRESET_ACCOUNTS[role] || PRESET_ACCOUNTS.LANDLORD;
    setUser(updatedUser);
    localStorage.setItem('rentflow_auth_user', JSON.stringify(updatedUser));
  };

  const updateUserBank = (bank: BankAccountInfo) => {
    if (!user) return;
    const updated = {
      ...user,
      bankAccount: bank,
    };
    setUser(updated);
    localStorage.setItem('rentflow_auth_user', JSON.stringify(updated));
  };

  if (isRestoringSession) {
    return <BrandLoader message="Đang khôi phục phiên làm việc..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isRestoringSession,
        loginWithGoogle,
        login,
        logout,
        switchRole,
        updateUserBank,
        updateUserOnboarding,
        syncSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
