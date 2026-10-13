import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Wrench } from 'lucide-react';
import { mockMaintenance, formatVND, MaintenanceItem } from '@/lib/mockData';

export const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets] = useState<MaintenanceItem[]>(mockMaintenance);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '');

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) setFilterStatus(statusFromUrl);
  }, [searchParams]);

  const updateFilters = (catVal: string, statusVal: string, searchVal: string) => {
    const next: Record<string, string> = {};
    if (catVal && catVal !== 'all') next.category = catVal;
    if (statusVal && statusVal !== 'all') next.status = statusVal;
    if (searchVal.trim()) next.q = searchVal.trim();
    setSearchParams(next);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    if (!matchCategory || !matchStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = t.id.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchRoom = t.roomCode.toLowerCase().includes(q);
      const matchTenant = t.tenantName.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchRoom && !matchTenant) return false;
    }
    return true;
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

  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const completedCount = tickets.filter((t) => t.status === 'completed').length;
  const totalCost = tickets.reduce((sum, t) => sum + (t.cost || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý yêu cầu bảo trì & sửa chữa
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Tiếp nhận báo hỏng từ người thuê, điều phối thợ sửa và theo dõi chi phí. Bấm vào từng hàng để mở trang chi tiết phiếu.
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
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#B06000', marginTop: '6px' }}>
            {pendingCount} phiếu
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Chưa giao thợ</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đang xử lý / Đang sửa</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#1A73E8', marginTop: '6px' }}>
            {inProgressCount} phiếu
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Thợ đã nhận việc</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đã hoàn tất tháng này</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#137333', marginTop: '6px' }}>
            {completedCount} phiếu
          </div>
          <div style={{ fontSize: '11px', color: '#137333', marginTop: '4px' }}>Nghiệm thu đạt</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng chi phí sửa chữa</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {formatVND(totalCost)}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Tích lũy theo sổ chi phí</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="rf-card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', 'Nước', 'Điện', 'Điều hòa', 'Nội thất'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setFilterCategory(cat);
                updateFilters(cat, filterStatus, searchTerm);
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: filterCategory === cat ? 600 : 500,
                backgroundColor: filterCategory === cat ? '#00594C' : '#F3F4F6',
                color: filterCategory === cat ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease',
              }}
            >
              {cat === 'all' ? 'Tất cả danh mục' : cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '280px' }}>
          <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo sự cố, phòng, mã phiếu..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateFilters(filterCategory, filterStatus, e.target.value);
            }}
            style={{
              padding: '6px 12px 6px 32px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Main Full Width Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredTickets.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
            <Wrench size={36} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 }}>
              Không tìm thấy yêu cầu bảo trì nào
            </h4>
            <p style={{ fontSize: '13px', margin: '6px 0 16px 0' }}>
              Không có sự cố nào phù hợp với bộ lọc hiện tại.
            </p>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => {
                setFilterCategory('all');
                setFilterStatus('all');
                setSearchTerm('');
              }}
            >
              Xem tất cả phiếu bảo trì
            </button>
          </div>
        ) : (
          <table className="rf-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Phòng / Vấn đề sự cố</th>
                <th>Danh mục</th>
                <th>Mức độ</th>
                <th>Thợ phụ trách</th>
                <th>Chi phí</th>
                <th>Thời gian gửi</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/maintenance/${t.id}`)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  title={`Bấm để xem chi tiết phiếu bảo trì ${t.id}`}
                >
                  <td style={{ fontWeight: 700, color: '#00594C' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {t.id} →
                    </span>
                  </td>
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
                  <td>
                    <span style={{ fontSize: '12px', color: t.assignee ? '#111827' : '#9CA3AF' }}>
                      {t.assignee || 'Chưa phân công'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: t.cost ? '#111827' : '#9CA3AF' }}>
                    {t.cost ? formatVND(t.cost) : '0 đ'}
                  </td>
                  <td style={{ fontSize: '12px', color: '#6B7280' }}>{t.createdAt}</td>
                  <td>{getStatusBadge(t.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
