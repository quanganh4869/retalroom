import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  DollarSign,
  Users,
  Building2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { mockRooms, mockProperties, formatVND, RoomItem } from '@/lib/mockData';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const RoomsPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  const initialProperty = searchParams.get('propertyId') || 'all';

  const [rooms, setRooms] = useState<RoomItem[]>(mockRooms);
  const [viewMode, setViewMode] = useState<'table' | 'floor'>('table');
  const [filterProperty, setFilterProperty] = useState<string>(initialProperty);
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus);
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [searchCode, setSearchCode] = useState<string>('');

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

  // Submit bulk update for all rooms
  const handleSaveBulk = (e: React.FormEvent) => {
    e.preventDefault();

    setRooms((prev) =>
      prev.map((r) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
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

      {/* Filter and View Mode Switcher */}
      <div
        className="rf-card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
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
                cursor: 'pointer',
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
              cursor: 'pointer',
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
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả các tầng</option>
            <option value="1">Tầng 1</option>
            <option value="2">Tầng 2</option>
            <option value="3">Tầng 3</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            Hiển thị <span style={{ fontWeight: 600, color: '#111827' }}>{filteredRooms.length}</span> phòng
          </div>

          {/* View Mode Toggle: Table vs Floor Grid */}
          <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '6px', padding: '2px', border: '1px solid #E5E7EB' }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '5px',
                border: 'none',
                fontSize: '12px',
                fontWeight: viewMode === 'table' ? 600 : 500,
                backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#00594C' : '#6B7280',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <List size={14} />
              <span>Danh sách bảng</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('floor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '5px',
                border: 'none',
                fontSize: '12px',
                fontWeight: viewMode === 'floor' ? 600 : 500,
                backgroundColor: viewMode === 'floor' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'floor' ? '#00594C' : '#6B7280',
                cursor: 'pointer',
                boxShadow: viewMode === 'floor' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <LayoutGrid size={14} />
              <span>Sơ đồ phòng theo tầng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        /* Full Width Table View */
        <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="rf-table">
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Dãy trọ / Tòa nhà</th>
                <th>Giá thuê niêm yết</th>
                <th>Điện / Nước</th>
                <th>Số người ở</th>
                <th>Đại diện thuê</th>
                <th>Trạng thái</th>
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
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    title={`Bấm để xem chi tiết phòng ${room.code}`}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: '#00594C', fontSize: '14px' }}>
                        {room.code} →
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        Tầng {room.floor} • {room.area}m² • {room.type}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        {room.propertyName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#111827' }}>
                        {formatVND(room.price)}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: '#4B5563' }}>
                      <div>⚡ {(room.electricUnitPrice ?? 3800).toLocaleString('vi-VN')} đ/kWh</div>
                      <div>💧 {(room.waterUnitPrice ?? 20000).toLocaleString('vi-VN')} đ/m³</div>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: 600, color: '#111827' }}>
                            {room.tenantName}
                            {room.tenantPhone && (
                              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 400, marginLeft: '6px' }}>
                                ({room.tenantPhone})
                              </span>
                            )}
                          </div>
                          {room.occupants && room.occupants.length > 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px', borderLeft: '2px solid #E5E7EB' }}>
                              {room.occupants
                                .filter((occ) => occ.name !== room.tenantName)
                                .map((occ, idx) => (
                                  <div key={occ.id || idx} style={{ fontSize: '11px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ color: '#9CA3AF' }}>•</span>
                                    <span style={{ fontWeight: 500 }}>{occ.name}</span>
                                    {occ.phone && <span style={{ color: '#6B7280' }}>({occ.phone})</span>}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Chưa có khách</span>
                      )}
                    </td>
                    <td>{getStatusBadge(room.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Full Width Visual Floor Matrix View */
        <div className="rf-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Sơ đồ phòng theo tầng — {filterProperty === 'all' ? 'Tất cả dãy trọ' : mockProperties.find((p) => p.id === filterProperty)?.name}
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                Bấm vào từng ô phòng để mở trang chi tiết quản lý của phòng đó.
              </p>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#4B5563' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#E6F4EA', border: '1px solid #137333' }} /> Đang thuê ({occupiedCount})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#E8F0FE', border: '1px solid #1A73E8' }} /> Phòng trống ({vacantCount})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FEF7E0', border: '1px solid #B06000' }} /> Giữ cọc ({reservedCount})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#F1F3F4', border: '1px solid #5F6368' }} /> Bảo trì ({maintenanceCount})
              </span>
            </div>
          </div>

          {/* Floors list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[3, 2, 1].map((floor) => {
              const floorRooms = filteredRooms.filter((r) => r.floor === floor);
              if (floorRooms.length === 0) return null;

              return (
                <div key={floor} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', backgroundColor: '#F9FAFB' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>TẦNG {floor}</span>
                    <span style={{ color: '#6B7280', fontWeight: 500 }}>{floorRooms.length} phòng</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
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

                      const occCount = r.occupants?.length || (r.tenantName ? 1 : 0);

                      return (
                        <div
                          key={r.id}
                          onClick={() => navigate(`/rooms/${r.id}`)}
                          style={{
                            padding: '14px',
                            borderRadius: '8px',
                            backgroundColor: bg,
                            border: `1px solid ${border}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          title={`Bấm để mở chi tiết phòng ${r.code}`}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '15px', color: text }}>
                              {r.code} →
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: text }}>
                              {r.status === 'occupied' ? 'Đang thuê' : r.status === 'vacant' ? 'Trống' : r.status === 'reserved' ? 'Giữ cọc' : 'Bảo trì'}
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                            {formatVND(r.price)}
                          </div>

                          <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '4px' }}>
                            {r.tenantName ? (
                              <div>
                                <div style={{ fontWeight: 600 }}>👤 {r.tenantName}</div>
                                {r.occupants && r.occupants.length > 1 && (
                                  <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px', lineHeight: 1.3 }}>
                                    Cùng ở: {r.occupants.filter((o) => o.name !== r.tenantName).map((o) => o.name).join(', ')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              'Chưa có người ở'
                            )}
                          </div>

                          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
                            👥 {occCount}/{r.maxOccupants || 2} người • {r.area}m²
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
      )}

      {/* Modal: Cập nhật giá hàng loạt tất cả các phòng */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Điều chỉnh giá cho TẤT CẢ các phòng"
        description="Áp dụng thay đổi giá thuê hoặc giá điện nước đồng loạt cho toàn bộ phòng trong cơ sở."
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
    </div>
  );
};
