import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Receipt,
  Zap,
  CreditCard,
  Wrench,
  Bell,
  Settings,
  Search,
  ShieldAlert,
  LifeBuoy,
  Layers,
  Activity,
  UserCheck,
  ShieldCheck,
  KeyRound,
  FileSpreadsheet,
  Server,
  Database,
  Play,
  Wallet,
} from 'lucide-react';
import { useAuth, UserRole } from '@/features/auth/AuthContext';
import { RentFlowLogo } from '@/components/ui/RentFlowLogo';
import { useToast } from '@/components/feedback/ToastSystem';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { info } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isTenant = user?.role === 'TENANT';
  const dashboardPath = isSuperAdmin ? '/platform/dashboard' : isTenant ? '/tenant/dashboard' : '/landlord/dashboard';

  // Landlord Operations Navigation (Screen 1-28)
  const landlordDashboardNav = [
    { name: 'Tổng quan', path: '/landlord/dashboard', icon: LayoutDashboard },
  ];

  const landlordPropertyFlowNav = [
    { name: 'Bất động sản & Phòng', path: '/properties', icon: Building2 },
    { name: 'Hồ sơ người thuê', path: '/tenants', icon: Users },
    { name: 'Hợp đồng thuê', path: '/contracts', icon: FileText },
  ];

  const landlordFinanceNav = [
    { name: 'Hóa đơn tiền phòng', path: '/invoices', icon: Receipt },
    { name: 'Ghi chỉ số Điện & Nước', path: '/meter-readings', icon: Zap },
    { name: 'Sổ thu chi & Quản lý quỹ', path: '/payments', icon: Wallet },
  ];

  const landlordOperationsNav = [
    { name: 'Bảo trì & Sửa chữa', path: '/maintenance', icon: Wrench },
    { name: 'Thông báo', path: '/notifications', icon: Bell },
    { name: 'Cài đặt & Gói dịch vụ', path: '/settings', icon: Settings },
  ];

  // Enterprise Admin Navigation (7 Core Architecture Categories)
  const adminA_OverviewNav = [
    { name: 'Tổng quan', path: '/platform/dashboard', icon: LayoutDashboard },
  ];

  const adminB_UsersAccessNav = [
    { name: 'Tài khoản người dùng', path: '/platform/accounts', icon: UserCheck },
    { name: 'Tổ chức chủ nhà', path: '/platform/organizations', icon: Building2 },
    { name: 'Vai trò & Phân quyền', path: '/platform/access-control', icon: KeyRound },
  ];

  const adminC_CommercialNav = [
    { name: 'Gói cước & Thuê bao SaaS', path: '/platform/subscription-plans', icon: Layers },
    { name: 'Giao dịch SaaS', path: '/platform/transactions', icon: FileSpreadsheet },
  ];

  const adminD_CustomerOpsNav = [
    { name: 'Ticket hỗ trợ CSKH', path: '/platform/support', icon: LifeBuoy },
    { name: 'Thông báo toàn hệ thống', path: '/platform/announcements', icon: Bell },
  ];

  const adminE_SecurityAuditNav = [
    { name: 'Lịch sử đăng nhập', path: '/platform/security/login-logs', icon: ShieldCheck },
    { name: 'Phiên đang hoạt động', path: '/platform/security/sessions', icon: Activity },
    { name: 'Sự kiện bảo mật', path: '/platform/security/login-logs/alerts', icon: ShieldAlert },
    { name: 'Nhật ký Audit Logs', path: '/platform/audit-logs', icon: FileText },
  ];

  const adminF_SystemOpsNav = [
    { name: 'Sức khỏe hệ thống', path: '/platform/system-health', icon: Activity },
    { name: 'Nhật ký ứng dụng & Lỗi', path: '/platform/system-logs', icon: Server },
    { name: 'Tác vụ nền (Jobs)', path: '/platform/jobs', icon: Play },
    { name: 'Dịch vụ tích hợp', path: '/platform/integrations', icon: Zap },
    { name: 'Sao lưu & Lưu trữ', path: '/platform/operations/backups', icon: Database },
  ];

  const adminG_PlatformConfigNav = [
    { name: 'Cài đặt nền tảng', path: '/platform/settings', icon: Settings },
  ];

  // Tenant Portal Navigation (Section 27 & 35)
  const tenantNav = [
    { name: 'Tổng quan', path: '/tenant/dashboard', icon: LayoutDashboard },
    { name: 'Hóa đơn & Tiền phòng', path: '/tenant/invoices', icon: Receipt },
    { name: 'Lịch sử Điện & Nước', path: '/tenant/utilities', icon: Zap },
    { name: 'Lịch sử thanh toán', path: '/tenant/payments', icon: CreditCard },
    { name: 'Báo hỏng & Sửa chữa', path: '/tenant/maintenance', icon: Wrench },
    { name: 'Hợp đồng & Tiền cọc', path: '/tenant/lease', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    info('Đã đăng xuất', 'Phiên làm việc kết thúc an toàn.');
    navigate('/login');
  };

  const getRoleLabel = (r?: UserRole) => {
    switch (r) {
      case 'LANDLORD': return 'Chủ sở hữu (Chủ nhà)';
      case 'TENANT': return 'Khách thuê';
      case 'SUPERADMIN': return 'Admin Nền Tảng (SaaS)';
      default: return 'Chủ nhà';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', maxHeight: '100vh', width: '100%', overflow: 'hidden', backgroundColor: '#FBFBF9' }}>
      {/* Fixed Sidebar */}
      <aside
        style={{
          width: '240px',
          minWidth: '240px',
          height: '100vh',
          maxHeight: '100vh',
          backgroundColor: '#18584B',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '56px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Logo RentFlow bấm vào sẽ về trang tổng quan (Dashboard) */}
          <Link
            to={dashboardPath}
            title="Về trang tổng quan"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <RentFlowLogo size={28} withText={true} textColor="#FFFFFF" />
          </Link>
        </div>

        {/* Navigation Items by Role */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px 8px' }}>
          {(() => {
            const isItemActive = (path: string) => {
              if (location.pathname === path) return true;
              if (path === '/platform/subscription-plans' && (location.pathname.startsWith('/platform/subscription-plans') || location.pathname === '/platform/subscriptions')) return true;
              if (path === '/payments' && (
                location.pathname === '/payments' ||
                location.pathname === '/expenses' ||
                location.pathname === '/landlord/expenses' ||
                location.pathname === '/deposits' ||
                location.pathname.startsWith('/payments/') ||
                location.pathname.startsWith('/landlord/payments/') ||
                location.pathname.startsWith('/deposits/')
              )) return true;
              if (path === '/properties' && (location.pathname.startsWith('/properties') || location.pathname.startsWith('/rooms'))) return true;
              // For nested routes
              if (path !== '/' && path !== '/tenant/dashboard' && path !== '/landlord/dashboard' && path !== '/platform/dashboard') {
                return location.pathname.startsWith(path);
              }
              return false;
            };

            const renderNavLink = (item: { name: string; path: string; icon: React.ElementType }) => {
              const Icon = item.icon;
              const active = isItemActive(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.name}
                  className={`rf-nav-item ${active ? 'rf-nav-item-active' : ''}`}
                >
                  <Icon
                    size={17}
                    className="rf-nav-icon"
                    color={active ? '#34D399' : '#9CA3AF'}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                </NavLink>
              );
            };

            if (isTenant) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ padding: '8px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Menu
                  </div>
                  {tenantNav.map(renderNavLink)}
                </div>
              );
            }

            if (isSuperAdmin) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ padding: '8px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Tổng quan
                  </div>
                  {adminA_OverviewNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Người dùng & Truy cập
                  </div>
                  {adminB_UsersAccessNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Thương mại & Thuê bao
                  </div>
                  {adminC_CommercialNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Chăm sóc khách hàng
                  </div>
                  {adminD_CustomerOpsNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Bảo mật & Kiểm toán
                  </div>
                  {adminE_SecurityAuditNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Vận hành hệ thống
                  </div>
                  {adminF_SystemOpsNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Cấu hình nền tảng
                  </div>
                  {adminG_PlatformConfigNav.map(renderNavLink)}
                </div>
              );
            }

            return (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {landlordDashboardNav.map(renderNavLink)}
                </div>

                <div style={{ padding: '16px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Cơ sở & Cư dân
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {landlordPropertyFlowNav.map(renderNavLink)}
                </div>

                <div style={{ padding: '16px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Tài chính & Thu chi
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {landlordFinanceNav.map(renderNavLink)}
                </div>

                <div style={{ padding: '16px 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Vận hành & Hỗ trợ
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {landlordOperationsNav.map(renderNavLink)}
                </div>
              </>
            );
          })()}
        </div>

        {/* Sidebar Footer: User / Organization Info docked at bottom-left */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.18)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 8px',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#0A362C',
                border: '1.5px solid #34D399',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {user?.name.slice(0, 2).toUpperCase() || 'NA'}
            </div>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 600,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={isTenant ? user?.name : (user?.organizationName || user?.name || 'Nguyễn An Property')}
              >
                {isTenant ? user?.name : (user?.organizationName || user?.name || 'Nguyễn An Property')}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#A7F3D0',
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {!isTenant
                  ? getRoleLabel(user?.role)
                  : user?.roomCode
                  ? `Phòng ${user.roomCode}`
                  : 'Cư dân'}
              </div>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
        {/* Top Header - Fixed Topbar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            height: '56px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
          }}
        >
          {/* Dynamic Interactive Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <Link
              to={isSuperAdmin ? '/platform/dashboard' : isTenant ? '/tenant/dashboard' : '/landlord/dashboard'}
              style={{ color: '#4B5563', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#00594C')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
            >
              Tổng quan
            </Link>
            <span style={{ color: '#9CA3AF' }}>/</span>
            {(() => {
              const p = location.pathname;

              // Helper for generating parent and current crumbs
              let parentLink: { label: string; to: string } | null = null;
              let currentLabel = 'Chi tiết';

              if (p.includes('/platform/accounts')) {
                currentLabel = 'Tài khoản người dùng';
              } else if (p.includes('/platform/organizations')) {
                currentLabel = 'Tổ chức chủ nhà';
              } else if (p.includes('/platform/access-control')) {
                currentLabel = 'Vai trò & Phân quyền';
              } else if (p.includes('/platform/subscription-plans')) {
                currentLabel = 'Gói dịch vụ SaaS';
              } else if (p.includes('/platform/subscriptions')) {
                currentLabel = 'Hợp đồng thuê bao';
              } else if (p.includes('/platform/transactions')) {
                currentLabel = 'Giao dịch thanh toán SaaS';
              } else if (p.includes('/platform/support')) {
                currentLabel = 'Trung tâm hỗ trợ CSKH';
              } else if (p.includes('/platform/announcements')) {
                currentLabel = 'Thông báo toàn hệ thống';
              } else if (p.includes('/platform/security/login-history')) {
                parentLink = { label: 'Bảo mật & Kiểm toán', to: '/platform/audit-logs' };
                currentLabel = 'Lịch sử đăng nhập (Login Logs)';
              } else if (p.includes('/platform/security/sessions')) {
                parentLink = { label: 'Bảo mật & Kiểm toán', to: '/platform/audit-logs' };
                currentLabel = 'Phiên đang hoạt động (Active Sessions)';
              } else if (p.includes('/platform/security/events')) {
                parentLink = { label: 'Bảo mật & Kiểm toán', to: '/platform/audit-logs' };
                currentLabel = 'Sự kiện an ninh (Security Events)';
              } else if (p.includes('/platform/audit-logs')) {
                currentLabel = 'Nhật ký Audit Logs';
              } else if (p.includes('/platform/system-health')) {
                currentLabel = 'Sức khỏe hệ thống';
              } else if (p.includes('/platform/system-logs')) {
                parentLink = { label: 'Vận hành hệ thống', to: '/platform/system-health' };
                currentLabel = 'Nhật ký ứng dụng & Lỗi API';
              } else if (p.includes('/platform/jobs')) {
                parentLink = { label: 'Vận hành hệ thống', to: '/platform/system-health' };
                currentLabel = 'Quản lý tác vụ nền (Jobs)';
              } else if (p.includes('/platform/integrations')) {
                parentLink = { label: 'Vận hành hệ thống', to: '/platform/system-health' };
                currentLabel = 'Dịch vụ tích hợp ngoại vi';
              } else if (p.includes('/platform/operations/backups')) {
                parentLink = { label: 'Vận hành hệ thống', to: '/platform/system-health' };
                currentLabel = 'Sao lưu & Lưu trữ dữ liệu';
              } else if (p.includes('/platform/settings')) {
                currentLabel = 'Cài đặt nền tảng';
              } else if (p === '/tenant/dashboard' || p === '/tenant') {
                currentLabel = 'Tổng quan';
              } else if (p.startsWith('/tenant/invoices/')) {
                parentLink = { label: 'Hóa đơn & Tiền phòng', to: '/tenant/invoices' };
                currentLabel = 'Chi tiết hóa đơn';
              } else if (p === '/tenant/invoices') {
                currentLabel = 'Hóa đơn & Tiền phòng';
              } else if (p.startsWith('/tenant/utilities/')) {
                parentLink = { label: 'Lịch sử Điện & Nước', to: '/tenant/utilities' };
                currentLabel = 'Chi tiết chỉ số điện nước';
              } else if (p === '/tenant/utilities') {
                currentLabel = 'Lịch sử Điện & Nước';
              } else if (p === '/tenant/payments') {
                currentLabel = 'Lịch sử thanh toán';
              } else if (p.startsWith('/tenant/maintenance/')) {
                parentLink = { label: 'Báo hỏng & Sửa chữa', to: '/tenant/maintenance' };
                currentLabel = 'Chi tiết yêu cầu';
              } else if (p === '/tenant/maintenance') {
                currentLabel = 'Báo hỏng & Sửa chữa';
              } else if (p === '/tenant/lease') {
                currentLabel = 'Hợp đồng & Tiền cọc';
              } else if (p === '/dashboard' || p === '/landlord/dashboard') {
                currentLabel = isTenant ? 'Cổng Cư Dân' : isSuperAdmin ? 'Chỉ số Nền tảng' : 'Tổng quan';
              } else if (p.startsWith('/properties/')) {
                parentLink = { label: 'Bất động sản', to: '/properties' };
                currentLabel = 'Chi tiết dãy trọ';
              } else if (p === '/properties') {
                currentLabel = 'Bất động sản';
              } else if (p.includes('/rooms/new') || p.includes('/rooms/create')) {
                parentLink = { label: 'Phòng & Sơ đồ', to: '/rooms' };
                currentLabel = 'Thêm phòng mới';
              } else if (p.startsWith('/rooms/')) {
                parentLink = { label: 'Phòng & Sơ đồ', to: '/rooms' };
                currentLabel = 'Chi tiết phòng';
              } else if (p === '/rooms') {
                currentLabel = 'Phòng & Sơ đồ';
              } else if (p === '/tenants') {
                currentLabel = 'Hồ sơ người thuê';
              } else if (p.startsWith('/contracts/')) {
                parentLink = { label: 'Hợp đồng', to: '/contracts' };
                currentLabel = 'Chi tiết hợp đồng';
              } else if (p === '/contracts') {
                currentLabel = 'Hợp đồng';
              } else if (p.startsWith('/invoices/')) {
                parentLink = { label: 'Hóa đơn', to: '/invoices' };
                currentLabel = 'Chi tiết phiếu thu';
              } else if (p === '/invoices') {
                currentLabel = 'Hóa đơn';
              } else if (p.startsWith('/landlord/utilities/readings/') || p.startsWith('/utilities/readings/')) {
                parentLink = { label: 'Chỉ số điện nước', to: '/meter-readings' };
                currentLabel = 'Chi tiết chỉ số công tơ';
              } else if (p === '/meter-readings') {
                currentLabel = 'Chỉ số điện nước';
              } else if (p.startsWith('/landlord/payments/') || p.startsWith('/payments/')) {
                parentLink = { label: 'Sổ thu chi & Quản lý quỹ', to: '/payments?tab=payments' };
                currentLabel = 'Chi tiết phiếu thu';
              } else if (p === '/payments') {
                currentLabel = 'Sổ thu chi & Quản lý quỹ';
              } else if (p === '/expenses' || p === '/landlord/expenses') {
                parentLink = { label: 'Sổ thu chi & Quản lý quỹ', to: '/payments?tab=expenses' };
                currentLabel = 'Chi phí vận hành';
              } else if (p.startsWith('/deposits/')) {
                parentLink = { label: 'Sổ thu chi & Quản lý quỹ', to: '/payments?tab=deposits' };
                currentLabel = 'Chi tiết tiền cọc';
              } else if (p === '/deposits') {
                parentLink = { label: 'Sổ thu chi & Quản lý quỹ', to: '/payments?tab=deposits' };
                currentLabel = 'Tiền cọc & Quyết toán';
              } else if (p.startsWith('/maintenance/')) {
                parentLink = { label: 'Bảo trì & Sửa chữa', to: '/maintenance' };
                currentLabel = 'Chi tiết sự cố';
              } else if (p === '/maintenance') {
                currentLabel = 'Bảo trì & Sửa chữa';
              } else if (p.startsWith('/handover')) {
                parentLink = { label: 'Hợp đồng & Phòng', to: '/contracts' };
                currentLabel = 'Biên bản bàn giao phòng';
              } else if (p === '/notifications') {
                currentLabel = 'Thông báo';
              } else if (p === '/settings') {
                currentLabel = 'Cài đặt';
              }

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {parentLink && (
                    <>
                      <Link
                        to={parentLink.to}
                        style={{ color: '#00594C', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {parentLink.label}
                      </Link>
                      <span style={{ color: '#9CA3AF' }}>/</span>
                    </>
                  )}
                  <Link
                    to={location.pathname + location.search}
                    style={{ fontWeight: 600, color: '#111827', textDecoration: 'none' }}
                  >
                    {currentLabel}
                  </Link>
                </div>
              );
            })()}
          </div>

          {/* Quick Search & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Tìm phòng, hóa đơn (⌘K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '260px',
                  padding: '6px 12px 6px 32px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  backgroundColor: '#F9FAFB',
                  outline: 'none',
                }}
              />
            </div>

            <NavLink
              to="/notifications"
              style={{
                position: 'relative',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
              }}
            >
              <Bell size={16} />
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                }}
              />
            </NavLink>

            <button
              type="button"
              onClick={() => handleLogout()}
              className="rf-btn rf-btn-secondary"
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Scrollable Page Canvas with Smooth Page-Enter Animation */}
        <main
          key={location.pathname}
          className="rf-page-enter"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px',
            backgroundColor: '#FBFBF9',
          }}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
