import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  TrendingUp,
  User,
  Users,
  Plus,
  Zap,
  FileText,
  MessageSquare,
  Receipt,
  LayoutGrid,
  List,
} from 'lucide-react';
import { mockProperties, mockRooms, formatVND, RoomItem } from '@/lib/mockData';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find property by id or fallback to first
  const property = mockProperties.find((p) => p.id === id) || mockProperties[0];
  const propertyRooms = mockRooms.filter((r) => r.propertyId === property?.id);

  // Filter & View Mode State
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'vacant' | 'maintenance'>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');

  if (!property) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2>Không tìm thấy dãy trọ</h2>
        <button className="rf-btn rf-btn-primary" onClick={() => navigate('/properties')}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const totalOccupants = propertyRooms.reduce(
    (sum, r) => sum + (r.occupants?.length || (r.tenantName ? 1 : 0)),
    0
  );
  const totalCapacity = propertyRooms.reduce((sum, r) => sum + (r.maxOccupants || 2), 0);
  const occupancyRate = property.totalRooms
    ? Math.round((property.rentedRooms / property.totalRooms) * 100)
    : 80;

  // Filtered rooms
  const filteredRooms = propertyRooms.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (floorFilter !== 'all' && r.floor !== floorFilter) return false;
    return true;
  });

  // Extract unique floors
  const floors = Array.from(new Set(propertyRooms.map((r) => r.floor))).sort((a, b) => a - b);

  // Quick Action Handler to navigate directly to dedicated room page
  const handleOpenRoomAction = (room: RoomItem, tab?: 'meter' | 'contract' | 'message' | 'invoice' | 'occupants') => {
    if (tab) {
      navigate(`/rooms/${room.id}?tab=${tab}`);
    } else {
      navigate(`/rooms/${room.id}`);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Navigation & Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {property.name}
              </h1>
              <span className="rf-badge rf-badge-active" style={{ fontSize: '11px' }}>
                Đang vận hành
              </span>
            </div>
            <p style={{ color: '#6B7280', fontSize: '13px', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={13} color="#00594C" />
              {property.address}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => {
              const firstOccupied = propertyRooms.find((r) => r.status === 'occupied') || propertyRooms[0];
              if (firstOccupied) handleOpenRoomAction(firstOccupied, 'meter');
            }}
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Zap size={14} color="#D97706" />
            <span>Ghi điện nước nhanh</span>
          </button>
          <Link
            to={`/rooms/new?propertyId=${property.id}`}
            className="rf-btn rf-btn-primary"
            style={{ fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Plus size={14} />
            <span>Thêm phòng mới</span>
          </Link>
        </div>
      </div>

      {/* Metrics Highlights Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Tổng số phòng & Lấp đầy</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {property.rentedRooms} / {property.totalRooms} phòng
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#137333', marginTop: '4px' }}>
            <TrendingUp size={13} />
            <span>Tỷ lệ lấp đầy: {occupancyRate}%</span>
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Tổng cư dân hiện có</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            {totalOccupants} người
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            Sức chứa tối đa: {totalCapacity} người
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Doanh thu tháng này</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {formatVND(property.monthlyRevenue)}
          </div>
          <div style={{ fontSize: '12px', color: '#137333', marginTop: '4px' }}>
            Thu đều đặn hàng tháng
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Người quản lý trực tiếp</span>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={16} color="#00594C" />
            {property.manager}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            SĐT: 0988 123 456
          </div>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div
        className="rf-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Trạng thái:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'occupied', label: 'Đang thuê' },
                  { id: 'vacant', label: 'Còn trống' },
                  { id: 'maintenance', label: 'Bảo trì' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: statusFilter === tab.id ? '#00594C' : '#E5E7EB',
                    backgroundColor: statusFilter === tab.id ? '#00594C' : '#FFFFFF',
                    color: statusFilter === tab.id ? '#FFFFFF' : '#374151',
                    fontSize: '12px',
                    fontWeight: statusFilter === tab.id ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Floor Filter */}
          {floors.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Tầng:</span>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  backgroundColor: '#FFFFFF',
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Tất cả các tầng ({floors.length} tầng)</option>
                {floors.map((fl) => (
                  <option key={fl} value={fl}>
                    Tầng {fl}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* View Mode Toggle: Grid vs Table */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#F3F4F6', padding: '3px', borderRadius: '6px' }}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'grid' ? '#00594C' : '#6B7280',
              fontWeight: viewMode === 'grid' ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <LayoutGrid size={14} /> Sơ đồ phòng
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'table' ? '#00594C' : '#6B7280',
              fontWeight: viewMode === 'table' ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <List size={14} /> Bảng danh sách
          </button>
        </div>
      </div>

      {/* Main Interactive Rooms Section */}
      {viewMode === 'grid' ? (
        /* Sơ đồ phòng theo từng Tầng */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {floors
            .filter((f) => floorFilter === 'all' || floorFilter === f)
            .map((floorNum) => {
              const roomsOnFloor = filteredRooms.filter((r) => r.floor === floorNum);
              if (roomsOnFloor.length === 0) return null;

              return (
                <div key={floorNum} className="rf-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#00594C' }}>
                        TẦNG {floorNum}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        ({roomsOnFloor.length} phòng)
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      Bấm vào phòng để mở thao tác: Ghi điện nước, gia hạn, nhắn tin...
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '14px',
                    }}
                  >
                    {roomsOnFloor.map((room) => {
                      const isOccupied = room.status === 'occupied';
                      const count = room.occupants?.length || (room.tenantName ? 1 : 0);

                      return (
                        <div
                          key={room.id}
                          style={{
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            backgroundColor: isOccupied ? '#FFFFFF' : '#FAFAFA',
                            padding: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#00594C';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 89, 76, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                          }}
                          onClick={() => handleOpenRoomAction(room)}
                          title={`Bấm để mở trang chi tiết phòng ${room.code}`}
                        >
                          {/* Room Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                                {room.code}
                              </span>
                              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                                {room.type} ({room.area}m²)
                              </span>
                            </div>
                            <span
                              className={`rf-badge ${
                                isOccupied
                                  ? 'rf-badge-active'
                                  : room.status === 'vacant'
                                  ? 'rf-badge-vacant'
                                  : 'rf-badge-warning'
                              }`}
                              style={{ fontSize: '10px' }}
                            >
                              {isOccupied ? 'Đang thuê' : room.status === 'vacant' ? 'Phòng trống' : 'Bảo trì'}
                            </span>
                          </div>

                          {/* Room Details */}
                          <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#6B7280' }}>Khách thuê:</span>
                              <strong style={{ color: isOccupied ? '#00594C' : '#9CA3AF' }}>
                                {room.tenantName || 'Chưa có người ở'}
                              </strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#6B7280' }}>Giá thuê:</span>
                              <strong style={{ color: '#111827' }}>{formatVND(room.price)}</strong>
                            </div>
                            {isOccupied && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6B7280' }}>Hết hạn HĐ:</span>
                                <span style={{ color: '#4B5563' }}>{room.leaseEnd || '31/10/2026'}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#6B7280' }}>Người ở:</span>
                              <span style={{ color: '#4B5563' }}>{count}/{room.maxOccupants || 2} người</span>
                            </div>
                          </div>

                          {/* Direct Action Buttons on Card */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '4px',
                              paddingTop: '8px',
                              borderTop: '1px solid #F3F4F6',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenRoomAction(room, 'meter')}
                              style={{
                                padding: '5px 4px',
                                border: '1px solid #E5E7EB',
                                borderRadius: '4px',
                                backgroundColor: '#F9FAFB',
                                color: '#B45309',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title="Ghi chỉ số điện nước"
                            >
                              <Zap size={13} color="#D97706" />
                              <span>Điện nước</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRoomAction(room, 'contract')}
                              style={{
                                padding: '5px 4px',
                                border: '1px solid #E5E7EB',
                                borderRadius: '4px',
                                backgroundColor: '#F9FAFB',
                                color: '#00594C',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title="Gia hạn hợp đồng thuê"
                            >
                              <FileText size={13} color="#00594C" />
                              <span>Gia hạn</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRoomAction(room, 'message')}
                              style={{
                                padding: '5px 4px',
                                border: '1px solid #E5E7EB',
                                borderRadius: '4px',
                                backgroundColor: '#F9FAFB',
                                color: '#0068FF',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title="Nhắn tin Zalo / SMS cho người ở"
                            >
                              <MessageSquare size={13} color="#0068FF" />
                              <span>Nhắn tin</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRoomAction(room, 'invoice')}
                              style={{
                                padding: '5px 4px',
                                border: '1px solid #E5E7EB',
                                borderRadius: '4px',
                                backgroundColor: '#F9FAFB',
                                color: '#15803D',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title="Lập hóa đơn & Tạo mã VietQR"
                            >
                              <Receipt size={13} color="#15803D" />
                              <span>Hóa đơn</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* Bảng danh sách phòng chi tiết */
        <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="rf-table">
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Tầng</th>
                <th>Loại phòng</th>
                <th>Giá thuê</th>
                <th>Người ở</th>
                <th>Đại diện thuê</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                const count = room.occupants?.length || (room.tenantName ? 1 : 0);
                const max = room.maxOccupants || 2;
                return (
                  <tr
                    key={room.id}
                    onClick={() => handleOpenRoomAction(room)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    title={`Bấm để mở trang chi tiết phòng ${room.code}`}
                  >
                    <td>
                      <span style={{ fontWeight: 800, color: '#00594C' }}>{room.code}</span>
                    </td>
                    <td>Tầng {room.floor}</td>
                    <td>{room.type}</td>
                    <td style={{ fontWeight: 600 }}>{formatVND(room.price)}</td>
                    <td>
                      <span className="rf-badge rf-badge-active" style={{ fontSize: '11px' }}>
                        <Users size={11} style={{ marginRight: '3px' }} />
                        {count}/{max} người
                      </span>
                    </td>
                    <td>
                      {room.tenantName ? (
                        <div>
                          <span style={{ fontWeight: 600 }}>{room.tenantName}</span>
                          {room.tenantPhone && (
                            <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '6px' }}>
                              ({room.tenantPhone})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Chưa có khách</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`rf-badge ${
                          room.status === 'occupied'
                            ? 'rf-badge-active'
                            : room.status === 'vacant'
                            ? 'rf-badge-vacant'
                            : 'rf-badge-warning'
                        }`}
                      >
                        {room.status === 'occupied' ? 'Đang thuê' : room.status === 'vacant' ? 'Phòng trống' : 'Bảo trì'}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="rf-btn rf-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                          onClick={() => handleOpenRoomAction(room, 'meter')}
                          title="Ghi điện nước"
                        >
                          <Zap size={12} color="#D97706" /> Điện nước
                        </button>
                        <button
                          type="button"
                          className="rf-btn rf-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                          onClick={() => handleOpenRoomAction(room, 'contract')}
                          title="Gia hạn hợp đồng"
                        >
                          <FileText size={12} color="#00594C" /> Gia hạn
                        </button>
                        <button
                          type="button"
                          className="rf-btn rf-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                          onClick={() => handleOpenRoomAction(room, 'message')}
                          title="Nhắn tin Zalo"
                        >
                          <MessageSquare size={12} color="#0068FF" /> Nhắn tin
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
