import React, { useState } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { mockTenants, mockProperties, formatVND, TenantItem } from '@/lib/mockData';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';
import { useActionModal } from '@/components/ui/ActionModal';

export const TenantsPage: React.FC = () => {
  const toast = useToast();
  const { confirmAction } = useActionModal();
  const [tenants, setTenants] = useState<TenantItem[]>(mockTenants);
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(mockTenants[0] ?? null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New tenant form states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIdCard, setNewIdCard] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('P.101');
  const [newPropertyName, setNewPropertyName] = useState('Nhà trọ Hưng Phát');
  const [newDeposit, setNewDeposit] = useState(4200000);

  const filteredTenants = tenants.filter((t) => {
    const matchProperty =
      filterProperty === 'all' ||
      t.propertyName.toLowerCase().includes(filterProperty.toLowerCase());
    const matchQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.idCard.includes(searchQuery);
    return matchProperty && matchQuery;
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const created: TenantItem = {
      id: `t-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      idCard: newIdCard.trim(),
      roomCode: newRoomCode.trim(),
      propertyName: newPropertyName,
      leaseStart: '01/03/2024',
      leaseEnd: '28/02/2025',
      deposit: newDeposit,
      status: 'active',
      isPrimary: true,
    };

    setTenants((prev) => [created, ...prev]);
    setSelectedTenant(created);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewIdCard('');
    toast.success('Đã thêm khách thuê!', `Hồ sơ cư dân ${created.name} đã được lưu.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý Người thuê & Cư dân
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Hồ sơ khách thuê, quản lý nhiều người ở cùng phòng, định danh CCCD và phân loại theo từng dãy trọ.
          </p>
        </div>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={15} />
          <span>Thêm người thuê mới</span>
        </button>
      </div>

      {/* Main Grid: Tenants Table & Tenant Profile Drawer (Screen 22.png) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
        {/* Table Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Filters Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Số điện thoại</th>
                  <th>Số CCCD</th>
                  <th>Dãy trọ / Tòa nhà</th>
                  <th>Phòng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTenant(t)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedTenant?.id === t.id ? '#F0FDF4' : undefined,
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{t.name}</div>
                    </td>
                    <td>{t.phone}</td>
                    <td style={{ color: '#6B7280' }}>{t.idCard}</td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#4B5563' }}>{t.propertyName}</span>
                    </td>
                    <td>
                      <span className="rf-badge rf-badge-active">{t.roomCode}</span>
                    </td>
                    <td>
                      <span className="rf-badge rf-badge-active">Đang cư trú</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenant Profile Drawer */}
        {selectedTenant && (
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E5E7EB', paddingBottom: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#00594C',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selectedTenant.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {selectedTenant.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{selectedTenant.phone}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Số CCCD:</span>
                <span style={{ fontWeight: 600 }}>{selectedTenant.idCard}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Phòng ở:</span>
                <strong style={{ color: '#00594C' }}>{selectedTenant.roomCode}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Dãy trọ / Tòa nhà:</span>
                <span style={{ fontWeight: 600 }}>{selectedTenant.propertyName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Tiền cọc giữ:</span>
                <strong style={{ color: '#137333' }}>{formatVND(selectedTenant.deposit)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#6B7280' }}>Thời hạn thuê:</span>
                <span>{selectedTenant.leaseStart} đến {selectedTenant.leaseEnd}</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={() => {
                  confirmAction({
                    title: `Gửi tin nhắn đến ${selectedTenant.name}`,
                    description: `Gửi tin nhắn thông báo (thông tin tòa nhà, nhắc nhở phòng ${selectedTenant.roomCode}) đến số điện thoại ${selectedTenant.phone} qua Zalo và tin nhắn SMS.`,
                    confirmText: 'Gửi tin nhắn',
                    successTitle: 'Đã gửi tin nhắn thành công!',
                    successMessage: `Khách thuê ${selectedTenant.name} đã nhận được tin nhắn thông báo trên ứng dụng Zalo và SMS.`,
                    simulateDelayMs: 700,
                  });
                }}
              >
                Nhắn tin thông báo (Zalo / SMS)
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={() => {
                  confirmAction({
                    title: `Tra cứu lịch sử công nợ ${selectedTenant.name}`,
                    description: `Kiểm tra toàn bộ lịch sử các đợt thanh toán, tiền cọc và đối soát hóa đơn của người thuê ${selectedTenant.name} tại phòng ${selectedTenant.roomCode}.`,
                    confirmText: 'Tra cứu ngay',
                    successTitle: 'Tra cứu hoàn tất!',
                    successMessage: `Khách thuê ${selectedTenant.name} luôn thanh toán đúng hạn. Hiện tại không có khoản nợ đọng nào.`,
                    simulateDelayMs: 650,
                  });
                }}
              >
                Xem lịch sử thanh toán & hóa đơn
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Thêm người thuê mới */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm người thuê / cư dân mới"
        description="Đăng ký hồ sơ định danh và chỉ định phòng trọ cho khách thuê mới."
      >
        <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Họ và tên khách thuê *
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Số điện thoại *
              </label>
              <input
                type="tel"
                placeholder="09xx xxx xxx"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Số CCCD *
              </label>
              <input
                type="text"
                placeholder="12 số CCCD"
                value={newIdCard}
                onChange={(e) => setNewIdCard(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Cơ sở / Dãy trọ *
              </label>
              <select
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                }}
              >
                {mockProperties.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Số phòng *
              </label>
              <input
                type="text"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Tiền cọc phòng (VNĐ)
            </label>
            <input
              type="number"
              value={newDeposit}
              onChange={(e) => setNewDeposit(Number(e.target.value))}
              step={100000}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowAddModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Lưu hồ sơ người thuê
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
