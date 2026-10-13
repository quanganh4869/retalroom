import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Server,
  Zap,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { metrics, tickets, auditLogs, organizations } = usePlatformAdmin();

  const urgentTickets = tickets.filter(
    (t) => (t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (t.priority === 'URGENT' || t.priority === 'HIGH')
  );

  const pendingOrganizations = organizations.filter((o) => o.status === 'SUSPENDED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Platform Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="rf-badge rf-badge-danger" style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
              PLATFORM ADMIN CONSOLE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
              Hệ thống vận hành bình thường (99.98% Uptime)
            </div>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '6px 0 2px 0' }}>
            Trung tâm giám sát & điều hành nền tảng RentFlow
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Tổng quan vĩ mô hệ thống SaaS đa khách hàng (Multi-tenant), doanh thu định kỳ và bảo mật hạ tầng.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => navigate('/platform/system-health')}
          >
            <Server size={14} /> Kiểm tra hạ tầng
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => navigate('/platform/support')}
          >
            <AlertCircle size={14} /> Xem yêu cầu hỗ trợ ({metrics.pendingTicketsCount})
          </button>
        </div>
      </div>

      {/* High-level SaaS Metrics Grid (Clickable to dedicated routes) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* Metric 1: Total Active Organizations */}
        <div
          className="rf-card"
          onClick={() => navigate('/platform/organizations')}
          style={{ cursor: 'pointer', transition: 'all 0.18s ease', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#00594C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Tổ chức & Doanh nghiệp</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E6F0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00594C' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '8px 0 4px 0' }}>
            {metrics.activeLandlords.toLocaleString('vi-VN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <TrendingUp size={13} /> +12% tháng này
            </span>
            <span style={{ color: '#00594C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Quản lý <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* Metric 2: Total Managed Rental Rooms */}
        <div
          className="rf-card"
          onClick={() => navigate('/platform/organizations')}
          style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#00594C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Phòng trọ đang quản lý</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#00594C', margin: '8px 0 4px 0' }}>
            {metrics.totalManagedRooms.toLocaleString('vi-VN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#6B7280' }}>Phủ sóng 63 tỉnh thành VN</span>
            <span style={{ color: '#00594C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Chi tiết <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* Metric 3: SaaS Recurring Revenue (MRR) */}
        <div
          className="rf-card"
          onClick={() => navigate('/platform/subscriptions')}
          style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#00594C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Doanh thu phần mềm (MRR)</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '8px 0 4px 0' }}>
            {(metrics.mrrVnd / 1000000).toFixed(1)} tr đ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#6B7280' }}>{metrics.activeSubscriptionsCount} gói trả phí hoạt động</span>
            <span style={{ color: '#00594C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Gói dịch vụ <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* Metric 4: System Availability & SLA */}
        <div
          className="rf-card"
          onClick={() => navigate('/platform/system-health')}
          style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#16A34A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Độ sẵn sàng hạ tầng</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <Activity size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#16A34A', margin: '8px 0 4px 0' }}>
            {metrics.systemUptime}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#6B7280' }}>Response time: 42ms</span>
            <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Health Check <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Operational Worklist & Real-time Audit Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Left Column: Immediate Attention / Operational Action Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Center Card */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Trung tâm tác vụ cần xử lý ngay
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  Các vấn đề về ticket khẩn cấp hoặc tài khoản quá hạn thanh toán
                </span>
              </div>
              <span className="rf-badge rf-badge-danger" style={{ fontWeight: 600 }}>
                {urgentTickets.length + pendingOrganizations.length} Mục chờ
              </span>
            </div>

            {/* List of Tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {urgentTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/platform/support')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <AlertCircle size={18} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#991B1B' }}>
                          [{t.ticketNumber}] {t.subject}
                        </span>
                        <span className="rf-badge rf-badge-danger" style={{ fontSize: '10px' }}>
                          {t.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '2px' }}>
                        Tổ chức: <strong>{t.organizationName}</strong> • Người gửi: {t.requesterName}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rf-btn rf-btn-primary"
                    style={{ fontSize: '11px', padding: '4px 10px', backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/platform/support');
                    }}
                  >
                    Xử lý
                  </button>
                </div>
              ))}

              {pendingOrganizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => navigate('/platform/organizations')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FEF3C7',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Clock size={18} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#92400E' }}>
                        Tổ chức tạm ngưng dịch vụ do quá hạn: {org.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>
                        Chủ sở hữu: {org.ownerName} ({org.ownerPhone}) • Gói: {org.planName}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/platform/organizations');
                    }}
                  >
                    Xem xét
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Navigation to Admin Subsystems */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
              Phân hệ quản trị nền tảng
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div
                onClick={() => navigate('/platform/accounts')}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              >
                <Users size={18} color="#00594C" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>Quản lý Tài khoản</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Phân quyền, khóa & xác thực 2FA</div>
                </div>
              </div>

              <div
                onClick={() => navigate('/platform/subscription-plans')}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              >
                <DollarSign size={18} color="#00594C" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>Gói dịch vụ SaaS</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Biểu phí, hạn mức phòng & tính năng</div>
                </div>
              </div>

              <div
                onClick={() => navigate('/platform/announcements')}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              >
                <Zap size={18} color="#00594C" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>Thông báo toàn hệ thống</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Broadcast lịch bảo trì & tính năng mới</div>
                </div>
              </div>

              <div
                onClick={() => navigate('/platform/settings')}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              >
                <ShieldCheck size={18} color="#00594C" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>Cài đặt bảo mật SaaS</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Cấu hình cổng thanh toán & API Keys</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Audit Trail Feed */}
        <div className="rf-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Nhật ký kiểm toán gần đây
              </h3>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>Theo dõi hành vi quản trị & biến động hệ thống</span>
            </div>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => navigate('/platform/audit-logs')}
            >
              Xem tất cả →
            </button>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px' }}>
            {auditLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #F3F4F6',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{log.action}</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{log.timestamp}</span>
                </div>
                <div style={{ color: '#4B5563', marginTop: '3px' }}>{log.details}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '11px', color: '#6B7280' }}>
                  <span>Bởi: <strong>{log.actorEmail}</strong></span>
                  <span>•</span>
                  <span>IP: {log.ipAddress} ({log.location})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
