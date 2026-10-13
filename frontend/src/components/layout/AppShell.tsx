import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileText,
  Receipt,
  Zap,
  CreditCard,
  PiggyBank,
  Wrench,
  Bell,
  Settings,
  Search,
  ShieldAlert,
  LogOut,
  LifeBuoy,
  Layers,
  Activity,
  UserCheck,
} from 'lucide-react';
import { useAuth, UserRole } from '@/features/auth/AuthContext';
import { RentFlowLogo } from '@/components/ui/RentFlowLogo';
import { useToast } from '@/components/feedback/ToastSystem';

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

  // Landlord Operations Navigation (Screen 1-28)
  const landlordOverviewNav = [
    { name: 'Tổng quan vận hành', path: '/landlord/dashboard', icon: LayoutDashboard },
    { name: 'Bất động sản', path: '/properties', icon: Building2 },
    { name: 'Phòng & Sơ đồ', path: '/rooms', icon: DoorOpen },
    { name: 'Hồ sơ người thuê', path: '/tenants', icon: Users },
    { name: 'Hợp đồng thuê', path: '/contracts', icon: FileText },
  ];

  const landlordOperationsNav = [
    { name: 'Hóa đơn tiền phòng', path: '/invoices', icon: Receipt },
    { name: 'Ghi chỉ số Điện & Nước', path: '/meter-readings', icon: Zap },
    { name: 'Thanh toán & Công nợ', path: '/payments', icon: CreditCard },
    { name: 'Tiền cọc & Quyết toán', path: '/deposits', icon: PiggyBank },
    { name: 'Bảo trì & Sửa chữa', path: '/maintenance', icon: Wrench },
    { name: 'Checklist bàn giao', path: '/handover', icon: DoorOpen },
    { name: 'Thông báo nội bộ', path: '/notifications', icon: Bell },
    { name: 'Cài đặt & Gói dịch vụ', path: '/settings', icon: Settings },
  ];

  // Admin Platform Grouped Navigation (Specification Section 11 & Admin Master Spec)
  const adminOverviewNav = [
    { name: 'Tổng quan nền tảng', path: '/platform/dashboard', icon: LayoutDashboard },
  ];

  const adminUsersNav = [
    { name: 'Tài khoản người dùng', path: '/platform/accounts', icon: UserCheck },
    { name: 'Tổ chức chủ nhà', path: '/platform/organizations', icon: Building2 },
  ];

  const adminCommercialNav = [
    { name: 'Gói dịch vụ SaaS', path: '/platform/subscription-plans', icon: Layers },
    { name: 'Thuê bao nền tảng', path: '/platform/subscriptions', icon: CreditCard },
  ];

  const adminSupportNav = [
    { name: 'Ticket hỗ trợ CSKH', path: '/platform/support', icon: LifeBuoy },
    { name: 'Thông báo hệ thống', path: '/platform/announcements', icon: Bell },
  ];

  const adminSystemNav = [
    { name: 'Nhật ký Audit Logs', path: '/platform/audit-logs', icon: ShieldAlert },
    { name: 'Sức khỏe hệ thống', path: '/platform/system-health', icon: Activity },
    { name: 'Cài đặt nền tảng', path: '/platform/settings', icon: Settings },
  ];

  // Tenant Portal Navigation (Section 27 & 35)
  const tenantNav = [
    { name: 'Cổng cư dân (Tổng quan)', path: '/tenant/dashboard', icon: LayoutDashboard },
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
      case 'TENANT': return 'Cư dân / Khách thuê';
      case 'SUPERADMIN': return 'Admin Nền Tảng (SaaS)';
      default: return 'Chủ nhà';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#FBFBF9' }}>
      {/* Fixed Sidebar */}
      <aside
        style={{
          width: '240px',
          minWidth: '240px',
          backgroundColor: '#FBFBF9',
          borderRight: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          zIndex: 40,
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
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <RentFlowLogo size={28} withText={true} />
        </div>

        {/* Current Organization / User Info */}
        <div style={{ padding: '12px 14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: '#00594C',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {user?.name.slice(0, 2).toUpperCase() || 'NA'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
                {user?.organizationName || 'Nguyễn An Property'}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>
                {getRoleLabel(user?.role)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items by Role */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px 8px' }}>
          {(() => {
            const isItemActive = (path: string) => {
              if (location.pathname === path) return true;
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
                    color={active ? '#00594C' : '#6B7280'}
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
                  <div style={{ padding: '8px 8px 4px 8px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                    Cổng Cư Dân
                  </div>
                  {tenantNav.map(renderNavLink)}
                </div>
              );
            }

            if (isSuperAdmin) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ padding: '8px 8px 4px 8px', fontSize: '11px', fontWeight: 600, color: '#DC2626', textTransform: 'uppercase' }}>
                    Tổng quan
                  </div>
                  {adminOverviewNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                    Tài khoản & Tổ chức
                  </div>
                  {adminUsersNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                    Gói dịch vụ & Thuê bao
                  </div>
                  {adminCommercialNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                    Vận hành & Hỗ trợ
                  </div>
                  {adminSupportNav.map(renderNavLink)}

                  <div style={{ padding: '14px 8px 4px 8px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                    Hệ thống & An ninh
                  </div>
                  {adminSystemNav.map(renderNavLink)}
                </div>
              );
            }

            return (
              <>
                <div style={{ padding: '8px 8px 4px 8px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                  Tổng quan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {landlordOverviewNav.map(renderNavLink)}
                </div>

                <div style={{ padding: '16px 8px 4px 8px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                  Vận hành
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {landlordOperationsNav.map(renderNavLink)}
                </div>
              </>
            );
          })()}
        </div>

        {/* User Footer */}
        <div style={{ borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#00594C',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {user?.name.slice(0, 2).toUpperCase() || 'NA'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Nguyễn An'}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>{getRoleLabel(user?.role)}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Top Header */}
        <header
          style={{
            height: '56px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
          }}
        >
          {/* Dynamic Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: '#6B7280' }}>RentFlow</span>
            <span style={{ color: '#9CA3AF' }}>/</span>
            <span style={{ color: '#4B5563' }}>
              {isSuperAdmin
                ? 'Platform HQ'
                : isTenant
                ? 'Cổng cư dân'
                : user?.organizationName || 'Nguyễn An Property'}
            </span>
            <span style={{ color: '#9CA3AF' }}>/</span>
            <span style={{ fontWeight: 600, color: '#111827' }}>
              {(() => {
                const p = location.pathname;
                if (p.includes('/platform/accounts')) return 'Tài khoản người dùng';
                if (p.includes('/platform/organizations')) return 'Tổ chức chủ nhà';
                if (p.includes('/platform/subscription-plans')) return 'Gói dịch vụ SaaS';
                if (p.includes('/platform/subscriptions')) return 'Hợp đồng thuê bao';
                if (p.includes('/platform/support')) return 'Trung tâm hỗ trợ CSKH';
                if (p.includes('/platform/announcements')) return 'Thông báo toàn hệ thống';
                if (p.includes('/platform/audit-logs')) return 'Nhật ký Audit Logs';
                if (p.includes('/platform/system-health')) return 'Sức khỏe hệ thống';
                if (p.includes('/platform/settings')) return 'Cài đặt nền tảng';
                if (p === '/tenant/dashboard' || p === '/tenant') return 'Tổng quan';
                if (p.includes('/tenant/invoices/')) return 'Chi tiết hóa đơn';
                if (p.includes('/tenant/invoices')) return 'Hóa đơn & Tiền phòng';
                if (p.includes('/tenant/utilities/')) return 'Chi tiết chỉ số điện nước';
                if (p.includes('/tenant/utilities')) return 'Lịch sử Điện & Nước';
                if (p.includes('/tenant/payments')) return 'Lịch sử thanh toán';
                if (p.includes('/tenant/maintenance')) return 'Báo hỏng & Sửa chữa';
                if (p.includes('/tenant/lease')) return 'Hợp đồng & Tiền cọc';
                if (p.includes('/dashboard')) return isTenant ? 'Cổng Cư Dân' : isSuperAdmin ? 'Chỉ số Nền tảng' : 'Tổng quan';
                if (p.includes('/properties')) return 'Bất động sản';
                if (p.includes('/rooms/new') || p.includes('/rooms/create')) return 'Thêm phòng mới';
                if (p.includes('/rooms')) return 'Phòng & Sơ đồ';
                if (p.includes('/tenants')) return 'Hồ sơ người thuê';
                if (p.includes('/contracts')) return 'Hợp đồng';
                if (p.includes('/invoices/')) return 'Chi tiết phiếu thu';
                if (p.includes('/invoices')) return 'Hóa đơn';
                if (p.includes('/utilities/readings')) return 'Chi tiết chỉ số công tơ';
                if (p.includes('/meter-readings')) return 'Chỉ số điện nước';
                if (p.includes('/payments/')) return 'Chi tiết giao dịch';
                if (p.includes('/payments')) return 'Thanh toán & Công nợ';
                if (p.includes('/expenses')) return 'Chi phí vận hành';
                if (p.includes('/deposits')) return 'Tiền cọc & Quyết toán';
                if (p.includes('/maintenance')) return 'Bảo trì & Sửa chữa';
                if (p.includes('/handover')) return 'Bàn giao phòng';
                if (p.includes('/notifications')) return 'Thông báo';
                if (p.includes('/settings')) return 'Cài đặt';
                return 'Chi tiết';
              })()}
            </span>
            <span
              className={`rf-badge ${
                isSuperAdmin ? 'rf-badge-danger' : isTenant ? 'rf-badge-vacant' : 'rf-badge-active'
              }`}
              style={{ fontSize: '10px', marginLeft: '4px' }}
            >
              {isSuperAdmin ? 'ADMIN' : isTenant ? 'CƯ DÂN' : 'CHỦ NHÀ'}
            </span>
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
              <LogOut size={13} />
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
            padding: '24px',
            backgroundColor: '#FBFBF9',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
