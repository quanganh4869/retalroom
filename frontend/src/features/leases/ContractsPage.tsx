import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Printer, FileCheck } from 'lucide-react';
import { mockContracts, formatVND, ContractItem } from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';

export const ContractsPage: React.FC = () => {
  const navigate = useNavigate();
  const { confirmAction } = useActionModal();
  const [searchParams] = useSearchParams();
  const [contracts] = useState<ContractItem[]>(mockContracts);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(() => {
    const id = searchParams.get('id');
    if (id) {
      return mockContracts.find((c) => c.id === id) || mockContracts[0] || null;
    }
    return mockContracts[0] ?? null;
  });
  const [activeTab, setActiveTab] = useState<'info' | 'clauses'>('info');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) setStatusFilter(statusFromUrl);
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      const found = mockContracts.find((c) => c.id === idFromUrl);
      if (found) setSelectedContract(found);
    }
  }, [searchParams]);

  const filteredContracts = contracts.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý hợp đồng thuê
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Theo dõi thời hạn, tiền cọc, điều khoản thuê và gia hạn hợp đồng tự động
          </p>
        </div>
        <button className="rf-btn rf-btn-primary">
          <Plus size={15} />
          <span>Tạo hợp đồng mới</span>
        </button>
      </div>

      {/* Main Grid: Contracts Table & Contract Detail Preview (Screen 11.png) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px' }}>
        {/* Left Column: Contracts list */}
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Tìm mã HĐ, tên người thuê, số phòng..."
                style={{
                  padding: '5px 10px 5px 30px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  width: '260px',
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Hiển thị <strong>{filteredContracts.length}</strong> hợp đồng
            </div>
          </div>

          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Phòng / Khách thuê</th>
                  <th>Thời hạn thuê</th>
                  <th>Tiền thuê</th>
                  <th>Tiền cọc</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedContract(c)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedContract?.id === c.id ? '#F0FDF4' : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 600, color: '#00594C' }}>{c.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.roomCode}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        {c.tenantName} ({c.tenantPhone})
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{c.startDate} → {c.endDate}</div>
                      <div style={{ fontSize: '10px', color: '#6B7280' }}>{c.paymentCycle}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatVND(c.monthlyRent)}</td>
                    <td style={{ fontWeight: 500, color: '#137333' }}>{formatVND(c.depositAmount)}</td>
                    <td>{getStatusBadge(c.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Contract Detail Preview (Screen 11.png CT-2023-041) */}
        {selectedContract && (
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>HỢP ĐỒNG THUÊ NHÀ</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>
                  {selectedContract.id}
                </h3>
              </div>
              {getStatusBadge(selectedContract.status)}
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', gap: '16px', fontSize: '12px' }}>
              <button
                onClick={() => setActiveTab('info')}
                style={{
                  padding: '6px 0',
                  border: 'none',
                  background: 'none',
                  fontWeight: activeTab === 'info' ? 600 : 400,
                  color: activeTab === 'info' ? '#00594C' : '#6B7280',
                  borderBottom: activeTab === 'info' ? '2px solid #00594C' : 'none',
                  cursor: 'pointer',
                }}
              >
                Thông tin chung
              </button>
              <button
                onClick={() => setActiveTab('clauses')}
                style={{
                  padding: '6px 0',
                  border: 'none',
                  background: 'none',
                  fontWeight: activeTab === 'clauses' ? 600 : 400,
                  color: activeTab === 'clauses' ? '#00594C' : '#6B7280',
                  borderBottom: activeTab === 'clauses' ? '2px solid #00594C' : 'none',
                  cursor: 'pointer',
                }}
              >
                Điều khoản & Đơn giá
              </button>
            </div>

            {activeTab === 'info' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Đại diện bên thuê (Đứng tên HĐ):</span>
                    <strong style={{ color: '#111827' }}>{selectedContract.tenantName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Số điện thoại đại diện:</span>
                    <span>{selectedContract.tenantPhone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Phòng chỉ định:</span>
                    <strong style={{ color: '#00594C' }}>{selectedContract.roomCode}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Hình thức thuê & Cư trú:</span>
                    <span style={{ fontWeight: 600, color: '#00594C' }}>Được phép ở 2-4 người (theo sức chứa phòng)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                    <span style={{ color: '#6B7280' }}>Ngày bắt đầu hợp đồng:</span>
                    <span>{selectedContract.startDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                    <span style={{ color: '#6B7280' }}>Ngày kết thúc hợp đồng:</span>
                    <span style={{ fontWeight: 600 }}>{selectedContract.endDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                    <span style={{ color: '#6B7280' }}>Giá thuê hàng tháng:</span>
                    <strong style={{ color: '#111827' }}>{formatVND(selectedContract.monthlyRent)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                    <span style={{ color: '#6B7280' }}>Tiền cọc giữ chỗ:</span>
                    <strong style={{ color: '#137333' }}>{formatVND(selectedContract.depositAmount)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: '#6B7280' }}>Kỳ hạn thanh toán:</span>
                    <span>{selectedContract.paymentCycle} (vào ngày 05 hàng tháng)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#374151', lineHeight: 1.5 }}>
                <p>• Giá điện: 3.800 đ/kWh theo công tơ riêng của phòng.</p>
                <p>• Giá nước: 20.000 đ/m³ theo đồng hồ nước.</p>
                <p>• Số người ở: Cho phép 2-4 người ở cùng, tất cả người ở phải đăng ký CCCD tạm trú với chủ nhà.</p>
                <p>• Tiền phòng thanh toán từ ngày 01 đến 05 hàng tháng.</p>
                <p>• Báo trước ít nhất 30 ngày trước khi trả phòng để nhận lại tiền cọc.</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={() => navigate(`/contracts/${selectedContract.id}`)}
              >
                <FileCheck size={14} />
                Xem toàn văn hợp đồng chính thức
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ flex: 1, fontSize: '12px' }}
                  onClick={() => window.print()}
                >
                  <Printer size={13} /> In hợp đồng
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ flex: 1, fontSize: '12px', color: '#C5221F' }}
                  onClick={() => {
                    confirmAction({
                      title: `Xác nhận thanh lý hợp đồng ${selectedContract.id}`,
                      description: `Bạn có chắc chắn muốn tiến hành thủ tục thanh lý hợp đồng thuê phòng ${selectedContract.roomCode} của khách thuê ${selectedContract.tenantName}? Hệ thống sẽ chuyển tiếp sang bước quyết toán hoàn trả tiền cọc.`,
                      confirmText: 'Xác nhận thanh lý',
                      confirmVariant: 'danger',
                      successTitle: 'Đã thanh lý hợp đồng!',
                      successMessage: `Hợp đồng ${selectedContract.id} đã chuyển sang trạng thái đã chấm dứt. Phiếu quyết toán cọc phòng ${selectedContract.roomCode} đã được tạo tự động.`,
                      simulateDelayMs: 900,
                    });
                  }}
                >
                  Thanh lý HĐ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
