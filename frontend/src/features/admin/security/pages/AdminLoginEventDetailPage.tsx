import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Globe,
  Ban,
  Check,
  History,
  Lock,
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastSystem';
import { securityApiService } from '../services/securityApiService';
import { LoginEventDetailData, LoginLogItem } from '../types';
import { SecurityBreadcrumbs } from '../components/SecuritySubNav';
import { BlockIpModal } from '../components/BlockIpModal';

export const AdminLoginEventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState<LoginEventDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);
    securityApiService
      .getLoginEventDetail(eventId)
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Không tìm thấy sự kiện xác thực này.');
        setIsLoading(false);
      });
  }, [eventId]);

  const handleMarkAsReviewed = () => {
    setIsReviewed(true);
    toast.success('Đã đánh dấu xem xét', `Sự kiện ${eventId} đã được đánh dấu Đã kiểm tra vào nhật ký kiểm toán.`);
  };

  const handleBlockIp = async (blockData: { ipAddress: string; reason: string; durationHours: number; notes?: string }) => {
    await securityApiService.createBlockedIP(blockData);
    toast.success('Đã chặn IP', `Địa chỉ IP ${blockData.ipAddress} đã được khóa truy cập.`);
    if (data) {
      setData({ ...data, isIpBlocked: true });
    }
  };

  const getStatusBadge = (status: LoginLogItem['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="rf-badge rf-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} /> Thành công
          </span>
        );
      case 'FAILED':
        return (
          <span className="rf-badge rf-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} /> Thất bại
          </span>
        );
      case 'BLOCKED':
        return (
          <span
            className="rf-badge rf-badge-danger"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#450A0A',
              color: '#FCA5A5',
            }}
          >
            <AlertTriangle size={12} /> Bị WAF chặn
          </span>
        );
      default:
        return <span className="rf-badge">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '60px 0', textAlign: 'center', color: '#6B7280' }}>
        <div>Đang tải thông tin chi tiết sự kiện...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto' }}>
        <div className="rf-card" style={{ padding: '36px', textAlign: 'center' }}>
          <AlertTriangle size={36} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Không tìm thấy sự kiện xác thực
          </h2>
          <p style={{ color: '#6B7280', fontSize: '13px', margin: '8px 0 20px 0' }}>
            {error || `Mã sự kiện "${eventId}" không tồn tại hoặc đã bị xóa khỏi hệ thống.`}
          </p>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => navigate('/platform/security/login-logs')}
          >
            Quay lại Lịch sử đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const { event, relatedEvents, isIpBlocked } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header */}
      <div>
        <SecurityBreadcrumbs
          items={[
            { label: 'Lịch sử đăng nhập', to: '/platform/security/login-logs' },
            { label: `Sự kiện ${event.id}` },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Chi tiết sự kiện xác thực
            </h1>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#00594C', backgroundColor: '#E6F0EE', padding: '2px 8px', borderRadius: '4px' }}>
              {event.id}
            </span>
            {getStatusBadge(event.status)}
            {isReviewed && (
              <span className="rf-badge rf-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Check size={11} /> Đã kiểm tra
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => navigate('/platform/security/login-logs')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <ArrowLeft size={13} />
              <span>Quay lại lịch sử đăng nhập</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Overview Panel */}
      <div
        className="rf-card"
        style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          borderLeft: event.status === 'SUCCESS' ? '4px solid #16A34A' : '4px solid #DC2626',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Thời gian xảy ra
          </span>
          <div style={{ fontWeight: 700, color: '#111827', marginTop: '2px' }}>
            {event.timestamp}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} /> Tài khoản
          </span>
          <div style={{ fontWeight: 700, color: '#111827', marginTop: '2px' }}>
            {event.userName}
          </div>
          <div style={{ fontSize: '11px', color: '#4B5563' }}>{event.email}</div>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={12} /> Địa chỉ IP & Vị trí
          </span>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
            {event.ipAddress}
          </div>
          <div style={{ fontSize: '11px', color: '#4B5563' }}>{event.location}</div>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} /> Phương thức
          </span>
          <div style={{ fontWeight: 700, color: '#111827', marginTop: '2px' }}>
            {event.authMethod === 'PASSWORD_2FA' ? 'Mật khẩu + 2FA TOTP' : event.authMethod === 'GOOGLE_SSO' ? 'Google SSO' : 'Mật khẩu tiêu chuẩn'}
          </div>
        </div>
      </div>

      {/* 3. Detailed Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Section A: Event & Failure Context */}
        <div className="rf-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #E5E7EB' }}>
            1. Thông tin sự kiện xác thực
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Mã định danh sự kiện:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{event.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Trạng thái xác thực:</span>
              <span>{getStatusBadge(event.status)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Đánh giá an ninh:</span>
              <span style={{ fontWeight: 600, color: event.isSuspicious ? '#DC2626' : '#16A34A' }}>
                {event.isSuspicious ? 'Có dấu hiệu bất thường (Suspicious)' : 'Bình thường (Normal)'}
              </span>
            </div>
            {event.failureReason && (
              <div style={{ marginTop: '6px', padding: '10px 12px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FECACA', color: '#991B1B' }}>
                <strong>Lý do thất bại / Mã lỗi:</strong>
                <div style={{ marginTop: '2px' }}>{event.failureReason}</div>
              </div>
            )}
          </div>
        </div>

        {/* Section B: User Account Details */}
        <div className="rf-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #E5E7EB' }}>
            2. Tài khoản & Tổ chức
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Họ và tên:</span>
              <span style={{ fontWeight: 600 }}>{event.userName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Email đăng nhập:</span>
              <span>{event.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Vai trò quyền hạn:</span>
              <span className="rf-badge">{event.role}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Tổ chức khách hàng:</span>
              <span style={{ fontWeight: 500, color: '#00594C' }}>
                {event.organizationName || 'Không trực thuộc tổ chức'}
              </span>
            </div>
          </div>
        </div>

        {/* Section C: Network & Geolocation */}
        <div className="rf-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #E5E7EB' }}>
            3. Kết nối & Địa lý
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Địa chỉ IP nguồn:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{event.ipAddress}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Vị trí địa lý ước tính:</span>
              <span>{event.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Trạng thái khóa IP (WAF):</span>
              <span style={{ fontWeight: 600, color: isIpBlocked ? '#DC2626' : '#16A34A' }}>
                {isIpBlocked ? 'Đang bị khóa truy cập' : 'Bình thường (Cho phép)'}
              </span>
            </div>
          </div>
        </div>

        {/* Section D: Device & Client Details */}
        <div className="rf-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #E5E7EB' }}>
            4. Thiết bị & Trình duyệt
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Loại thiết bị:</span>
              <span style={{ fontWeight: 600 }}>{event.deviceType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Trình duyệt:</span>
              <span>{event.browser}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Hệ điều hành:</span>
              <span>{event.os}</span>
            </div>
            {event.userAgent && (
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>User-Agent gốc:</span>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#374151', padding: '6px 8px', backgroundColor: '#F3F4F6', borderRadius: '4px', wordBreak: 'break-all', marginTop: '2px' }}>
                  {event.userAgent}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Forensic Investigation Action Bar */}
      <div className="rf-card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
          Hành động điều tra an ninh:
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Action 1: View Account History */}
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => navigate(`/platform/security/login-logs?search=${encodeURIComponent(event.email)}`)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <History size={13} />
            <span>Xem lịch sử tài khoản này</span>
          </button>

          {/* Action 2: View IP History */}
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => navigate(`/platform/security/login-logs?search=${encodeURIComponent(event.ipAddress)}`)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <Globe size={13} />
            <span>Xem lịch sử địa chỉ IP</span>
          </button>

          {/* Action 3: Block IP */}
          {!isIpBlocked && (
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setIsBlockModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#DC2626' }}
            >
              <Ban size={13} />
              <span>Chặn địa chỉ IP này</span>
            </button>
          )}

          {/* Action 4: Mark as Reviewed */}
          {!isReviewed && (
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={handleMarkAsReviewed}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <Check size={13} />
              <span>Đánh dấu đã xem xét</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Related Recent Events Table */}
      <div className="rf-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>
          Các lần xác thực gần đây của cùng tài khoản hoặc cùng địa chỉ IP
        </h3>

        {relatedEvents.length === 0 ? (
          <div style={{ padding: '16px 0', color: '#6B7280', fontSize: '13px' }}>
            Không tìm thấy các lần đăng nhập liên quan gần đây.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#374151' }}>Mã sự kiện</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#374151' }}>Thời gian</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#374151' }}>Tài khoản</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#374151' }}>Địa chỉ IP</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#374151' }}>Phương thức</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#374151' }}>Trạng thái</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {relatedEvents.map((rel) => (
                  <tr key={rel.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{rel.id}</td>
                    <td style={{ padding: '8px 12px', color: '#4B5563' }}>{rel.timestamp}</td>
                    <td style={{ padding: '8px 12px' }}>{rel.email}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{rel.ipAddress}</td>
                    <td style={{ padding: '8px 12px' }}>{rel.authMethod}</td>
                    <td style={{ padding: '8px 12px' }}>{getStatusBadge(rel.status)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="rf-btn rf-btn-secondary"
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                        onClick={() => navigate(`/platform/security/login-logs/events/${rel.id}`)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Block IP Modal */}
      <BlockIpModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onSubmit={handleBlockIp}
        initialIp={event.ipAddress}
      />
    </div>
  );
};
