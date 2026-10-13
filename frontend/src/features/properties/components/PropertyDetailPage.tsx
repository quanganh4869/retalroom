import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  TrendingUp,
  DoorOpen,
  User,
  Users,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { mockProperties, mockRooms, formatVND } from '@/lib/mockData';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find property by id or fallback to first
  const property = mockProperties.find((p) => p.id === id) || mockProperties[0];
  const propertyRooms = mockRooms.filter((r) => r.propertyId === property?.id);

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

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Navigation & Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => navigate(`/rooms?propertyId=${property.id}`)}
          >
            <DoorOpen size={15} />
            <span>Xem danh sách phòng</span>
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => navigate(`/rooms?propertyId=${property.id}`)}
          >
            <span>Quản lý sơ đồ tầng</span>
          </button>
        </div>
      </div>

      {/* Metrics Highlights Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
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
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={18} color="#00594C" />
            {property.manager}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            SĐT: 0988 123 456
          </div>
        </div>
      </div>

      {/* Main Grid: Rooms Matrix in this Property & Management Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Left Column: Rooms list inside this Property */}
        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Danh sách phòng thuộc cơ sở ({propertyRooms.length} phòng)
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
                Bao gồm các phòng, tình trạng khách ở, đơn giá thuê và số người ở cùng.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to={`/rooms/new?propertyId=${property.id}`}
                className="rf-btn rf-btn-primary"
                style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} />
                <span>Thêm phòng</span>
              </Link>
              <Link
                to={`/rooms?propertyId=${property.id}`}
                style={{ fontSize: '12px', color: '#00594C', fontWeight: 600, textDecoration: 'none', marginLeft: '6px' }}
              >
                Mở sơ đồ chi tiết →
              </Link>
            </div>
          </div>

          <table className="rf-table">
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Tầng</th>
                <th>Loại phòng</th>
                <th>Giá thuê</th>
                <th>Số người ở</th>
                <th>Đại diện thuê</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {propertyRooms.map((room) => {
                const count = room.occupants?.length || (room.tenantName ? 1 : 0);
                const max = room.maxOccupants || 2;
                return (
                  <tr key={room.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#00594C' }}>{room.code}</span>
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
                          <div style={{ fontWeight: 600 }}>{room.tenantName}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>{room.tenantPhone}</div>
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
                            : room.status === 'reserved'
                            ? 'rf-badge-warning'
                            : 'rf-badge-neutral'
                        }`}
                      >
                        {room.status === 'occupied'
                          ? 'Đang thuê'
                          : room.status === 'vacant'
                          ? 'Phòng trống'
                          : room.status === 'reserved'
                          ? 'Giữ cọc'
                          : 'Bảo trì'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/rooms/${room.id}`}
                        className="rf-btn rf-btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px', textDecoration: 'none' }}
                      >
                        Chi tiết phòng
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column: Operational Info & Quick Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="rf-card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
              Thông tin vận hành & Pháp lý
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Quy mô kết cấu:</span>
                <span style={{ fontWeight: 600 }}>{propertyRooms.length > 0 ? Math.max(...propertyRooms.map(r => r.floor)) : 3} Tầng lầu</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Ngày chốt điện nước:</span>
                <span style={{ fontWeight: 600 }}>Ngày 01 hàng tháng</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Kỳ thu tiền phòng:</span>
                <span style={{ fontWeight: 600 }}>Từ mùng 01 - 05</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>PCCC & An ninh:</span>
                <span style={{ color: '#137333', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={14} /> Đạt tiêu chuẩn
                </span>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={() => navigate(`/meter-readings`)}
              >
                Ghi điện nước cơ sở này
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={() => navigate(`/invoices`)}
              >
                Lập hóa đơn toàn cơ sở
              </button>
            </div>
          </div>

          <div className="rf-card" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#166534', margin: '0 0 6px 0' }}>
              💡 Mẹo quản lý cơ sở
            </h4>
            <p style={{ fontSize: '12px', color: '#14532D', margin: 0, lineHeight: 1.5 }}>
              Bạn có thể cập nhật nhanh đơn giá thuê và giá dịch vụ cho tất cả các phòng thuộc dãy trọ <strong>{property.name}</strong> thông qua tính năng <em>"Chỉnh giá tất cả phòng"</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
