import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, FileText, ExternalLink } from 'lucide-react';
import { mockTenants, mockProperties, mockContracts, formatVND, TenantItem, ContractItem } from '@/lib/mockData';
import { Modal } from '@/components/ui/Modal';

export const TenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<TenantItem[]>(mockTenants);
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState('all');

  const getTenantContract = (t: TenantItem): ContractItem | undefined => {
    return mockContracts.find((c) => c.tenantPhone === t.phone || c.roomCode === t.roomCode || c.tenantName === t.name);
  };

  // Modal State for adding new tenant
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIdCard, setNewIdCard] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('P.101');
  const [newProperty] = useState('Nhà trọ Hưng Phát');
  const [newDeposit, setNewDeposit] = useState(4200000);

  const filteredTenants = tenants.filter((t) => {
    const matchProperty = filterProperty === 'all' || t.propertyName === filterProperty;
    const matchQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.idCard.includes(searchQuery);
    return matchProperty && matchQuery;
  });

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newTenant: TenantItem = {
      id: `t-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      idCard: newIdCard.trim() || 'Chưa cập nhật',
      roomCode: newRoomCode,
      propertyName: newProperty,
      deposit: newDeposit,
      leaseStart: '01/04/2024',
      leaseEnd: '31/03/2025',
      status: 'active',
    };

    setTenants([newTenant, ...tenants]);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewIdCard('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Hồ sơ người thuê & Quản lý cư dân
        </h1>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={15} />
          <span>Thêm người thuê mới</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div
        className="rf-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
            <input
              type="text"
              placeholder="Tìm tên, số điện thoại, CCCD, phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px 6px 30px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                fontSize: '12px',
                width: '260px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={14} color="#00594C" />
            <select
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                fontSize: '12px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="all">Tất cả các dãy trọ / cơ sở ({mockProperties.length})</option>
              {mockProperties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#6B7280' }}>
          Hiển thị <strong>{filteredTenants.length}</strong> cư dân
        </div>
      </div>

      {/* Main Full Width Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="rf-table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Số điện thoại</th>
              <th>Số CCCD</th>
              <th>Dãy trọ / Tòa nhà</th>
              <th>Phòng cư trú</th>
              <th>Hợp đồng thuê</th>
              <th>Tiền cọc giữ</th>
              <th>Thời hạn thuê</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((t) => {
              const contract = getTenantContract(t);
              return (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTenant(t)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  title={`Bấm để xem hồ sơ chi tiết của ${t.name}`}
                >
                  <td>
                    <div style={{ fontWeight: 600, color: '#00594C' }}>
                      {t.name}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{t.phone}</td>
                  <td style={{ color: '#4B5563', fontSize: '12px' }}>{t.idCard}</td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#4B5563' }}>{t.propertyName}</span>
                  </td>
                  <td>
                    <span className="rf-badge rf-badge-active">Phòng {t.roomCode}</span>
                  </td>
                  <td>
                    {contract ? (
                      <Link
                        to={`/contracts/${contract.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#00594C',
                          fontWeight: 700,
                          fontSize: '12px',
                          textDecoration: 'none',
                          backgroundColor: '#E8F5E9',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #A7F3D0',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C8E6C9')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E8F5E9')}
                        title={`Xem chi tiết hợp đồng ${contract.id} của ${t.name}`}
                      >
                        <FileText size={13} color="#00594C" />
                        <span>{contract.id}</span>
                        <ExternalLink size={11} color="#00594C" />
                      </Link>
                    ) : (
                      <Link
                        to={`/contracts?roomCode=${t.roomCode}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#6B7280',
                          fontSize: '11px',
                          textDecoration: 'none',
                        }}
                        title="Chưa liên kết HĐ - Bấm để tạo"
                      >
                        <span style={{ fontStyle: 'italic' }}>Tạo HĐ</span>
                        <ExternalLink size={10} />
                      </Link>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: '#137333' }}>{formatVND(t.deposit)}</td>
                  <td style={{ fontSize: '12px', color: '#6B7280' }}>
                    {t.leaseStart} - {t.leaseEnd}
                  </td>
                  <td>
                    <span className="rf-badge rf-badge-active">Đang cư trú</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tenant Profile Modal */}
      {selectedTenant && (() => {
        const selectedContract = getTenantContract(selectedTenant);
        return (
          <Modal
            isOpen={Boolean(selectedTenant)}
            onClose={() => setSelectedTenant(null)}
            title={`Hồ sơ cư dân — ${selectedTenant.name}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '440px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Số điện thoại:</span>
                  <strong style={{ color: '#111827' }}>{selectedTenant.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Số CCCD / Định danh:</span>
                  <span style={{ fontWeight: 600 }}>{selectedTenant.idCard}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Dãy trọ / Tòa nhà:</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{selectedTenant.propertyName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Phòng cư trú:</span>
                  <strong style={{ color: '#00594C' }}>Phòng {selectedTenant.roomCode}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB', alignItems: 'center' }}>
                  <span style={{ color: '#6B7280' }}>Hợp đồng thuê:</span>
                  {selectedContract ? (
                    <Link
                      to={`/contracts/${selectedContract.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#00594C',
                        fontWeight: 700,
                        fontSize: '12px',
                        textDecoration: 'none',
                        backgroundColor: '#E8F5E9',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      <FileText size={13} color="#00594C" />
                      <span>{selectedContract.id} ({formatVND(selectedContract.monthlyRent)}/tháng)</span>
                      <ExternalLink size={12} color="#00594C" />
                    </Link>
                  ) : (
                    <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '12px' }}>Chưa có hợp đồng</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Tiền cọc đang giữ:</span>
                  <strong style={{ color: '#137333' }}>{formatVND(selectedTenant.deposit)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Thời hạn hợp đồng thuê:</span>
                  <span>{selectedTenant.leaseStart} đến {selectedTenant.leaseEnd}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ color: '#6B7280' }}>Trạng thái:</span>
                  <span className="rf-badge rf-badge-active">Đang cư trú</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', paddingTop: '14px' }}>
                {selectedContract ? (
                  <Link
                    to={`/contracts/${selectedContract.id}`}
                    className="rf-btn rf-btn-primary"
                    style={{ textDecoration: 'none', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileText size={14} /> Xem chi tiết hợp đồng
                  </Link>
                ) : <div />}
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  onClick={() => setSelectedTenant(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Modal: Thêm người thuê mới */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm hồ sơ người thuê mới"
      >
        <form onSubmit={handleAddTenant} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '400px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Họ và tên người thuê *
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Số điện thoại *
              </label>
              <input
                type="tel"
                placeholder="09xx xxx xxx"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Số CCCD *
              </label>
              <input
                type="text"
                placeholder="12 chữ số"
                value={newIdCard}
                onChange={(e) => setNewIdCard(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Xếp vào phòng:
              </label>
              <input
                type="text"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Tiền cọc (VNĐ):
              </label>
              <input
                type="number"
                value={newDeposit}
                onChange={(e) => setNewDeposit(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="rf-btn rf-btn-secondary" onClick={() => setShowAddModal(false)}>
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
