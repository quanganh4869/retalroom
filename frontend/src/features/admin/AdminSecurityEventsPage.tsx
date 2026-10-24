import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Check,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformSecurityEvent } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminSecurityEventsPage: React.FC = () => {
  const { securityEvents, resolveSecurityEvent } = usePlatformAdmin();
  const toast = useToast();

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<PlatformSecurityEvent | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredEvents = securityEvents.filter((ev) => {
    const matchesSeverity = severityFilter === 'ALL' || ev.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || ev.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  const handleResolve = () => {
    if (!selectedEvent) return;
    resolveSecurityEvent(selectedEvent.id, resolutionNote);
    toast.success('Đã cập nhật sự cố', `Sự cố ${selectedEvent.id} đã được đánh dấu là Đã xử lý.`);
    setSelectedEvent(null);
    setResolutionNote('');
  };

  const getSeverityBadge = (severity: PlatformSecurityEvent['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="rf-badge rf-badge-danger" style={{ backgroundColor: '#7F1D1D', color: '#FEE2E2', fontWeight: 700 }}>CRITICAL</span>;
      case 'HIGH':
        return <span className="rf-badge rf-badge-danger">HIGH</span>;
      case 'MEDIUM':
        return <span className="rf-badge rf-badge-warning">MEDIUM</span>;
      case 'LOW':
        return <span className="rf-badge rf-badge-neutral">LOW</span>;
      default:
        return <span className="rf-badge">{severity}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>
            Sự kiện bảo mật & Cảnh báo an ninh (Security Events)
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Tổng hợp các cảnh báo dò mật khẩu hàng loạt (Brute-force), Rate-limit WAF, truy cập từ vị trí lạ và sai chữ ký webhook.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rf-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="#6B7280" />
          <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: 500 }}>Bộ lọc:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Mọi mức độ nghiêm trọng</option>
            <option value="CRITICAL">Critical (Khẩn cấp)</option>
            <option value="HIGH">High (Nghiêm trọng)</option>
            <option value="MEDIUM">Medium (Trung bình)</option>
            <option value="LOW">Low (Thấp)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Mọi tình trạng</option>
            <option value="OPEN">Đang mở (Open)</option>
            <option value="INVESTIGATING">Đang điều tra</option>
            <option value="RESOLVED">Đã xử lý (Resolved)</option>
          </select>
        </div>
      </div>

      {/* Event List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className="rf-card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderLeft: ev.severity === 'HIGH' || ev.severity === 'CRITICAL' ? '4px solid #DC2626' : '4px solid #F59E0B',
              backgroundColor: ev.status === 'RESOLVED' ? '#F9FAFB' : '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: ev.severity === 'HIGH' ? '#FEE2E2' : '#FEF3C7',
                  color: ev.severity === 'HIGH' ? '#DC2626' : '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {ev.severity === 'HIGH' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
                    {ev.title}
                  </span>
                  {getSeverityBadge(ev.severity)}
                  <span className="rf-badge" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    {ev.category}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: '#4B5563', margin: '6px 0 8px 0', lineHeight: 1.5 }}>
                  {ev.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#6B7280' }}>
                  <span>Thời gian: <strong>{ev.timestamp}</strong></span>
                  <span>IP nguồn: <strong style={{ fontFamily: 'monospace' }}>{ev.ipAddress}</strong></span>
                  {ev.targetEmail && (
                    <span>Mục tiêu: <strong style={{ fontFamily: 'monospace' }}>{ev.targetEmail}</strong></span>
                  )}
                  {ev.resolvedBy && (
                    <span style={{ color: '#16A34A' }}>Xử lý bởi: {ev.resolvedBy}</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
              {ev.status === 'RESOLVED' ? (
                <span className="rf-badge rf-badge-active" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={12} /> Đã xử lý
                </span>
              ) : (
                <span className="rf-badge rf-badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} /> Cần xử lý
                </span>
              )}

              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ padding: '4px 12px', fontSize: '12px' }}
                onClick={() => setSelectedEvent(ev)}
              >
                <Eye size={12} /> Chi tiết & Xử lý
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={`Chi tiết sự kiện an ninh: ${selectedEvent.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>{selectedEvent.title}</span>
                {getSeverityBadge(selectedEvent.severity)}
              </div>
              <p style={{ color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                {selectedEvent.description}
              </p>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Thời điểm ghi nhận:</span>
                <div style={{ fontWeight: 600 }}>{selectedEvent.timestamp}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Địa chỉ IP nguồn:</span>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedEvent.ipAddress}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Tài khoản nhắm đến:</span>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedEvent.targetEmail || 'Toàn hệ thống'}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Trạng thái hiện tại:</span>
                <div style={{ fontWeight: 600 }}>{selectedEvent.status}</div>
              </div>
            </div>

            {selectedEvent.status !== 'RESOLVED' && (
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Ghi chú kết luận & biện pháp xử lý:
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Nhập ghi chú (vd: Đã chặn IP trên Cloudflare WAF, đã hướng dẫn khách đổi mật khẩu)..."
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
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Đóng
              </button>
              {selectedEvent.status !== 'RESOLVED' && (
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  onClick={handleResolve}
                >
                  <Check size={13} /> Đánh dấu Đã xử lý
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
