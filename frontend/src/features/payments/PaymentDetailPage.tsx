import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  mockPayments,
  mockInvoices,
  mockRooms,
  mockProperties,
  formatVND,
} from '@/lib/mockData';

export const PaymentDetailPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const payment = mockPayments.find((p) => p.id === paymentId || p.code === paymentId);

  if (!payment) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', padding: '40px' }} className="rf-card">
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Không tìm thấy giao dịch
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '8px 0 20px 0' }}>
          Giao dịch thanh toán với mã <strong>{paymentId}</strong> không tồn tại trong hệ thống.
        </p>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => navigate('/payments')}
        >
          <ArrowLeft size={14} /> Quay lại danh sách thanh toán
        </button>
      </div>
    );
  }

  const relatedInvoice = mockInvoices.find((i) => i.code === payment.invoiceCode);
  const room = mockRooms.find((r) => r.code === payment.roomCode);
  const property = room ? mockProperties.find((p) => p.id === room.propertyId) : mockProperties[0];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => navigate(-1)}
          style={{ padding: '6px 12px' }}
        >
          <ArrowLeft size={14} /> Quay lại sổ quỹ thanh toán
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => window.print()}
          >
            <Printer size={14} /> In phiếu thu tiền
          </button>
          {relatedInvoice && (
            <Link
              to={`/invoices/${relatedInvoice.id}`}
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
          padding: '36px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Receipt Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E5E7EB', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="rf-badge rf-badge-active">Giao dịch đã xác nhận</span>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Mã phiếu thu: #{payment.code}</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '6px 0 2px 0' }}>
              Biên lai thanh toán tiền phòng
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Cơ sở: <strong>{property?.name}</strong> • Phòng <strong>{payment.roomCode}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>SỐ TIỀN THU</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803D' }}>
              +{formatVND(payment.amount)}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{payment.date}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
              Thông tin người nộp & Phòng
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div>• Khách thuê: <strong>{payment.tenantName}</strong></div>
              <div>• Số điện thoại: <strong>{room?.tenantPhone || '0901234567'}</strong></div>
              <div>• Phòng: <strong>{payment.roomCode}</strong> ({property?.name})</div>
              <div>• Hóa đơn gạch nợ: <strong>{payment.invoiceCode}</strong></div>
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
              Chi tiết giao dịch
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div>• Hình thức: <strong>{payment.method}</strong></div>
              <div>• Kỳ hóa đơn: <strong>{payment.period || 'Tháng 03/2024'}</strong></div>
              <div>• Người lập phiếu: <strong>{payment.recordedBy}</strong></div>
              <div>• Ghi chú: <em>{payment.note || 'Thanh toán tiền phòng'}</em></div>
            </div>
          </div>
        </div>

        {/* Linked Invoice Callout */}
        {relatedInvoice && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#F0FDF4',
              borderRadius: '8px',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                Hóa đơn tương ứng: {relatedInvoice.code} ({relatedInvoice.period})
              </div>
              <div style={{ fontSize: '12px', color: '#15803D', marginTop: '2px' }}>
                Tổng hóa đơn: {formatVND(relatedInvoice.totalAmount)} • Đã thanh toán: {formatVND(relatedInvoice.paidAmount)} • Công nợ còn lại: {formatVND(relatedInvoice.debtAmount)}
              </div>
            </div>
            <Link
              to={`/invoices/${relatedInvoice.id}`}
              className="rf-btn rf-btn-secondary"
              style={{ fontSize: '12px', textDecoration: 'none' }}
            >
              Mở hóa đơn →
            </Link>
          </div>
        )}

        {/* Signatures */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px dashed #E5E7EB',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>NGƯỜI NỘP TIỀN</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ height: '50px' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{payment.tenantName}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>NGƯỜI THU TIỀN</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ height: '50px' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{payment.recordedBy}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
