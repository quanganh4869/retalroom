import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit3, DollarSign, Users, UserPlus, Trash2, Building2 } from 'lucide-react';
import { mockRooms, mockProperties, formatVND, RoomItem, RoomOccupant } from '@/lib/mockData';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const RoomsPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  const initialProperty = searchParams.get('propertyId') || 'all';

  const [rooms, setRooms] = useState<RoomItem[]>(mockRooms);
  const [filterProperty, setFilterProperty] = useState<string>(initialProperty);
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus);
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [searchCode, setSearchCode] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(mockRooms[0] ?? null);

  // Modal: Edit Single Room Price & Utilities
  const [showEditSingleModal, setShowEditSingleModal] = useState<boolean>(false);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editElectricRate, setEditElectricRate] = useState<number>(3800);
  const [editWaterRate, setEditWaterRate] = useState<number>(20000);
  const [editMaxOccupants, setEditMaxOccupants] = useState<number>(2);

  // Modal: Add Occupant to Room
  const [showAddOccupantModal, setShowAddOccupantModal] = useState<boolean>(false);
  const [newOccupantName, setNewOccupantName] = useState<string>('');
  const [newOccupantPhone, setNewOccupantPhone] = useState<string>('');
  const [newOccupantIdCard, setNewOccupantIdCard] = useState<string>('');
  const [newOccupantIsPrimary, setNewOccupantIsPrimary] = useState<boolean>(false);

  // Modal: Bulk Update All Rooms Price & Utilities
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkMode, setBulkMode] = useState<'adjust' | 'setFixed'>('adjust');
  const [bulkPriceAdjustment, setBulkPriceAdjustment] = useState<number>(200000);
  const [bulkFixedPrice, setBulkFixedPrice] = useState<number>(4000000);
  const [bulkElectricRate, setBulkElectricRate] = useState<number>(3800);
  const [bulkWaterRate, setBulkWaterRate] = useState<number>(20000);
  const [updateUtilityRates, setUpdateUtilityRates] = useState<boolean>(true);

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setFilterStatus(statusFromUrl);
    }
    const propFromUrl = searchParams.get('propertyId');
    if (propFromUrl) {
      setFilterProperty(propFromUrl);
    }
  }, [searchParams]);

  // Sync selectedRoom with updated rooms state
  useEffect(() => {
    if (selectedRoom) {
      const updated = rooms.find((r) => r.id === selectedRoom.id);
      if (updated) setSelectedRoom(updated);
    }
  }, [rooms]);

  const handleStatusChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    if (newStatus === 'all') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), status: newStatus });
    }
  };

  const handlePropertyChange = (propId: string) => {
    setFilterProperty(propId);
    if (propId === 'all') {
      searchParams.delete('propertyId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), propertyId: propId });
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchProperty = filterProperty === 'all' || room.propertyId === filterProperty;
    const matchStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchFloor = filterFloor === 'all' || room.floor.toString() === filterFloor;
    const matchCode =
      room.code.toLowerCase().includes(searchCode.toLowerCase()) ||
      Boolean(room.tenantName && room.tenantName.toLowerCase().includes(searchCode.toLowerCase())) ||
      Boolean(
        room.occupants &&
          room.occupants.some(
            (o) =>
              o.name.toLowerCase().includes(searchCode.toLowerCase()) ||
              o.phone.includes(searchCode)
          )
      );
    return matchProperty && matchStatus && matchFloor && matchCode;
  });

  const getStatusBadge = (status: RoomItem['status']) => {
    switch (status) {
      case 'occupied':
        return <span className="rf-badge rf-badge-active">Đang thuê</span>;
      case 'vacant':
        return <span className="rf-badge rf-badge-vacant">Phòng trống</span>;
      case 'reserved':
        return <span className="rf-badge rf-badge-warning">Đã giữ cọc</span>;
      case 'maintenance':
        return <span className="rf-badge rf-badge-neutral">Bảo trì</span>;
    }
  };

  // Open single room edit modal
  const openEditSingle = (room: RoomItem) => {
    setSelectedRoom(room);
    setEditPrice(room.price);
    setEditElectricRate(room.electricUnitPrice ?? 3800);
    setEditWaterRate(room.waterUnitPrice ?? 20000);
    setEditMaxOccupants(room.maxOccupants ?? 2);
    setShowEditSingleModal(true);
  };

  // Submit single room edit
  const handleSaveSingleRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? {
              ...r,
              price: editPrice,
              electricUnitPrice: editElectricRate,
              waterUnitPrice: editWaterRate,
              maxOccupants: editMaxOccupants,
            }
          : r
      )
    );

    setShowEditSingleModal(false);
    toast.success(
      `Đã cập nhật phòng ${selectedRoom.code}!`,
      `Giá thuê: ${formatVND(editPrice)} • Tối đa ${editMaxOccupants} người ở.`
    );
  };

  // Add a new occupant to the current room
  const handleAddOccupant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const currentOccupants = selectedRoom.occupants || [];
    const max = selectedRoom.maxOccupants || 2;
    if (currentOccupants.length >= max) {
      toast.error('Phòng đã đủ số người ở!', `Phòng này quy định tối đa ${max} người ở.`);
      return;
    }

    const newOccupant: RoomOccupant = {
      id: `oc-${Date.now()}`,
      name: newOccupantName.trim(),
      phone: newOccupantPhone.trim(),
      idCard: newOccupantIdCard.trim(),
      isPrimary: newOccupantIsPrimary || currentOccupants.length === 0,
      joinedAt: new Date().toLocaleDateString('vi-VN'),
    };

    const updatedOccupants = [...currentOccupants, newOccupant];
    const primaryTenant = updatedOccupants.find((o) => o.isPrimary) || updatedOccupants[0];

    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? {
              ...r,
              status: 'occupied',
              tenantName: primaryTenant?.name || newOccupant.name,
              tenantPhone: primaryTenant?.phone || newOccupant.phone,
              occupants: updatedOccupants,
            }
          : r
      )
    );

    // Reset form
    setNewOccupantName('');
    setNewOccupantPhone('');
    setNewOccupantIdCard('');
    setNewOccupantIsPrimary(false);
    setShowAddOccupantModal(false);

    toast.success(
      `Đã thêm người ở vào phòng ${selectedRoom.code}!`,
      `${newOccupant.name} đã được thêm vào danh sách cư dân (Hiện có ${updatedOccupants.length}/${max} người).`
    );
  };

  // Remove an occupant from room
  const handleRemoveOccupant = (occupantId: string) => {
    if (!selectedRoom) return;
    const currentOccupants = selectedRoom.occupants || [];
    const filtered = currentOccupants.filter((o) => o.id !== occupantId);
    const newPrimary = filtered.find((o) => o.isPrimary) || filtered[0];

    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? {
              ...r,
              status: filtered.length === 0 ? 'vacant' : r.status,
              tenantName: newPrimary ? newPrimary.name : undefined,
              tenantPhone: newPrimary ? newPrimary.phone : undefined,
              occupants: filtered,
            }
          : r
      )
    );

    toast.info('Đã xóa người ở', `Phòng ${selectedRoom.code} hiện còn ${filtered.length} người.`);
  };

  // Submit bulk update for all rooms
  const handleSaveBulk = (e: React.FormEvent) => {
    e.preventDefault();

    setRooms((prev) =>
      prev.map((r) => {
        // If property filter is selected and not 'all', only update that property
        if (filterProperty !== 'all' && r.propertyId !== filterProperty) {
          return r;
        }

        let newPrice = r.price;
        if (bulkMode === 'adjust') {
          newPrice = Math.max(0, r.price + bulkPriceAdjustment);
        } else {
          newPrice = bulkFixedPrice;
        }

        return {
          ...r,
          price: newPrice,
          ...(updateUtilityRates
            ? {
                electricUnitPrice: bulkElectricRate,
                waterUnitPrice: bulkWaterRate,
              }
            : {}),
        };
      })
    );

    setShowBulkModal(false);
    toast.success(
      'Đã cập nhật giá cho các phòng!',
      bulkMode === 'adjust'
        ? `Đã điều chỉnh ${bulkPriceAdjustment >= 0 ? '+' : ''}${formatVND(bulkPriceAdjustment)}.`
        : `Đã áp dụng mức giá ${formatVND(bulkFixedPrice)}.`
    );
  };

  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const vacantCount = rooms.filter((r) => r.status === 'vacant').length;
  const reservedCount = rooms.filter((r) => r.status === 'reserved').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'maintenance').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý phòng & Cư dân
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            {filterProperty === 'all'
              ? `Tất cả cơ sở (${mockProperties.length} dãy trọ/tòa nhà) • ${rooms.length} phòng • ${occupiedCount} đang thuê • ${vacantCount} phòng trống • ${reservedCount} giữ cọc • ${maintenanceCount} sửa chữa`
              : `${mockProperties.find((p) => p.id === filterProperty)?.name} • ${filteredRooms.length} phòng • ${occupiedCount} đang thuê • ${vacantCount} phòng trống • ${reservedCount} giữ cọc`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => setShowBulkModal(true)}
            style={{ fontWeight: 600 }}
          >
            <DollarSign size={15} color="#00594C" />
            <span>Chỉnh giá tất cả phòng</span>
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => toast.info('Đang tải danh sách...', 'File phòng đã được lưu về máy.')}
          >
            <span>Nhập danh sách Excel</span>
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() =>
              navigate(
                filterProperty !== 'all'
                  ? `/rooms/new?propertyId=${filterProperty}`
                  : '/rooms/new'
              )
            }
          >
            <Plus size={15} />
            <span>Thêm phòng mới</span>
          </button>
        </div>
      </div>

      {/* Filter and View Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Left Column: Filter Bar & Room Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Property / Dãy trọ Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={15} color="#00594C" />
                <select
                  value={filterProperty}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #00594C',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#00594C',
                    backgroundColor: '#F0FDF4',
                  }}
                >
                  <option value="all">🏢 Tất cả các dãy trọ / tòa nhà ({mockProperties.length})</option>
                  {mockProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.totalRooms} phòng)
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="text"
                  placeholder="Tìm phòng, tên người ở..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  style={{
                    padding: '6px 12px 6px 32px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px',
                    width: '180px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="occupied">Đang thuê</option>
                <option value="vacant">Phòng trống</option>
                <option value="reserved">Đã giữ cọc</option>
                <option value="maintenance">Bảo trì</option>
              </select>

              {/* Floor Filter */}
              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="all">Tất cả các tầng</option>
                <option value="1">Tầng 1</option>
                <option value="2">Tầng 2</option>
                <option value="3">Tầng 3</option>
              </select>
            </div>

            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Hiển thị <span style={{ fontWeight: 600, color: '#111827' }}>{filteredRooms.length}</span> phòng
            </div>
          </div>

          {/* Table */}
          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Số phòng</th>
                  <th>Dãy trọ / Tòa nhà</th>
                  <th>Giá thuê</th>
                  <th>Điện / Nước</th>
                  <th>Số người ở</th>
                  <th>Đại diện thuê</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => {
                  const occupantsCount = room.occupants?.length || (room.tenantName ? 1 : 0);
                  const maxOcc = room.maxOccupants || 2;
                  const isFull = occupantsCount >= maxOcc;

                  return (
                    <tr
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedRoom?.id === room.id ? '#F0FDF4' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: '#00594C', fontSize: '14px' }}>{room.code}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>Tầng {room.floor} • {room.area}m² • {room.type}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                          {room.propertyName}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{formatVND(room.price)}</span>
                      </td>
                      <td style={{ fontSize: '11px', color: '#4B5563' }}>
                        <div>⚡ {(room.electricUnitPrice ?? 3800).toLocaleString('vi-VN')} đ</div>
                        <div>💧 {(room.waterUnitPrice ?? 20000).toLocaleString('vi-VN')} đ</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span
                            className={`rf-badge ${
                              occupantsCount === 0
                                ? 'rf-badge-vacant'
                                : isFull
                                ? 'rf-badge-warning'
                                : 'rf-badge-active'
                            }`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
                          >
                            <Users size={12} />
                            {occupantsCount}/{maxOcc} người
                          </span>
                        </div>
                      </td>
                      <td>
                        {room.tenantName ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{room.tenantName}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>
                              {room.tenantPhone} {occupantsCount > 1 && `(+${occupantsCount - 1} người khác)`}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Chưa có khách</span>
                        )}
                      </td>
                      <td>{getStatusBadge(room.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            className="rf-btn rf-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            title="Chỉnh giá phòng này"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditSingle(room);
                            }}
                          >
                            <Edit3 size={12} color="#00594C" />
                            Sửa giá
                          </button>
                          <button
                            type="button"
                            className="rf-btn rf-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/rooms/${room.id}`);
                            }}
                          >
                            <Eye size={12} />
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Sơ đồ phòng & Chi tiết phòng được chọn */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sơ đồ tầng (Floor Matrix) */}
          <div className="rf-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Sơ đồ phòng theo tầng
              </h3>
              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
                {filterProperty === 'all' ? 'Tất cả dãy' : mockProperties.find((p) => p.id === filterProperty)?.name}
              </span>
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', color: '#6B7280', marginBottom: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#E6F4EA', border: '1px solid #137333' }} /> Đang thuê
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#E8F0FE', border: '1px solid #1A73E8' }} /> Phòng trống
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#FEF7E0', border: '1px solid #B06000' }} /> Giữ cọc
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#F1F3F4', border: '1px solid #5F6368' }} /> Bảo trì
              </span>
            </div>

            {/* Floors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[3, 2, 1].map((floor) => {
                const floorRooms = filteredRooms.filter((r) => r.floor === floor);
                if (floorRooms.length === 0) return null;
                return (
                  <div key={floor}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' }}>
                      TẦNG {floor} ({floorRooms.length} phòng)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {floorRooms.map((r) => {
                        let bg = '#E6F4EA';
                        let border = '#137333';
                        let text = '#137333';
                        if (r.status === 'vacant') {
                          bg = '#E8F0FE';
                          border = '#1A73E8';
                          text = '#1A73E8';
                        } else if (r.status === 'reserved') {
                          bg = '#FEF7E0';
                          border = '#B06000';
                          text = '#B06000';
                        } else if (r.status === 'maintenance') {
                          bg = '#F1F3F4';
                          border = '#5F6368';
                          text = '#5F6368';
                        }

                        const isSelected = selectedRoom?.id === r.id;
                        const occCount = r.occupants?.length || (r.tenantName ? 1 : 0);

                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedRoom(r)}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              backgroundColor: bg,
                              border: isSelected ? '2px solid #00594C' : `1px solid ${border}`,
                              cursor: 'pointer',
                              textAlign: 'center',
                              boxShadow: isSelected ? '0 0 0 1px #00594C' : 'none',
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '13px', color: text }}>{r.code}</div>
                            <div style={{ fontSize: '10px', color: text, opacity: 0.9 }}>
                              {occCount > 0 ? `👥 ${occCount}/${r.maxOccupants || 2}` : r.type}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Details Card: Multiple Occupants & Multi-Property */}
          {selectedRoom && (
            <div className="rf-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#00594C', margin: 0 }}>
                    Phòng {selectedRoom.code}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                    <Building2 size={12} /> {selectedRoom.propertyName}
                  </span>
                </div>
                {getStatusBadge(selectedRoom.status)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6B7280' }}>Giá thuê niêm yết:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#00594C' }}>{formatVND(selectedRoom.price)}</span>
                    <button
                      type="button"
                      className="rf-btn rf-btn-secondary"
                      style={{ padding: '2px 6px', fontSize: '10px', height: 'auto' }}
                      onClick={() => openEditSingle(selectedRoom)}
                    >
                      <Edit3 size={10} />
                      Đổi giá
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Đơn giá điện / nước:</span>
                  <span style={{ fontWeight: 500 }}>
                    ⚡ {(selectedRoom.electricUnitPrice ?? 3800).toLocaleString('vi-VN')} đ • 💧 {(selectedRoom.waterUnitPrice ?? 20000).toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Diện tích & Tầng:</span>
                  <span>{selectedRoom.area} m² (Tầng {selectedRoom.floor})</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6B7280' }}>Sức chứa tối đa:</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {selectedRoom.maxOccupants ?? 2} người
                  </span>
                </div>

                {/* Danh sách người ở trong phòng (Multi-occupants) */}
                <div style={{ marginTop: '6px', borderTop: '1px dashed #E5E7EB', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} color="#00594C" />
                      Danh sách người ở ({selectedRoom.occupants?.length || (selectedRoom.tenantName ? 1 : 0)}/{selectedRoom.maxOccupants || 2})
                    </span>
                    <button
                      type="button"
                      className="rf-btn rf-btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '11px', height: 'auto', color: '#00594C' }}
                      onClick={() => setShowAddOccupantModal(true)}
                    >
                      <UserPlus size={11} />
                      + Thêm người ở
                    </button>
                  </div>

                  {selectedRoom.occupants && selectedRoom.occupants.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedRoom.occupants.map((occ, idx) => (
                        <div
                          key={occ.id}
                          style={{
                            padding: '8px',
                            backgroundColor: occ.isPrimary ? '#F0FDF4' : '#F9FAFB',
                            borderRadius: '6px',
                            border: occ.isPrimary ? '1px solid #BBF7D0' : '1px solid #E5E7EB',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>{idx + 1}. {occ.name}</span>
                              {occ.isPrimary && (
                                <span style={{ fontSize: '9px', backgroundColor: '#00594C', color: '#FFFFFF', padding: '1px 4px', borderRadius: '3px' }}>
                                  Đại diện HĐ
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                              📞 {occ.phone} • CCCD: {occ.idCard}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveOccupant(occ.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: '#9CA3AF',
                              padding: '4px',
                            }}
                            title="Xóa người này khỏi phòng"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : selectedRoom.tenantName ? (
                    <div
                      style={{
                        padding: '8px',
                        backgroundColor: '#F0FDF4',
                        borderRadius: '6px',
                        border: '1px solid #BBF7D0',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#111827' }}>
                        1. {selectedRoom.tenantName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                        📞 {selectedRoom.tenantPhone}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '11px', padding: '6px 0' }}>
                      Phòng hiện đang trống, chưa có người đăng ký ở.
                    </div>
                  )}
                </div>

                {selectedRoom.leaseEnd && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: '#6B7280' }}>Hạn hợp đồng:</span>
                    <span>{selectedRoom.leaseEnd}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ flex: 1, fontSize: '12px' }}
                  onClick={() => openEditSingle(selectedRoom)}
                >
                  <Edit3 size={13} />
                  <span>Sửa giá phòng & dịch vụ</span>
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  style={{ flex: 1, fontSize: '12px' }}
                  onClick={() => navigate(`/rooms/${selectedRoom.id}`)}
                >
                  <Eye size={13} />
                  Chi tiết phòng đầy đủ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Chỉnh sửa giá từng phòng */}
      <Modal
        isOpen={showEditSingleModal}
        onClose={() => setShowEditSingleModal(false)}
        title={selectedRoom ? `Chỉnh sửa giá phòng ${selectedRoom.code}` : 'Chỉnh sửa giá phòng'}
        description="Điều chỉnh giá thuê hàng tháng và đơn giá điện nước riêng biệt cho phòng này."
      >
        <form onSubmit={handleSaveSingleRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              💵 Giá thuê phòng (VNĐ / tháng)
            </label>
            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(Number(e.target.value))}
              min={0}
              step={50000}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
              }}
              required
            />
            <span style={{ fontSize: '12px', color: '#00594C', fontWeight: 600, marginTop: '4px', display: 'block' }}>
              Thành tiền: {formatVND(editPrice)}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                ⚡ Giá điện (VNĐ / kWh)
              </label>
              <input
                type="number"
                value={editElectricRate}
                onChange={(e) => setEditElectricRate(Number(e.target.value))}
                min={0}
                step={100}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                💧 Giá nước (VNĐ / m³)
              </label>
              <input
                type="number"
                value={editWaterRate}
                onChange={(e) => setEditWaterRate(Number(e.target.value))}
                min={0}
                step={500}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              👥 Sức chứa tối đa của phòng (người)
            </label>
            <input
              type="number"
              value={editMaxOccupants}
              onChange={(e) => setEditMaxOccupants(Number(e.target.value))}
              min={1}
              max={10}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
              }}
              required
            />
            <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
              Quy định số người ở tối đa được phép đăng ký tạm trú trong phòng này.
            </span>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: '#F9FAFB',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '12px',
              color: '#4B5563',
            }}
          >
            ℹ️ Mức giá và sức chứa này sẽ được áp dụng cho kỳ thanh toán tiếp theo và quản lý cư dân của phòng {selectedRoom?.code}.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowEditSingleModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Cập nhật giá hàng loạt tất cả các phòng */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Điều chỉnh giá cho TẤT CẢ các phòng"
        description="Áp dụng thay đổi giá thuê hoặc giá điện nước đồng loạt cho toàn bộ 24 phòng trong cơ sở."
      >
        <form onSubmit={handleSaveBulk} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Phương thức cập nhật giá phòng:
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: bulkMode === 'adjust' ? '2px solid #00594C' : '1px solid #D1D5DB',
                  backgroundColor: bulkMode === 'adjust' ? '#F0FDF4' : '#FFFFFF',
                  flex: 1,
                }}
              >
                <input
                  type="radio"
                  name="bulkMode"
                  checked={bulkMode === 'adjust'}
                  onChange={() => setBulkMode('adjust')}
                />
                <span>Tăng / giảm theo số tiền (+/-)</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: bulkMode === 'setFixed' ? '2px solid #00594C' : '1px solid #D1D5DB',
                  backgroundColor: bulkMode === 'setFixed' ? '#F0FDF4' : '#FFFFFF',
                  flex: 1,
                }}
              >
                <input
                  type="radio"
                  name="bulkMode"
                  checked={bulkMode === 'setFixed'}
                  onChange={() => setBulkMode('setFixed')}
                />
                <span>Đặt một mức giá đồng giá</span>
              </label>
            </div>
          </div>

          {bulkMode === 'adjust' ? (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Số tiền điều chỉnh (VNĐ) (nhập số âm nếu giảm, ví dụ: -100000)
              </label>
              <input
                type="number"
                value={bulkPriceAdjustment}
                onChange={(e) => setBulkPriceAdjustment(Number(e.target.value))}
                step={50000}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111827',
                }}
                required
              />
              <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                Ví dụ: +200.000 đ sẽ tăng mỗi phòng thêm 200.000 đ so với giá hiện tại.
              </span>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Mức giá cố định mới (VNĐ / tháng) cho tất cả phòng
              </label>
              <input
                type="number"
                value={bulkFixedPrice}
                onChange={(e) => setBulkFixedPrice(Number(e.target.value))}
                min={0}
                step={50000}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111827',
                }}
                required
              />
              <span style={{ fontSize: '12px', color: '#00594C', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                Tất cả phòng sẽ có giá: {formatVND(bulkFixedPrice)}
              </span>
            </div>
          )}

          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={updateUtilityRates}
                onChange={(e) => setUpdateUtilityRates(e.target.checked)}
              />
              <span>Cập nhật đồng thời đơn giá Điện & Nước cho tất cả phòng</span>
            </label>

            {updateUtilityRates && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingLeft: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                    ⚡ Đơn giá điện (VNĐ/kWh)
                  </label>
                  <input
                    type="number"
                    value={bulkElectricRate}
                    onChange={(e) => setBulkElectricRate(Number(e.target.value))}
                    min={0}
                    step={100}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                    required={updateUtilityRates}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                    💧 Đơn giá nước (VNĐ/m³)
                  </label>
                  <input
                    type="number"
                    value={bulkWaterRate}
                    onChange={(e) => setBulkWaterRate(Number(e.target.value))}
                    min={0}
                    step={500}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                    required={updateUtilityRates}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: '#FEF3C7',
              borderRadius: '6px',
              border: '1px solid #FDE68A',
              fontSize: '12px',
              color: '#92400E',
            }}
          >
            ⚠️ Lưu ý: Thao tác này sẽ áp dụng lên toàn bộ <strong>{rooms.length} phòng</strong>. Hãy kiểm tra kỹ trước khi xác nhận.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowBulkModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Xác nhận cập nhật hàng loạt
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Thêm người ở vào phòng (Multi-occupants support) */}
      <Modal
        isOpen={showAddOccupantModal}
        onClose={() => setShowAddOccupantModal(false)}
        title={selectedRoom ? `Thêm người ở vào phòng ${selectedRoom.code}` : 'Thêm người ở'}
        description={`Đăng ký cư dân cùng phòng (Sức chứa: ${selectedRoom?.occupants?.length || 0}/${selectedRoom?.maxOccupants || 2} người)`}
      >
        <form onSubmit={handleAddOccupant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Họ và tên người ở mới *
            </label>
            <input
              type="text"
              placeholder="VD: Trần Văn Bình"
              value={newOccupantName}
              onChange={(e) => setNewOccupantName(e.target.value)}
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
                value={newOccupantPhone}
                onChange={(e) => setNewOccupantPhone(e.target.value)}
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
                Số CCCD / CMND *
              </label>
              <input
                type="text"
                placeholder="12 chữ số CCCD"
                value={newOccupantIdCard}
                onChange={(e) => setNewOccupantIdCard(e.target.value)}
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={newOccupantIsPrimary}
                onChange={(e) => setNewOccupantIsPrimary(e.target.checked)}
              />
              <span>Đặt người này làm người đại diện đứng tên hợp đồng phòng</span>
            </label>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: '#F0FDF4',
              borderRadius: '6px',
              border: '1px solid #BBF7D0',
              fontSize: '12px',
              color: '#166534',
              lineHeight: 1.5,
            }}
          >
            📋 Thông tin thành viên sẽ được lưu vào hồ sơ cư dân phòng <strong>{selectedRoom?.code}</strong> thuộc <strong>{selectedRoom?.propertyName}</strong> để phục vụ khai báo tạm trú và phát hành hóa đơn.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowAddOccupantModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Lưu cư dân
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
