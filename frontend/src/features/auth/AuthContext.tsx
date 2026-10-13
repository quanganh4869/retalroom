import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandLoader } from '@/components/ui/LoadingSystem';

export type UserRole = 'LANDLORD' | 'TENANT' | 'SUPERADMIN';

export interface BankAccountInfo {
  bankName: string; // e.g. "Techcombank (TCB)"
  bankCode?: string; // e.g. "TCB"
  accountNumber: string; // e.g. "190345678901"
  accountHolder: string; // e.g. "NGUYEN AN"
  notificationEmail?: string; // Email nhận thông báo khi có chuyển khoản
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  organizationName?: string;
  roomCode?: string;
  bankAccount?: BankAccountInfo;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  login: (email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserBank: (bank: BankAccountInfo) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESET_ACCOUNTS: Record<UserRole, AuthUser> = {
  LANDLORD: {
    id: 'usr_landlord',
    name: 'Nguyễn An',
    email: 'nguyenan.property@gmail.com',
    phone: '0988 123 456',
    role: 'LANDLORD',
    organizationName: 'Nguyễn An Property',
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
  },
  SUPERADMIN: {
    id: 'usr_admin',
    name: 'Quản trị viên Hệ thống',
    email: 'admin@rentflow.vn',
    phone: '1900 6868',
    role: 'SUPERADMIN',
    organizationName: 'RentFlow Platform Headquarters',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(true);

  // Restore authenticated session safely
  useEffect(() => {
    const restore = () => {
      const saved = localStorage.getItem('rentflow_auth_user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          localStorage.removeItem('rentflow_auth_user');
          setUser(null);
        }
      }
      setIsRestoringSession(false);
    };

    restore();
  }, []);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const base = PRESET_ACCOUNTS[role];
    const authenticatedUser: AuthUser = {
      ...base,
      email: email || base.email,
    };
    setUser(authenticatedUser);
    localStorage.setItem('rentflow_auth_user', JSON.stringify(authenticatedUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rentflow_auth_user');
  };

  const switchRole = (role: UserRole) => {
    const updatedUser = PRESET_ACCOUNTS[role];
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
        login,
        logout,
        switchRole,
        updateUserBank,
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
