import React, { useState } from 'react';
import {
  Search,
  Filter,
  Monitor,
  Smartphone,
  LogOut,
  ShieldCheck,
  Clock,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformActiveSession } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminActiveSessionsPage: React.FC = () => {
  const { activeSessions, revokeSession } = usePlatformAdmin();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sessionToRevoke, setSessionToRevoke] = useState<PlatformActiveSession | null>(null);
  const [revokeReason, setRevokeReason] = useState('Thu hồi bảo mật theo yêu cầu của Quản trị viên');

  const filteredSessions = activeSessions.filter((sess) => {
    const matchesSearch =
      sess.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.ipAddress.includes(searchTerm) ||
      sess.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.device.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || sess.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleConfirmRevoke = () => {
    if (!sessionToRevoke) return;
    revokeSession(sessionToRevoke.id, revokeReason);
    toast.success(
      'Hủy phiên thành công',
      `Đã chấm dứt phiên làm việc của ${sessionToRevoke.email} trên thiết bị ${sessionToRevoke.device}.`
    );
    setSessionToRevoke(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>
            Các phiên đăng nhập đang hoạt động (Active Sessions)
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Kiểm soát tất cả các JWT / Refresh Tokens đang còn hiệu lực trên toàn hệ thống. Quản trị viên có thể thu hồi phiên lập tức nếu nghi ngờ xâm nhập.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="rf-badge rf-badge-active" style={{ fontSize: '12px' }}>
            <ShieldCheck size={13} style={{ marginRight: '4px' }} />
            {activeSessions.length} Phiên đang kết nối
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rf-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo email, tên, IP hoặc thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#F9FAFB',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="#6B7280" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Mọi vai trò</option>
            <option value="SUPERADMIN">SuperAdmin</option>
            <option value="SUPPORT_AGENT">Support Ops</option>
            <option value="LANDLORD">Chủ nhà</option>
            <option value="TENANT">Khách thuê</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredSessions.map((sess) => (
          <div
            key={sess.id}
            className="rf-card"
            style={{
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: sess.isCurrentSession ? '2px solid #00594C' : '1px solid #E5E7EB',
              backgroundColor: sess.isCurrentSession ? '#F0FDF4' : '#FFFFFF',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: sess.isCurrentSession ? '#DCFCE7' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: sess.isCurrentSession ? '#16A34A' : '#4B5563',
                    }}
                  >
                    {sess.device.toLowerCase().includes('mobile') ? <Smartphone size={18} /> : <Monitor size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>
                      {sess.userName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>
                      {sess.email}
                    </div>
                  </div>
                </div>

                {sess.isCurrentSession ? (
                  <span className="rf-badge rf-badge-active" style={{ fontSize: '11px' }}>
                    Phiên hiện tại
                  </span>
                ) : (
                  <span className="rf-badge" style={{ fontSize: '11px' }}>
                    {sess.role}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#4B5563', padding: '10px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Monitor size={13} color="#9CA3AF" />
                  <span>{sess.device}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="#9CA3AF" />
                  <span>
                    <strong style={{ fontFamily: 'monospace' }}>{sess.ipAddress}</strong> • {sess.location}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} color="#9CA3AF" />
                  <span>Hoạt động lần cuối: <strong>{sess.lastActiveAt}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                Tạo lúc: {sess.createdAt.slice(11, 16)}
              </span>

              {sess.isCurrentSession ? (
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                  Không thể tự hủy phiên đang duyệt
                </span>
              ) : (
                <button
                  type="button"
                  className="rf-btn rf-btn-danger"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setSessionToRevoke(sess)}
                >
                  <LogOut size={12} /> Thu hồi phiên
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revoke Confirmation Modal */}
      {sessionToRevoke && (
        <Modal
          isOpen={!!sessionToRevoke}
          onClose={() => setSessionToRevoke(null)}
          title="Xác nhận thu hồi phiên làm việc"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FEE2E2' }}>
              <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#991B1B' }}>Cảnh báo đăng xuất tức thì</div>
                <div style={{ color: '#7F1D1D', marginTop: '2px' }}>
                  Token truy cập của người dùng <strong>{sessionToRevoke.email}</strong> trên thiết bị này sẽ bị hủy ngay lập tức. Người dùng sẽ bị điều hướng về màn hình đăng nhập.
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Lý do thu hồi (Được ghi vào Audit Log):
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => setSessionToRevoke(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-danger"
                onClick={handleConfirmRevoke}
              >
                Xác nhận thu hồi
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
