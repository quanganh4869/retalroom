import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  BarChart3,
  ShieldAlert,
  Ban,
  FileText,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SecuritySubNavProps {
  currentTab?: 'logs' | 'analytics' | 'alerts' | 'blocked-ips';
}

export const SecurityBreadcrumbs: React.FC<{
  items: { label: string; to?: string }[];
}> = ({ items }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#6B7280',
        marginBottom: '4px',
      }}
    >
      <Link to="/platform/dashboard" style={{ color: '#6B7280', textDecoration: 'none' }}>
        Tổng quan
      </Link>
      <ChevronRight size={13} color="#9CA3AF" />
      <span>Bảo mật & Kiểm toán</span>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={13} color="#9CA3AF" />
          {item.to ? (
            <Link to={item.to} style={{ color: '#00594C', fontWeight: 500, textDecoration: 'none' }}>
              {item.label}
            </Link>
          ) : (
            <span style={{ color: '#111827', fontWeight: 600 }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export const SecuritySubNav: React.FC<SecuritySubNavProps> = () => {
  const navItems = [
    {
      label: 'Lịch sử đăng nhập',
      to: '/platform/security/login-logs',
      icon: ShieldCheck,
      description: 'Tổng quan nhật ký xác thực',
      end: true,
    },
    {
      label: 'Phân tích xác thực',
      to: '/platform/security/login-logs/analytics',
      icon: BarChart3,
      description: 'Biểu đồ xu hướng và phân bố',
    },
    {
      label: 'Cảnh báo bảo mật',
      to: '/platform/security/login-logs/alerts',
      icon: ShieldAlert,
      description: 'Quản lý sự cố an ninh',
    },
    {
      label: 'Quản lý IP bị chặn',
      to: '/platform/security/login-logs/blocked-ips',
      icon: Ban,
      description: 'Hạn chế truy cập & WAF',
    },
    {
      label: 'Nhật ký Audit Logs',
      to: '/platform/audit-logs',
      icon: FileText,
      description: 'Audit logs hệ thống',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '6px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#00594C' : '#4B5563',
              backgroundColor: isActive ? '#E6F0EE' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              border: isActive ? '1px solid #B2D8D2' : '1px solid transparent',
            })}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
