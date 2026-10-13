import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Wrench } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockMaintenance, MaintenanceItem } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { Modal } from '@/components/ui/Modal';

export const TenantMaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tickets, setTickets] = useState<MaintenanceItem[]>(
    mockMaintenance.filter((m) => m.roomCode === (user?.roomCode || 'P.101'))
  );

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
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Báo hỏng & Sửa chữa thiết bị
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Gửi yêu cầu hỗ trợ kỹ thuật, kiểm tra tiến độ điều phối thợ tại phòng {user?.roomCode || 'P.101'}. Bấm vào từng hàng để xem chi tiết.
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

      {/* Main Full Width Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        {tickets.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
            <Wrench size={36} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 }}>
              Chưa có yêu cầu sửa chữa nào
            </h4>
            <p style={{ fontSize: '13px', margin: '6px 0 16px 0' }}>
              Mọi thiết bị trong phòng hoạt động bình thường.
            </p>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Tạo yêu cầu báo hỏng mới
            </button>
          </div>
        ) : (
          <table className="rf-table">
            <thead>
              <tr>
                <th>Mã yêu cầu</th>
                <th>Sự cố / Vấn đề</th>
                <th>Danh mục</th>
                <th>Mức độ</th>
                <th>Thợ phụ trách</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/tenant/maintenance/${t.id}`)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  title={`Bấm để xem chi tiết tiến độ xử lý yêu cầu ${t.id}`}
                >
                  <td style={{ fontWeight: 700, color: '#00594C' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {t.id} →
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{t.title}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.description}
                    </div>
                  </td>
                  <td>
                    <span className="rf-badge rf-badge-neutral">{t.category}</span>
                  </td>
                  <td>{getPriorityBadge(t.priority)}</td>
                  <td>
                    <span style={{ fontSize: '12px', color: t.assignee ? '#111827' : '#9CA3AF' }}>
                      {t.assignee || 'Đang điều phối thợ...'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#6B7280' }}>{t.createdAt}</td>
                  <td>{getStatusBadge(t.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
