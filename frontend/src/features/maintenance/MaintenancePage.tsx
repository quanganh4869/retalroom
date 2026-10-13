import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, CheckCircle2, Phone } from 'lucide-react';
import { mockMaintenance, formatVND, MaintenanceItem } from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';

export const MaintenancePage: React.FC = () => {
  const { confirmAction } = useActionModal();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<MaintenanceItem[]>(mockMaintenance);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceItem | null>(() => {
    const ticketId = searchParams.get('id');
    if (ticketId) {
      return mockMaintenance.find((m) => m.id === ticketId) || mockMaintenance[0] || null;
    }
    return mockMaintenance[0] ?? null;
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || 'all');

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setFilterStatus(statusFromUrl);
    }
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      const found = mockMaintenance.find((m) => m.id === idFromUrl);
      if (found) setSelectedTicket(found);
    }
  }, [searchParams]);

  const filteredTickets = tickets.filter((t) => {
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchCategory && matchStatus;
  });

  const getPriorityBadge = (p: MaintenanceItem['priority']) => {
    switch (p) {
      case 'urgent':
      case 'high':
        return <span className="rf-badge rf-badge-danger">Ưu tiên cao</span>;
      case 'medium':
        return <span className="rf-badge rf-badge-warning">Trung bình</span>;
      case 'low':
        return <span className="rf-badge rf-badge-neutral">Thấp</span>;
    }
  };

  const getStatusBadge = (s: MaintenanceItem['status']) => {
    switch (s) {
      case 'in_progress':
        return <span className="rf-badge rf-badge-vacant">Đang xử lý</span>;
      case 'pending':
        return <span className="rf-badge rf-badge-warning">Chờ xử lý</span>;
      case 'completed':
        return <span className="rf-badge rf-badge-active">Đã hoàn thành</span>;
      case 'assigned':
      case 'cancelled':
        return <span className="rf-badge rf-badge-neutral">Đã đóng</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý yêu cầu bảo trì & sửa chữa
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Tiếp nhận báo hỏng từ người thuê, điều phối thợ sửa và theo dõi chi phí sửa chữa
          </p>
        </div>
        <button className="rf-btn rf-btn-primary">
          <Plus size={15} />
          <span>Tạo phiếu bảo trì mới</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đang chờ xử lý</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#B06000', marginTop: '6px' }}>1 phiếu</div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Chưa giao thợ</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đang xử lý / Đang sửa</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#1A73E8', marginTop: '6px' }}>1 phiếu</div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Thợ đã nhận việc</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đã hoàn tất tháng này</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#137333', marginTop: '6px' }}>1 phiếu</div>
          <div style={{ fontSize: '11px', color: '#137333', marginTop: '4px' }}>Nghiệm thu đạt</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng chi phí sửa chữa</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {formatVND(215000)}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Tích lũy tháng 03</div>
        </div>
      </div>

      {/* Main Grid: Ticket Table & Ticket Detail Inspector (Screen 6.png) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '20px' }}>
        {/* Ticket List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['all', 'Nước', 'Điện', 'Điều hòa', 'Nội thất'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: filterCategory === cat ? 600 : 400,
                    backgroundColor: filterCategory === cat ? '#00594C' : 'transparent',
                    color: filterCategory === cat ? '#FFFFFF' : '#4B5563',
                  }}
                >
                  {cat === 'all' ? 'Tất cả danh mục' : cat}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              {filteredTickets.length} phiếu bảo trì
            </div>
          </div>

          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Phòng / Vấn đề</th>
                  <th>Danh mục</th>
                  <th>Mức độ</th>
                  <th>Trạng thái</th>
                  <th>Thời gian gửi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedTicket?.id === t.id ? '#F0FDF4' : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 600, color: '#00594C' }}>{t.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>
                        [{t.roomCode}] {t.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        Người báo: {t.tenantName} ({t.tenantPhone})
                      </div>
                    </td>
                    <td>
                      <span className="rf-badge rf-badge-neutral">{t.category}</span>
                    </td>
                    <td>{getPriorityBadge(t.priority)}</td>
                    <td>{getStatusBadge(t.status)}</td>
                    <td style={{ fontSize: '12px', color: '#6B7280' }}>{t.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticket Detail Drawer (Screen 6.png REQ-0241) */}
        {selectedTicket && (
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#00594C' }}>{selectedTicket.id}</span>
                  <span className="rf-badge rf-badge-neutral">{selectedTicket.category}</span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '4px 0 0 0' }}>
                  {selectedTicket.title}
                </h3>
              </div>
              {getStatusBadge(selectedTicket.status)}
            </div>

            {/* Tenant Info */}
            <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '6px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Phòng & Tòa nhà:</span>
                <span style={{ fontWeight: 600 }}>{selectedTicket.roomCode} ({selectedTicket.propertyName})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Người báo:</span>
                <span style={{ fontWeight: 500 }}>{selectedTicket.tenantName} - {selectedTicket.tenantPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Thời gian gửi:</span>
                <span>{selectedTicket.createdAt}</span>
              </div>
            </div>

            {/* Description */}
            <div style={{ fontSize: '13px' }}>
              <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Mô tả chi tiết:</div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #E5E7EB', color: '#374151', lineHeight: 1.5 }}>
                {selectedTicket.description}
              </div>
            </div>

            {/* Assignment & Cost */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>Thợ phụ trách</label>
                <div style={{ padding: '8px 10px', backgroundColor: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB', fontWeight: 500 }}>
                  {selectedTicket.assignee || 'Chưa phân công'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>Chi phí ước tính</label>
                <div style={{ padding: '8px 10px', backgroundColor: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB', fontWeight: 600, color: '#00594C' }}>
                  {selectedTicket.cost ? formatVND(selectedTicket.cost) : '0 đ'}
                </div>
              </div>
            </div>

            {/* Status updates & actions */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={() => {
                  confirmAction({
                    title: `Nghiệm thu sự cố ${selectedTicket.id}`,
                    description: `Xác nhận thợ đã hoàn thành sửa chữa "${selectedTicket.title}" tại ${selectedTicket.roomCode}. Đóng phiếu sự cố và ghi nhận chi phí ${selectedTicket.cost ? formatVND(selectedTicket.cost) : '0đ'}.`,
                    confirmText: 'Xác nhận nghiệm thu',
                    successTitle: 'Nghiệm thu thành công!',
                    successMessage: `Phiếu bảo trì ${selectedTicket.id} đã hoàn tất và lưu vào lịch sử sửa chữa của phòng.`,
                    simulateDelayMs: 800,
                    onSuccess: () => {
                      setTickets((prev) =>
                        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: 'completed' as const } : t))
                      );
                      setSelectedTicket({ ...selectedTicket, status: 'completed' });
                    },
                  });
                }}
              >
                <CheckCircle2 size={14} />
                Đánh dấu đã hoàn thành & Nghiệm thu
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={() => {
                  confirmAction({
                    title: `Liên hệ thợ sửa chữa`,
                    description: `Kết nối cuộc gọi khẩn đến ${selectedTicket.assignee || 'Đội kỹ thuật bảo trì'} (Hotline: 0918.889.999) để điều phối xử lý phòng ${selectedTicket.roomCode}.`,
                    confirmText: 'Gọi ngay',
                    successTitle: 'Đang kết nối cuộc gọi...',
                    successMessage: 'Hệ thống đã gửi tín hiệu quay số đến tổng đài viên và kỹ thuật viên.',
                    simulateDelayMs: 600,
                  });
                }}
              >
                <Phone size={13} />
                Gọi điện thoại cho thợ ({selectedTicket.assignee || 'Phân công'})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
