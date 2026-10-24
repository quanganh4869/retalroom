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
  Plus,
  ArrowLeft,
} from 'lucide-react';

export const PropertyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
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
              {showForm ? 'Thêm Cơ sở / Tòa nhà mới' : 'Quản lý Bất động sản & Tòa nhà'}
            </h1>
            {!showForm && (
              <span className="rf-badge rf-badge-active">
                {totalProperties} CƠ SỞ VẬN HÀNH
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {showForm ? (
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowForm(false)}
            >
              <ArrowLeft size={14} /> Quay lại danh sách
            </button>
          ) : (
            <>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => navigate('/rooms')}
              >
                <DoorOpen size={14} /> Sơ đồ toàn bộ phòng
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={14} /> Thêm tòa nhà mới
              </button>
            </>
          )}
        </div>
      </div>

      {showForm ? (
        <PropertyForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      ) : (
        <>
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

          {/* Property Cards Grid */}
          {propertiesList.length === 0 ? (
            <div className="rf-card" style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
              <Building2 size={40} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Chưa có bất động sản nào</h3>
              <p style={{ margin: '6px 0 16px 0', fontSize: '13px' }}>
                Bắt đầu thiết lập cơ sở đầu tiên để quản lý các tầng và phòng trọ.
              </p>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={14} /> Thêm tòa nhà mới
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
          {propertiesList.map((prop) => {
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
              </div>
            );
          })}
        </div>
      )}
    </>
  )}
</div>
  );
};

