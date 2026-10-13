import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Droplets,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  mockMeterReadings,
  mockInvoices,
  mockRooms,
  mockProperties,
  formatVND,
} from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { Modal } from '@/components/ui/Modal';

export const TenantUtilityDetailPage: React.FC = () => {
  const { readingId } = useParams<{ readingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const userRoomCode = user?.roomCode || 'P.101';
  const reading = mockMeterReadings.find(
    (m) => m.id === readingId && m.roomCode === userRoomCode
  );

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeNote, setDisputeNote] = useState('');

  if (!reading) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', padding: '40px' }} className="rf-card">
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Không tìm thấy bản ghi chỉ số
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '8px 0 20px 0' }}>
          Bản ghi chỉ số điện nước <strong>{readingId}</strong> không tồn tại hoặc bạn không có quyền xem dữ liệu phòng khác.
        </p>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => navigate('/tenant/utilities')}
        >
          <ArrowLeft size={14} /> Quay lại lịch sử điện nước
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

  const handleSendDispute = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDisputeModal(false);
    toast.success(
      'Đã gửi báo cáo sai lệch chỉ số!',
      `Chủ nhà đã nhận được yêu cầu đối soát lại chỉ số kỳ ${reading.period}.`
    );
    setDisputeNote('');
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => navigate('/tenant/utilities')}
          style={{ padding: '6px 12px' }}
        >
          <ArrowLeft size={14} /> Quay lại lịch sử điện nước
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => setShowDisputeModal(true)}
          >
            <HelpCircle size={14} color="#D97706" /> Báo chỉ số bất thường
          </button>
          {relatedInvoice && (
            <Link
              to={`/tenant/invoices/${relatedInvoice.id}`}
              className="rf-btn rf-btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <FileText size={14} /> Xem hóa đơn ({relatedInvoice.code})
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
              <span className="rf-badge rf-badge-active">Chỉ số chính thức</span>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Phòng {reading.roomCode}</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '6px 0 2px 0' }}>
              Chi tiết tiêu thụ Điện & Nước kỳ {reading.period}
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Cơ sở: <strong>{property?.name}</strong> • Chốt ngày: <strong>{reading.updatedAt}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>TỔNG TIỀN DỊCH VỤ</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#00594C' }}>
              {formatVND(totalCost)}
            </div>
            <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>
              ✓ Đã kết chuyển vào hóa đơn tháng
            </div>
          </div>
        </div>

        {/* Electric & Water Breakdown Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Electric */}
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
                <span style={{ color: '#6B7280', fontSize: '11px' }}>TIÊU THỤ</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#B45309' }}>
                  {electricUsed} kWh
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>ĐƠN GIÁ</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  {reading.electricUnitPrice.toLocaleString('vi-VN')} đ/kWh
                </div>
              </div>
            </div>
          </div>

          {/* Water */}
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
                <span style={{ color: '#6B7280', fontSize: '11px' }}>TIÊU THỤ</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1D4ED8' }}>
                  {waterUsed} m³
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>ĐƠN GIÁ</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  {reading.waterUnitPrice.toLocaleString('vi-VN')} đ/m³
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Invoice Callout */}
        {relatedInvoice && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                Hóa đơn tương ứng: {relatedInvoice.code} ({relatedInvoice.period})
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Hóa đơn đã bao gồm tiền phòng, điện, nước và dịch vụ. Trạng thái:{' '}
                <strong>{relatedInvoice.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</strong>
              </div>
            </div>
            <Link
              to={`/tenant/invoices/${relatedInvoice.id}`}
              className="rf-btn rf-btn-secondary"
              style={{ fontSize: '12px', textDecoration: 'none' }}
            >
              Mở hóa đơn phòng →
            </Link>
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Báo cáo sai lệch chỉ số Điện / Nước"
      >
        <form onSubmit={handleSendDispute} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '400px' }}>
          <div style={{ fontSize: '13px', color: '#4B5563' }}>
            Bạn đang báo cáo sai lệch chỉ số kỳ <strong>{reading.period}</strong> (Phòng {reading.roomCode}).
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Mô tả chi tiết số đo thực tế tại phòng:
            </label>
            <textarea
              rows={3}
              value={disputeNote}
              onChange={(e) => setDisputeNote(e.target.value)}
              placeholder="VD: Số điện chụp trên công tơ là 1320 thay vì 1330..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowDisputeModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Gửi báo cáo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
