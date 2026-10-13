import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Droplets,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  mockMeterReadings,
  mockInvoices,
  mockRooms,
  mockProperties,
  formatVND,
} from '@/lib/mockData';

export const MeterReadingDetailPage: React.FC = () => {
  const { readingId } = useParams<{ readingId: string }>();
  const navigate = useNavigate();

  const reading = mockMeterReadings.find((r) => r.id === readingId);

  if (!reading) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', padding: '40px' }} className="rf-card">
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Không tìm thấy bản ghi chỉ số
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '8px 0 20px 0' }}>
          Bản ghi chỉ số điện nước với mã <strong>{readingId}</strong> không tồn tại trong hệ thống.
        </p>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => navigate('/meter-readings')}
        >
          <ArrowLeft size={14} /> Quay lại danh sách chỉ số
        </button>
      </div>
    );
  }

  const room = mockRooms.find((r) => r.code === reading.roomCode);
  const property = room ? mockProperties.find((p) => p.id === room.propertyId) : mockProperties[0];
  const relatedInvoice = mockInvoices.find(
    (i) => (reading.invoiceCode && i.code === reading.invoiceCode) || (i.roomCode === reading.roomCode && i.period === reading.period)
  );

  const electricUsed = Math.max(0, reading.currElectric - reading.prevElectric);
  const waterUsed = Math.max(0, reading.currWater - reading.prevWater);
  const electricCost = electricUsed * reading.electricUnitPrice;
  const waterCost = waterUsed * reading.waterUnitPrice;
  const totalCost = electricCost + waterCost;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => navigate(-1)}
          style={{ padding: '6px 12px' }}
        >
          <ArrowLeft size={14} /> Quay lại danh sách chỉ số
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {relatedInvoice && (
            <Link
              to={`/invoices/${relatedInvoice.id}`}
              className="rf-btn rf-btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <FileText size={14} /> Xem hóa đơn liên quan ({relatedInvoice.code})
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div
        className="rf-card"
        style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="rf-badge rf-badge-active">Đã chốt chính thức</span>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Mã bản ghi: #{reading.id}</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '6px 0 2px 0' }}>
              Chỉ số Điện & Nước — Phòng {reading.roomCode}
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Cơ sở: <strong>{property?.name}</strong> • Khách thuê: <strong>{reading.tenantName}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>KỲ CHỐT SỐ</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#00594C' }}>
              {reading.period || 'Tháng 03/2024'}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Ngày ghi: {reading.updatedAt}</div>
          </div>
        </div>

        {/* Breakdown Grid: Electricity & Water Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Electricity Card */}
          <div
            style={{
              padding: '20px',
              backgroundColor: '#FFFBEB',
              borderRadius: '8px',
              border: '1px solid #FDE68A',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="#D97706" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#92400E' }}>
                  Công tơ Điện
                </h3>
              </div>
              <strong style={{ fontSize: '18px', color: '#B45309' }}>
                {formatVND(electricCost)}
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #FEF3C7' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>CHỈ SỐ ĐẦU KỲ</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#374151' }}>
                  {reading.prevElectric} kWh
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>CHỈ SỐ CUỐI KỲ</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#D97706' }}>
                  {reading.currElectric} kWh
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>TIÊU THỤ THỰC TẾ</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#B45309' }}>
                  {electricUsed} kWh
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>ĐƠN GIÁ ÁP DỤNG</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  {reading.electricUnitPrice.toLocaleString('vi-VN')} đ/kWh
                </div>
              </div>
            </div>
          </div>

          {/* Water Card */}
          <div
            style={{
              padding: '20px',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Droplets size={20} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1E40AF' }}>
                  Đồng hồ Nước
                </h3>
              </div>
              <strong style={{ fontSize: '18px', color: '#1D4ED8' }}>
                {formatVND(waterCost)}
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #DBEAFE' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>CHỈ SỐ ĐẦU KỲ</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#374151' }}>
                  {reading.prevWater} m³
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>CHỈ SỐ CUỐI KỲ</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#2563EB' }}>
                  {reading.currWater} m³
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>TIÊU THỤ THỰC TẾ</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1D4ED8' }}>
                  {waterUsed} m³
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>ĐƠN GIÁ ÁP DỤNG</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  {reading.waterUnitPrice.toLocaleString('vi-VN')} đ/m³
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Summary Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            backgroundColor: '#F0FDF4',
            borderRadius: '8px',
            border: '1px solid #BBF7D0',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>
              Tổng tiền dịch vụ Điện & Nước kỳ này:
            </span>
            <div style={{ fontSize: '12px', color: '#15803D' }}>
              Bao gồm: {formatVND(electricCost)} (Điện) + {formatVND(waterCost)} (Nước)
            </div>
          </div>
          <strong style={{ fontSize: '24px', fontWeight: 800, color: '#14532D' }}>
            {formatVND(totalCost)}
          </strong>
        </div>

        {/* Audit & Linked Invoice Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px', color: '#4B5563' }}>
          <div style={{ padding: '14px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
              Nhật ký chốt số & Tính toàn vẹn
            </h4>
            <div>• Người ghi số: Nguyễn An (Chủ trọ)</div>
            <div>• Thời điểm cập nhật: {reading.updatedAt} lúc 08:30</div>
            <div>• Trạng thái đối soát: Khách thuê đã xác nhận qua Cổng cư dân</div>
          </div>

          <div style={{ padding: '14px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
              Hóa đơn tương ứng
            </h4>
            {relatedInvoice ? (
              <div>
                <div>• Mã hóa đơn: <strong>{relatedInvoice.code}</strong></div>
                <div>• Trạng thái thanh toán: {relatedInvoice.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</div>
                <div style={{ marginTop: '4px' }}>
                  <Link to={`/invoices/${relatedInvoice.id}`} style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                    Chuyển đến trang chi tiết hóa đơn →
                  </Link>
                </div>
              </div>
            ) : (
              <div>Chưa gắn với hóa đơn nào trong kỳ này.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
