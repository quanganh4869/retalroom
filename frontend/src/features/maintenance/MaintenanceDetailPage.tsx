import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Phone,
  User,
} from 'lucide-react';
import { mockMaintenance, formatVND, MaintenanceItem } from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';

export const MaintenanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { confirmAction } = useActionModal();

  const found = mockMaintenance.find((m) => m.id === id);
  const initialTicket: MaintenanceItem = found || mockMaintenance[0]!;
  const [ticket, setTicket] = useState<MaintenanceItem>(initialTicket);

  const getPriorityBadge = (p: MaintenanceItem['priority']) => {
    switch (p) {
      case 'urgent':
      case 'high':
        return <span className="rf-badge rf-badge-danger">ƯU TIÊN CAO</span>;
      case 'medium':
        return <span className="rf-badge rf-badge-warning">TRUNG BÌNH</span>;
      case 'low':
        return <span className="rf-badge rf-badge-neutral">THẤP</span>;
    }
  };

  const getStatusBadge = (s: MaintenanceItem['status']) => {
    switch (s) {
      case 'in_progress':
        return <span className="rf-badge rf-badge-vacant">ĐANG XỬ LÝ</span>;
      case 'pending':
        return <span className="rf-badge rf-badge-warning">CHỜ TIẾP NHẬN</span>;
      case 'completed':
        return <span className="rf-badge rf-badge-active">ĐÃ HOÀN THÀNH</span>;
      case 'assigned':
        return <span className="rf-badge rf-badge-warning">ĐÃ GIAO THỢ</span>;
      case 'cancelled':
        return <span className="rf-badge rf-badge-neutral">ĐÃ ĐÓNG</span>;
    }
  };

  const handleCompleteTicket = () => {
    confirmAction({
      title: `Nghiệm thu hoàn tất sự cố ${ticket.id}`,
      description: `Xác nhận sự cố "${ticket.title}" tại phòng ${ticket.roomCode} đã được thợ khắc phục hoàn tất và người thuê đã hài lòng với kết quả.`,
      confirmText: 'Xác nhận nghiệm thu',
      successTitle: 'Nghiệm thu thành công!',
      successMessage: `Phiếu bảo trì ${ticket.id} đã chuyển sang trạng thái "Đã hoàn thành". Khách thuê phòng ${ticket.roomCode} sẽ nhận được thông báo qua cổng cư dân.`,
      simulateDelayMs: 800,
      onSuccess: () => {
        setTicket({ ...ticket, status: 'completed' });
      },
    });
  };

  const handleAssignWorker = () => {
    confirmAction({
      title: `Điều phối thợ sửa chữa cho phiếu ${ticket.id}`,
      description: `Chỉ định thợ kỹ thuật Trần Văn Hùng (0912.888.999) đến kiểm tra và xử lý sự cố tại phòng ${ticket.roomCode}.`,
      confirmText: 'Giao việc cho thợ',
      successTitle: 'Đã phân công thợ thành công!',
      successMessage: 'Thông tin công việc và số điện thoại khách thuê đã được gửi tới kỹ thuật viên qua tin nhắn SMS.',
      simulateDelayMs: 700,
      onSuccess: () => {
        setTicket({ ...ticket, status: 'in_progress', assignee: 'Trần Văn Hùng (Thợ điện lạnh)' });
      },
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
        {ticket.status !== 'completed' && (
          <>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={handleAssignWorker}
            >
              <User size={14} /> Phân công thợ kỹ thuật
            </button>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={handleCompleteTicket}
            >
              <CheckCircle2 size={14} /> Nghiệm thu hoàn thành
            </button>
          </>
        )}
      </div>

      {/* Main Ticket Document Card */}
      <div
        className="rf-card"
        style={{
          padding: '36px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
              <span className="rf-badge rf-badge-neutral">{ticket.category}</span>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Mã phiếu: #{ticket.id}</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
              {ticket.title}
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Cơ sở: <strong>{ticket.propertyName}</strong> • Phòng: <strong style={{ color: '#00594C' }}>{ticket.roomCode}</strong> • Ngày gửi: <strong>{ticket.createdAt}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>CHI PHÍ SỬA CHỮA</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#00594C', marginTop: '2px' }}>
              {ticket.cost ? formatVND(ticket.cost) : 'Chưa phát sinh'}
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          {/* Left: Issue Description & Detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Mô tả chi tiết sự cố từ khách thuê
              </h3>
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: 1.6,
                }}
              >
                {ticket.description}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Nhật ký tiến độ xử lý
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <Clock size={16} color="#166534" style={{ marginTop: '2px' }} />
                  <div style={{ fontSize: '13px' }}>
                    <strong style={{ color: '#14532D' }}>Tiếp nhận báo hỏng:</strong>
                    <div style={{ color: '#4B5563' }}>Hệ thống tự động ghi nhận phiếu lúc {ticket.createdAt} 08:30 từ cổng cư dân.</div>
                  </div>
                </div>

                {ticket.assignee && (
                  <div style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                    <Wrench size={16} color="#1D4ED8" style={{ marginTop: '2px' }} />
                    <div style={{ fontSize: '13px' }}>
                      <strong style={{ color: '#1E40AF' }}>Điều phối kỹ thuật:</strong>
                      <div style={{ color: '#4B5563' }}>Đã giao cho {ticket.assignee} kiểm tra trực tiếp.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Tenant & Contact Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                Người báo sự cố
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#E6F4EA', color: '#00594C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{ticket.tenantName}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Phòng {ticket.roomCode}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', paddingTop: '8px', borderTop: '1px dashed #E5E7EB' }}>
                <Phone size={14} color="#6B7280" />
                <a href={`tel:${ticket.tenantPhone}`} style={{ color: '#00594C', fontWeight: 600, textDecoration: 'none' }}>
                  {ticket.tenantPhone}
                </a>
              </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                Thợ kỹ thuật phụ trách
              </h4>
              <div style={{ fontSize: '13px', color: '#374151' }}>
                {ticket.assignee ? (
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{ticket.assignee}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Kỹ thuật viên đối tác RentFlow</div>
                  </div>
                ) : (
                  <div style={{ color: '#D97706' }}>Chưa chỉ định thợ xử lý</div>
                )}
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px', color: '#6B7280' }}>
              <div>• Cơ sở: <strong>{ticket.propertyName}</strong></div>
              <div>• Liên kết sổ chi phí: <Link to="/expenses" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Sổ chi phí vận hành →</Link></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
