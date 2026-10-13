import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, PiggyBank } from 'lucide-react';
import { mockDeposits, formatVND, DepositItem } from '@/lib/mockData';

export const DepositsPage: React.FC = () => {
  const navigate = useNavigate();
  const [deposits] = useState<DepositItem[]>(mockDeposits);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getStatusBadge = (status: DepositItem['refundStatus']) => {
    switch (status) {
      case 'holding':
        return <span className="rf-badge rf-badge-active">Đang giữ cọc</span>;
      case 'settlement_pending':
        return <span className="rf-badge rf-badge-warning">Chờ quyết toán</span>;
      case 'refunded':
        return <span className="rf-badge rf-badge-neutral">Đã hoàn trả</span>;
      case 'deducted':
        return <span className="rf-badge rf-badge-danger">Đã cấn trừ</span>;
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    if (statusFilter !== 'all' && d.refundStatus !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchRoom = d.roomCode.toLowerCase().includes(q);
      const matchTenant = d.tenantName.toLowerCase().includes(q);
      const matchContract = d.contractCode.toLowerCase().includes(q);
      if (!matchRoom && !matchTenant && !matchContract) return false;
    }
    return true;
  });

  const totalHolding = deposits
    .filter((d) => d.refundStatus === 'holding')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPending = deposits
    .filter((d) => d.refundStatus === 'settlement_pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalRefunded = deposits
    .filter((d) => d.refundStatus === 'refunded')
    .reduce((sum, d) => sum + (d.refundAmount || d.amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý Tiền đặt cọc & Quyết toán
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Theo dõi khoản cọc đang giữ, lập phiếu cấn trừ hư hỏng và hoàn cọc khi khách trả phòng. Bấm vào từng hàng để mở trang chi tiết quyết toán.
          </p>
        </div>
        <button className="rf-btn rf-btn-primary">
          <Plus size={15} />
          <span>Thu tiền cọc mới</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng tiền cọc đang nắm giữ</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            {formatVND(totalHolding)}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            {deposits.filter((d) => d.refundStatus === 'holding').length} hợp đồng đang hiệu lực
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tiền cọc đang chờ quyết toán</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#B06000', marginTop: '6px' }}>
            {formatVND(totalPending)}
          </div>
          <div style={{ fontSize: '11px', color: '#B06000', marginTop: '4px' }}>
            {deposits.filter((d) => d.refundStatus === 'settlement_pending').length} phòng vừa trả phòng
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đã hoàn trả trong năm</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {formatVND(totalRefunded)}
          </div>
          <div style={{ fontSize: '11px', color: '#137333', marginTop: '4px' }}>
            {deposits.filter((d) => d.refundStatus === 'refunded').length} phiếu hoàn tất không khiếu nại
          </div>
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
          {[
            { key: 'all', label: 'Tất cả trạng thái' },
            { key: 'holding', label: 'Đang giữ cọc' },
            { key: 'settlement_pending', label: 'Chờ quyết toán' },
            { key: 'refunded', label: 'Đã hoàn trả' },
            { key: 'deducted', label: 'Đã cấn trừ' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: statusFilter === item.key ? 600 : 500,
                backgroundColor: statusFilter === item.key ? '#00594C' : '#F3F4F6',
                color: statusFilter === item.key ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '280px' }}>
          <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo phòng, tên khách, mã HĐ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        {filteredDeposits.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
            <PiggyBank size={36} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 }}>
              Không tìm thấy khoản tiền cọc nào
            </h4>
            <p style={{ fontSize: '13px', margin: '6px 0 16px 0' }}>
              Không có dữ liệu phù hợp với bộ lọc hiện tại.
            </p>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
              }}
            >
              Xem tất cả tiền cọc
            </button>
          </div>
        ) : (
          <table className="rf-table">
            <thead>
              <tr>
                <th>Mã phiếu / Phòng</th>
                <th>Mã HĐ liên quan</th>
                <th>Khách thuê</th>
                <th>Ngày thu cọc</th>
                <th>Số tiền cọc</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => navigate(`/deposits/${d.id}`)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  title={`Bấm để xem chi tiết quyết toán cọc phòng ${d.roomCode}`}
                >
                  <td>
                    <div style={{ fontWeight: 700, color: '#00594C' }}>
                      Phòng {d.roomCode} →
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Mã cọc #{d.id}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#2563EB' }}>
                      {d.contractCode}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.tenantName}</div>
                  </td>
                  <td style={{ fontSize: '12px', color: '#6B7280' }}>{d.depositDate}</td>
                  <td style={{ fontWeight: 700, color: '#111827' }}>{formatVND(d.amount)}</td>
                  <td>{getStatusBadge(d.refundStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
