import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { PropertyForm } from '@/features/properties/components/PropertyForm';
import { mockProperties, mockRooms, formatVND, PropertyItem } from '@/lib/mockData';
import {
  DoorOpen,
  MapPin,
  Building2,
  TrendingUp,
  Search,
  Plus,
} from 'lucide-react';

export const PropertyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data } = useProperties();

  // Combine backend items with mockProperties so it is never empty in dev mode
  const propertiesList: PropertyItem[] = React.useMemo(() => {
    if (data?.items && data.items.length > 0) {
      return data.items.map((item) => {
        const foundRooms = mockRooms.filter((r) => r.propertyId === item.id);
        const rented = foundRooms.filter((r) => r.status === 'occupied').length;
        const total = foundRooms.length || item.total_floors * 4;
        const revenue = foundRooms.reduce((sum, r) => sum + (r.status === 'occupied' ? r.price : 0), 0);
        return {
          id: item.id,
          name: item.name,
          address: `${item.address}, ${item.city}`,
          totalRooms: total,
          rentedRooms: rented,
          monthlyRevenue: revenue || 30000000,
          manager: 'Nguyễn An',
        };
      });
    }
    return mockProperties;
  }, [data]);

  const filteredProperties = propertiesList.filter((prop) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      prop.name.toLowerCase().includes(q) ||
      prop.address.toLowerCase().includes(q) ||
      (prop.manager && prop.manager.toLowerCase().includes(q))
    );
  });

  const totalProperties = propertiesList.length;
  const totalRooms = propertiesList.reduce((sum, p) => sum + p.totalRooms, 0);
  const totalRented = propertiesList.reduce((sum, p) => sum + p.rentedRooms, 0);
  const totalRevenue = propertiesList.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const overallOccupancy = totalRooms > 0 ? Math.round((totalRented / totalRooms) * 100) : 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Quản lý Bất động sản & Tòa nhà
            </h1>
            <span className="rf-badge rf-badge-active">
              {totalProperties} CƠ SỞ VẬN HÀNH
            </span>
          </div>
          <p style={{ color: '#6B7280', fontSize: '13px', margin: '4px 0 0 0' }}>
            Danh sách các cụm tòa nhà, chung cư mini và nhà trọ đang quản lý trong hệ thống RentFlow.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => navigate('/rooms')}
          >
            <DoorOpen size={14} /> Sơ đồ toàn bộ phòng
          </button>
          {!showForm && (
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={14} /> Thêm tòa nhà mới
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <PropertyForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      )}

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Tổng số dãy / Cơ sở</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {totalProperties} tòa nhà
          </div>
          <div style={{ fontSize: '12px', color: '#137333', marginTop: '4px' }}>
            Đang hoạt động ổn định
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Quy mô phòng & Lấp đầy</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            {totalRented} / {totalRooms} phòng
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#137333', marginTop: '4px' }}>
            <TrendingUp size={13} />
            <span>Tỷ lệ lấp đầy: {overallOccupancy}%</span>
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Phòng trống cần cho thuê</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: totalRooms - totalRented > 0 ? '#D97706' : '#111827', marginTop: '6px' }}>
            {totalRooms - totalRented} phòng trống
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            Sẵn sàng đón khách mới
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Tổng doanh thu dự kiến</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {formatVND(totalRevenue)}
          </div>
          <div style={{ fontSize: '12px', color: '#137333', marginTop: '4px' }}>
            Doanh thu định kỳ tháng
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rf-card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Tìm theo tên dãy trọ, địa chỉ, người quản lý..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>
            Hiển thị <strong>{filteredProperties.length}</strong> / {totalProperties} cơ sở
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length === 0 ? (
        <div className="rf-card" style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
          <Building2 size={40} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Không tìm thấy bất động sản nào</h3>
          <p style={{ margin: '6px 0 16px 0', fontSize: '13px' }}>
            Không có tòa nhà nào phù hợp với từ khóa "{searchQuery}".
          </p>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => setSearchQuery('')}
          >
            Đặt lại tìm kiếm
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredProperties.map((prop) => {
            const occupancy = prop.totalRooms ? Math.round((prop.rentedRooms / prop.totalRooms) * 100) : 0;
            const vacantRooms = prop.totalRooms - prop.rentedRooms;
            const roomsInProp = mockRooms.filter((r) => r.propertyId === prop.id);

            return (
              <div
                key={prop.id}
                className="rf-card"
                onClick={() => navigate(`/properties/${prop.id}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  cursor: 'pointer',
                  padding: '20px',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#00594C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
                title={`Bấm để mở chi tiết tòa nhà ${prop.name}`}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 }}>
                      {prop.name} →
                    </h3>
                    <p style={{ color: '#6B7280', fontSize: '12px', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#00594C" /> {prop.address}
                    </p>
                  </div>
                  <span className="rf-badge rf-badge-active" style={{ fontSize: '11px' }}>
                    Đang vận hành
                  </span>
                </div>

                {/* Occupancy and stats bar */}
                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#6B7280' }}>Lấp đầy: <strong>{prop.rentedRooms}/{prop.totalRooms} phòng</strong></span>
                    <strong style={{ color: '#00594C' }}>{occupancy}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${occupancy}%`,
                        height: '100%',
                        backgroundColor: '#00594C',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                    <span>Trống: <strong style={{ color: vacantRooms > 0 ? '#D97706' : '#137333' }}>{vacantRooms} phòng</strong></span>
                    <span>Doanh thu: <strong style={{ color: '#111827' }}>{formatVND(prop.monthlyRevenue)}</strong></span>
                  </div>
                </div>

                {/* Quick Info & Rooms sample */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#4B5563' }}>
                  <span>Quản lý: <strong>{prop.manager || 'Nguyễn An'}</strong></span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#00594C', fontWeight: 600 }}>
                    <DoorOpen size={13} /> {roomsInProp.length > 0 ? `${roomsInProp.length} phòng sẵn sàng` : 'Xem sơ đồ'}
                  </span>
                </div>

                {/* Footer Buttons */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid #F3F4F6',
                    display: 'flex',
                    gap: '8px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="rf-btn rf-btn-primary"
                    style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                    onClick={() => navigate(`/properties/${prop.id}`)}
                  >
                    <Building2 size={13} /> Chi tiết cơ sở
                  </button>
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                    onClick={() => navigate(`/rooms?propertyId=${prop.id}`)}
                  >
                    <DoorOpen size={13} /> Sơ đồ phòng →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

