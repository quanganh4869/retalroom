import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  DollarSign,
  Zap,
  UserPlus,
  ShieldCheck,
  Phone,
  Trash2,
  CheckCircle2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import {
  mockRooms,
  mockProperties,
  mockContracts,
  mockInvoices,
  mockMeterReadings,
  formatVND,
  RoomItem,
  RoomOccupant,
} from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';

export const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirmAction } = useActionModal();

  // Find room or fallback to first
  const foundRoom = mockRooms.find((r) => r.id === id || r.code === id);
  const initialRoom: RoomItem = foundRoom || mockRooms[0]!;
  const [room, setRoom] = useState<RoomItem>(initialRoom);

  // Property info
  const property = mockProperties.find((p) => p.id === room.propertyId);

  // Contract info for this room
  const contract = mockContracts.find((c) => c.roomCode === room.code);

  // Invoices for this room
  const invoices = mockInvoices.filter((inv) => inv.roomCode === room.code);

  // Meter readings for this room
  const meterReadings = mockMeterReadings.filter((m) => m.roomCode === room.code);

  // Modal / Form state for adding an occupant
  const [showAddOccupant, setShowAddOccupant] = useState(false);
  const [newOccupantName, setNewOccupantName] = useState('');
  const [newOccupantPhone, setNewOccupantPhone] = useState('');
  const [newOccupantIdCard, setNewOccupantIdCard] = useState('');
  const [isPrimaryNew, setIsPrimaryNew] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const currentOccupants = room.occupants || [];
  const maxOcc = room.maxOccupants || 3;
  const isFull = currentOccupants.length >= maxOcc;

  const handleAddOccupant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccupantName.trim() || !newOccupantPhone.trim()) return;

    const newOcc: RoomOccupant = {
      id: `oc-${Date.now()}`,
      name: newOccupantName.trim(),
      phone: newOccupantPhone.trim(),
      idCard: newOccupantIdCard.trim() || 'Chưa cập nhật',
      isPrimary: isPrimaryNew || currentOccupants.length === 0,
      joinedAt: new Date().toLocaleDateString('vi-VN'),
    };

    const updatedOccupants = isPrimaryNew
      ? [newOcc, ...currentOccupants.map((o) => ({ ...o, isPrimary: false }))]
      : [...currentOccupants, newOcc];

    const updatedRoom: RoomItem = {
      ...room,
      occupants: updatedOccupants,
      tenantName: isPrimaryNew || !room.tenantName ? newOcc.name : room.tenantName,
      tenantPhone: isPrimaryNew || !room.tenantPhone ? newOcc.phone : room.tenantPhone,
      status: 'occupied',
    };

    setRoom(updatedRoom);
    setShowAddOccupant(false);
    setNewOccupantName('');
    setNewOccupantPhone('');
    setNewOccupantIdCard('');
    setIsPrimaryNew(false);
    showNotification(`Đã thêm thành công người ở "${newOcc.name}" vào phòng ${room.code}!`);
  };

  const handleRemoveOccupant = (occupantId: string, occupantName: string) => {
    confirmAction({
      title: `Xóa người ở "${occupantName}"`,
      description: `Bạn có chắc chắn muốn xóa "${occupantName}" khỏi danh sách người ở của phòng ${room.code}? Hồ sơ tạm trú liên quan sẽ được cập nhật.`,
      confirmText: 'Xác nhận xóa',
      confirmVariant: 'danger',
      successTitle: 'Đã xóa người ở thành công!',
      successMessage: `Đã xóa thông tin của "${occupantName}" khỏi phòng ${room.code}.`,
      simulateDelayMs: 650,
      onSuccess: () => {
        const updatedOccupants = currentOccupants.filter((o) => o.id !== occupantId);
        const newPrimary = updatedOccupants.find((o) => o.isPrimary) || updatedOccupants[0];

        const updatedRoom: RoomItem = {
          ...room,
          occupants: updatedOccupants,
          tenantName: newPrimary ? newPrimary.name : undefined,
          tenantPhone: newPrimary ? newPrimary.phone : undefined,
          status: updatedOccupants.length > 0 ? 'occupied' : 'vacant',
        };

        setRoom(updatedRoom);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'occupied':
        return <span className="rf-badge rf-badge-active">Đang thuê</span>;
      case 'vacant':
        return <span className="rf-badge rf-badge-vacant">Còn trống</span>;
      case 'reserved':
        return <span className="rf-badge rf-badge-warning">Đã cọc giữ chỗ</span>;
      case 'maintenance':
        return <span className="rf-badge rf-badge-overdue">Đang bảo trì</span>;
      default:
        return <span className="rf-badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#00594C',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Chi tiết phòng {room.code}
              </h1>
              {getStatusBadge(room.status)}
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
              Thuộc tòa nhà:{' '}
              {property ? (
                <Link
                  to={`/properties/${property.id}`}
                  style={{ color: '#00594C', fontWeight: 600, textDecoration: 'none' }}
                >
                  {property.name} ({property.address})
                </Link>
              ) : (
                room.propertyName
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => navigate('/meter-readings')}
          >
            <Zap size={14} /> Ghi chỉ số điện nước
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => setShowAddOccupant(true)}
            disabled={isFull}
            title={isFull ? 'Phòng đã đạt sức chứa tối đa' : 'Thêm người ở vào phòng'}
          >
            <UserPlus size={14} /> Thêm người ở
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="rf-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00594C',
            }}
          >
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Giá thuê niêm yết</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {formatVND(room.price)}/tháng
            </div>
            <div style={{ fontSize: '11px', color: '#059669' }}>
              Công nợ: {(room.debt ?? 0) > 0 ? formatVND(room.debt ?? 0) : 'Không nợ'}
            </div>
          </div>
        </div>

        <div className="rf-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1D4ED8',
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Sức chứa & Người ở</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {currentOccupants.length}/{maxOcc} người
            </div>
            <div style={{ fontSize: '11px', color: isFull ? '#D97706' : '#4B5563' }}>
              {isFull ? 'Đã đủ số người tối đa' : `Còn nhận thêm ${maxOcc - currentOccupants.length} người`}
            </div>
          </div>
        </div>

        <div className="rf-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#B45309',
            }}
          >
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Đơn giá điện & nước</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
              ⚡ {(room.electricUnitPrice ?? 3800).toLocaleString('vi-VN')} đ/kWh
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0284C7' }}>
              💧 {(room.waterUnitPrice ?? 20000).toLocaleString('vi-VN')} đ/m³
            </div>
          </div>
        </div>

        <div className="rf-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#F3E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7E22CE',
            }}
          >
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Thông số phòng</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
              Tầng {room.floor} • {room.type}
            </div>
            <div style={{ fontSize: '12px', color: '#4B5563' }}>
              Diện tích: {room.area} m²
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* Left Column: Occupants List & Multi-tenant Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Occupants Card */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Danh sách người đang ở ({currentOccupants.length}/{maxOcc} người)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Quản lý đầy đủ các thành viên sinh sống, người đại diện hợp đồng và tạm trú CCCD
                </p>
              </div>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => setShowAddOccupant(true)}
                disabled={isFull}
              >
                <Plus size={14} /> Thêm thành viên
              </button>
            </div>

            {currentOccupants.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px dashed #D1D5DB',
                }}
              >
                <Users size={32} color="#9CA3AF" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', color: '#4B5563', margin: '0 0 8px 0', fontWeight: 500 }}>
                  Phòng hiện tại chưa có người ở nào
                </p>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  style={{ fontSize: '12px' }}
                  onClick={() => setShowAddOccupant(true)}
                >
                  <UserPlus size={14} /> Thêm người thuê đầu tiên
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentOccupants.map((occ, idx) => (
                  <div
                    key={occ.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: occ.isPrimary ? '#F0FDF4' : '#F9FAFB',
                      borderRadius: '8px',
                      border: `1px solid ${occ.isPrimary ? '#86EFAC' : '#E5E7EB'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: occ.isPrimary ? '#00594C' : '#E5E7EB',
                          color: occ.isPrimary ? '#FFFFFF' : '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        {occ.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>
                            {occ.name}
                          </span>
                          {occ.isPrimary && (
                            <span
                              className="rf-badge rf-badge-active"
                              style={{ fontSize: '10px', padding: '2px 6px' }}
                            >
                              <ShieldCheck size={10} /> Đại diện hợp đồng
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '12px',
                            fontSize: '12px',
                            color: '#4B5563',
                            marginTop: '2px',
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={11} color="#6B7280" /> {occ.phone}
                          </span>
                          <span>CCCD: {occ.idCard || 'Đang cập nhật'}</span>
                          {occ.joinedAt && <span>Vào ở: {occ.joinedAt}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="rf-btn rf-btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '11px', color: '#DC2626' }}
                        title="Xóa người này khỏi phòng"
                        onClick={() => handleRemoveOccupant(occ.id, occ.name)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meter Readings History */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Lịch sử chỉ số điện & nước gần nhất
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Dữ liệu công tơ điện và đồng hồ nước từng kỳ ghi nhận
                </p>
              </div>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => navigate('/meter-readings')}
              >
                Ghi số mới →
              </button>
            </div>

            {meterReadings.length === 0 ? (
              <p style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                Chưa có lịch sử chỉ số cho phòng này.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="rf-table">
                  <thead>
                    <tr>
                      <th>Kỳ chốt</th>
                      <th>Điện (Cũ → Mới)</th>
                      <th>Tiêu thụ điện</th>
                      <th>Nước (Cũ → Mới)</th>
                      <th>Tiêu thụ nước</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meterReadings.map((m) => {
                      const electricUsage = m.currElectric - m.prevElectric;
                      const waterUsage = m.currWater - m.prevWater;
                      return (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600 }}>{m.updatedAt}</td>
                          <td>
                            {m.prevElectric} → {m.currElectric} kWh
                          </td>
                          <td style={{ fontWeight: 600, color: '#D97706' }}>
                            {electricUsage} kWh ({formatVND(electricUsage * m.electricUnitPrice)})
                          </td>
                          <td>
                            {m.prevWater} → {m.currWater} m³
                          </td>
                          <td style={{ fontWeight: 600, color: '#0284C7' }}>
                            {waterUsage} m³ ({formatVND(waterUsage * m.waterUnitPrice)})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contract & Invoices Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Contract Summary */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Hợp đồng thuê hiện tại
              </h3>
              {contract && (
                <Link
                  to={`/contracts/${contract.id}`}
                  style={{
                    fontSize: '12px',
                    color: '#00594C',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Xem chi tiết HĐ <ExternalLink size={12} />
                </Link>
              )}
            </div>

            {contract ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Mã hợp đồng:</span>
                  <strong style={{ color: '#00594C' }}>{contract.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Người đại diện thuê:</span>
                  <span style={{ fontWeight: 600 }}>{contract.tenantName} ({contract.tenantPhone})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Thời hạn thuê:</span>
                  <span>{contract.startDate} → {contract.endDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Tiền cọc giữ chỗ:</span>
                  <strong style={{ color: '#137333' }}>{formatVND(contract.depositAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Kỳ hạn thanh toán:</span>
                  <span>{contract.paymentCycle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ color: '#6B7280' }}>Trạng thái:</span>
                  <span className="rf-badge rf-badge-active">{contract.status.toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 10px 0' }}>
                  Chưa có hợp đồng nào liên kết với phòng này.
                </p>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  style={{ fontSize: '12px' }}
                  onClick={() => navigate('/contracts')}
                >
                  Tạo hợp đồng mới
                </button>
              </div>
            )}
          </div>

          {/* Invoices History */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Hóa đơn tiền phòng ({invoices.length})
              </h3>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ fontSize: '12px', padding: '4px 8px' }}
                onClick={() => navigate('/invoices')}
              >
                Tất cả hóa đơn →
              </button>
            </div>

            {invoices.length === 0 ? (
              <p style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                Chưa có hóa đơn nào phát sinh.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#00594C' }}>
                        {inv.code} • {inv.period}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        Hạn thanh toán: {inv.dueDate}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>
                        {formatVND(inv.totalAmount)}
                      </div>
                      <span
                        className={`rf-badge ${
                          inv.status === 'paid'
                            ? 'rf-badge-active'
                            : inv.status === 'overdue'
                            ? 'rf-badge-overdue'
                            : 'rf-badge-warning'
                        }`}
                        style={{ fontSize: '10px', padding: '1px 6px' }}
                      >
                        {inv.status === 'paid' ? 'Đã thu' : inv.status === 'overdue' ? 'Quá hạn' : 'Chờ thu'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Occupant Modal */}
      {showAddOccupant && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            className="rf-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Thêm người ở vào phòng {room.code}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddOccupant(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOccupant} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Họ và tên người ở *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newOccupantName}
                  onChange={(e) => setNewOccupantName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0912345678"
                  value={newOccupantPhone}
                  onChange={(e) => setNewOccupantPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Số CCCD / CMND (Tạm trú)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 079201004123"
                  value={newOccupantIdCard}
                  onChange={(e) => setNewOccupantIdCard(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="isPrimaryCheck"
                  checked={isPrimaryNew}
                  onChange={(e) => setIsPrimaryNew(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="isPrimaryCheck" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                  Đặt người này làm người đại diện hợp đồng chính
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  onClick={() => setShowAddOccupant(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="rf-btn rf-btn-primary">
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
