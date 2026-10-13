import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockMaintenance, MaintenanceItem } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { Modal } from '@/components/ui/Modal';

export const TenantMaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [tickets, setTickets] = useState<MaintenanceItem[]>(
    mockMaintenance.filter((m) => m.roomCode === (user?.roomCode || 'P.101'))
  );
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceItem | null>(tickets[0] || null);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(searchParams.get('new') === 'true');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Nước' | 'Điện' | 'Nội thất' | 'Điều hòa' | 'Khác'>('Điện');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Thiếu tiêu đề sự cố', 'Vui lòng nhập tên sự cố cần thợ sửa chữa.');
      return;
    }

    const newTicket: MaintenanceItem = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      roomCode: user?.roomCode || 'P.101',
      propertyName: user?.organizationName || 'Nhà trọ Hưng Phát',
      title: title.trim(),
      description: description.trim() || 'Cần thợ kiểm tra và khắc phục sớm.',
      priority,
      status: 'pending',
      category,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      tenantName: user?.name || 'Lê Hoàng Nam',
      tenantPhone: user?.phone || '0901 234 567',
    };

    setTickets([newTicket, ...tickets]);
    setSelectedTicket(newTicket);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');

    toast.success(
      'Gửi yêu cầu báo hỏng thành công!',
      `Chủ nhà và đội ngũ kỹ thuật đã nhận thông báo sự cố ${newTicket.id}. Thợ sẽ liên hệ trong ít phút.`
    );
  };

  const getStatusBadge = (status: MaintenanceItem['status']) => {
    switch (status) {
      case 'completed':
        return <span className="rf-badge rf-badge-active">Đã hoàn thành</span>;
      case 'in_progress':
        return <span className="rf-badge rf-badge-vacant">Thợ đang sửa</span>;
      case 'assigned':
        return <span className="rf-badge rf-badge-warning">Đã phân công thợ</span>;
      case 'pending':
      default:
        return <span className="rf-badge rf-badge-pending">Chờ tiếp nhận</span>;
    }
  };

  const getPriorityBadge = (p: MaintenanceItem['priority']) => {
    switch (p) {
      case 'urgent':
      case 'high':
        return <span className="rf-badge rf-badge-danger">Ưu tiên cao</span>;
      case 'medium':
        return <span className="rf-badge rf-badge-warning">Bình thường</span>;
      case 'low':
      default:
        return <span className="rf-badge rf-badge-neutral">Thấp</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Báo hỏng & Sửa chữa thiết bị
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Gửi yêu cầu hỗ trợ kỹ thuật, kiểm tra tiến độ điều phối thợ và lịch sử khắc phục sự cố tại phòng {user?.roomCode || 'P.101'}.
          </p>
        </div>

        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>Gửi yêu cầu sửa chữa mới</span>
        </button>
      </div>

      {/* Main Grid: Ticket List on Left, Ticket Detail on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
        {/* Left Column: Tickets List */}
        <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Danh sách các yêu cầu của phòng ({tickets.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>
              Cập nhật thời gian thực
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #00594C' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: isSelected ? '#00594C' : '#111827', fontSize: '14px' }}>
                        {t.title}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>#{t.id}</span>
                    </div>
                    {getStatusBadge(t.status)}
                  </div>

                  <p style={{ fontSize: '12px', color: '#4B5563', margin: 0, lineHeight: 1.4 }}>
                    {t.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                    <span>Danh mục: <strong>{t.category}</strong> • {getPriorityBadge(t.priority)}</span>
                    <span>Ngày gửi: {t.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Ticket Details & Timeline */}
        {selectedTicket ? (
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>MÃ PHIẾU: #{selectedTicket.id}</span>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>
                {selectedTicket.title}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Mô tả sự cố từ cư dân:</span>
                <div style={{ padding: '10px 12px', backgroundColor: '#F9FAFB', borderRadius: '6px', marginTop: '4px', lineHeight: 1.5 }}>
                  {selectedTicket.description}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '8px 12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                  <span style={{ color: '#6B7280', fontSize: '11px' }}>Danh mục</span>
                  <div style={{ fontWeight: 600 }}>{selectedTicket.category}</div>
                </div>
                <div style={{ padding: '8px 12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                  <span style={{ color: '#6B7280', fontSize: '11px' }}>Mức độ</span>
                  <div>{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
              </div>

              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Thợ kỹ thuật phụ trách:</span>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                  {selectedTicket.assignee || 'Đang điều phối thợ đến kiểm tra...'}
                </div>
              </div>
            </div>

            {/* Timeline Progress */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Tiến độ xử lý:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D' }}>
                  <CheckCircle2 size={15} />
                  <span>Đã tiếp nhận yêu cầu ({selectedTicket.createdAt})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: selectedTicket.assignee ? '#15803D' : '#6B7280' }}>
                  {selectedTicket.assignee ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  <span>{selectedTicket.assignee ? `Đã cử thợ: ${selectedTicket.assignee}` : 'Chờ chủ nhà điều phối thợ'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: selectedTicket.status === 'completed' ? '#15803D' : '#6B7280' }}>
                  {selectedTicket.status === 'completed' ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  <span>{selectedTicket.status === 'completed' ? 'Đã hoàn thành sửa chữa' : 'Chờ nghiệm thu hoàn tất'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal: Create Maintenance Request */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Gửi yêu cầu sửa chữa thiết bị"
      >
        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '420px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Danh mục thiết bị hư hỏng *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#fff' }}
            >
              <option value="Điện">Hệ thống Điện (Bóng đèn, ổ cắm, aptomat)</option>
              <option value="Nước">Hệ thống Nước (Vòi sen, bồn cầu, lavabo, ống nước)</option>
              <option value="Điều hòa">Điều hòa / Máy lạnh (Chảy nước, không lạnh)</option>
              <option value="Nội thất">Nội thất & Cửa (Khóa từ, tủ quần áo, giường)</option>
              <option value="Khác">Sự cố khác</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Tiêu đề sự cố ngắn gọn *
            </label>
            <input
              type="text"
              placeholder="VD: Máy lạnh không mát, Vòi sen phòng tắm bị rò nước..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Mức độ ưu tiên
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#fff' }}
            >
              <option value="low">Thấp (Có thể sửa trong tuần)</option>
              <option value="medium">Bình thường (Cần xử lý trong 1-2 ngày)</option>
              <option value="high">Cao (Cần xử lý trong ngày)</option>
              <option value="urgent">Khẩn cấp (Chập điện, ngập nước...)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Mô tả chi tiết & Thời gian thuận tiện để thợ đến
            </label>
            <textarea
              rows={3}
              placeholder="Mô tả hiện trạng và khung giờ bạn có ở phòng (Ví dụ: Thợ đến sau 17h30 chiều...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="rf-btn rf-btn-secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Gửi yêu cầu tới chủ nhà
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
