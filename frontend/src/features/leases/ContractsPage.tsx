import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, FileText } from 'lucide-react';
import { mockContracts, formatVND, ContractItem } from '@/lib/mockData';

export const ContractsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contracts] = useState<ContractItem[]>(mockContracts);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '');

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) setStatusFilter(statusFromUrl);
    const qFromUrl = searchParams.get('q');
    if (qFromUrl) setSearchTerm(qFromUrl);
  }, [searchParams]);

  const updateFilters = (statusVal: string, searchVal: string) => {
    const next: Record<string, string> = {};
    if (statusVal && statusVal !== 'all') next.status = statusVal;
    if (searchVal.trim()) next.q = searchVal.trim();
    setSearchParams(next);
  };

  const filteredContracts = contracts.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchTenant = c.tenantName.toLowerCase().includes(q);
      const matchRoom = c.roomCode.toLowerCase().includes(q);
      const matchPhone = c.tenantPhone.toLowerCase().includes(q);
      if (!matchId && !matchTenant && !matchRoom && !matchPhone) return false;
    }
    return true;
  });

  const getStatusBadge = (status: ContractItem['status']) => {
    switch (status) {
      case 'active':
        return <span className="rf-badge rf-badge-active">Đang hiệu lực</span>;
      case 'expiring':
        return <span className="rf-badge rf-badge-warning">Sắp hết hạn</span>;
      case 'expired':
        return <span className="rf-badge rf-badge-danger">Đã hết hạn</span>;
      case 'terminated':
        return <span className="rf-badge rf-badge-neutral">Đã thanh lý</span>;
    }
  };

  const activeCount = contracts.filter((c) => c.status === 'active').length;
  const expiringCount = contracts.filter((c) => c.status === 'expiring').length;
  const totalDeposit = contracts.reduce((sum, c) => sum + (c.status === 'active' || c.status === 'expiring' ? c.depositAmount : 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý hợp đồng thuê
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Theo dõi thời hạn, tiền cọc, điều khoản thuê và gia hạn hợp đồng. Bấm vào từng hàng để xem chi tiết toàn văn hợp đồng.
          </p>
        </div>
        <button className="rf-btn rf-btn-primary">
          <Plus size={15} />
          <span>Tạo hợp đồng mới</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Hợp đồng đang hiệu lực</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#137333', marginTop: '6px' }}>
            {activeCount} hợp đồng
          </div>
          <div style={{ fontSize: '11px', color: '#137333', marginTop: '4px' }}>Khách đang cư trú ổn định</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Sắp hết hạn (dưới 30 ngày)</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#D97706', marginTop: '6px' }}>
            {expiringCount} hợp đồng
          </div>
          <div style={{ fontSize: '11px', color: '#D97706', marginTop: '4px' }}>Cần liên hệ gia hạn sớm</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng tiền cọc đang giữ</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            {formatVND(totalDeposit)}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Bảo chứng tài sản phòng</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng hợp đồng trong hệ thống</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {contracts.length} hồ sơ
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Lưu trữ đầy đủ các kỳ</div>
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
            { key: 'active', label: 'Đang hiệu lực' },
            { key: 'expiring', label: 'Sắp hết hạn' },
            { key: 'expired', label: 'Đã hết hạn' },
            { key: 'terminated', label: 'Đã thanh lý' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setStatusFilter(item.key);
                updateFilters(item.key, searchTerm);
              }}
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
            placeholder="Tìm mã HĐ, người thuê, phòng, SĐT..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateFilters(statusFilter, e.target.value);
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
        {filteredContracts.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
            <FileText size={36} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 }}>
              Không tìm thấy hợp đồng nào
            </h4>
            <p style={{ fontSize: '13px', margin: '6px 0 16px 0' }}>
              Không có hồ sơ hợp đồng nào phù hợp với bộ lọc hiện tại.
            </p>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
                setSearchParams({});
              }}
            >
              Xem tất cả hợp đồng
            </button>
          </div>
        ) : (
          <table className="rf-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Phòng / Cơ sở</th>
                <th>Khách thuê đại diện</th>
                <th>Thời hạn thuê</th>
                <th>Tiền thuê hàng tháng</th>
                <th>Tiền cọc giữ chỗ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/contracts/${c.id}`)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  title={`Bấm để xem chi tiết toàn văn hợp đồng ${c.id}`}
                >
                  <td style={{ fontWeight: 700, color: '#00594C' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {c.id} →
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827' }}>Phòng {c.roomCode}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Tòa nhà Hưng Phát</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.tenantName}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{c.tenantPhone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{c.startDate} → {c.endDate}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{c.paymentCycle} (ngày 05 hàng tháng)</div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#111827' }}>{formatVND(c.monthlyRent)}</td>
                  <td style={{ fontWeight: 600, color: '#137333' }}>{formatVND(c.depositAmount)}</td>
                  <td>{getStatusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
