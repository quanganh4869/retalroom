import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  mockInvoices,
  mockRooms,
  mockProperties,
  mockMeterReadings,
  formatVND,
} from '@/lib/mockData';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const TenantInvoiceDetailPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const userRoomCode = user?.roomCode || 'P.101';
  const foundInvoice = mockInvoices.find(
    (i) => (i.id === invoiceId || i.code === invoiceId) && (i.roomCode === userRoomCode)
  );

  const [invoice, setInvoice] = useState(foundInvoice || null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!invoice) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', padding: '40px' }} className="rf-card">
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Không tìm thấy hóa đơn
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '8px 0 20px 0' }}>
          Hóa đơn với mã <strong>{invoiceId}</strong> không tồn tại hoặc bạn không có quyền xem hóa đơn của phòng khác.
        </p>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => navigate('/tenant/invoices')}
        >
          <ArrowLeft size={14} /> Quay lại danh sách hóa đơn
        </button>
      </div>
    );
  }

  const room = mockRooms.find((r) => r.code === invoice.roomCode);
  const property = room ? mockProperties.find((p) => p.id === room.propertyId) : mockProperties[0];
  const relatedReading = mockMeterReadings.find(
    (m) => (m.invoiceCode && m.invoiceCode === invoice.code) || (m.roomCode === invoice.roomCode && m.period === invoice.period)
  );

  const savedLandlordAuth = (() => {
    try {
      const saved = localStorage.getItem('rentflow_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bankAccount) return parsed.bankAccount;
      }
    } catch {
      // ignore
    }
    return {
      bankName: 'Techcombank',
      bankCode: 'TCB',
      accountNumber: '190345678901',
      accountHolder: 'NGUYEN AN',
      notificationEmail: 'nguyenan.property@gmail.com',
    };
  })();

  const paymentAmount = invoice.debtAmount > 0 ? invoice.debtAmount : invoice.totalAmount;
  const transferContent = `${invoice.code} ${userRoomCode}`;
  const qrUrl = `https://img.vietqr.io/image/${savedLandlordAuth.bankName}-${savedLandlordAuth.accountNumber}-compact2.png?amount=${paymentAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(savedLandlordAuth.accountHolder)}`;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setInvoice({
        ...invoice,
        status: 'paid',
        paidAmount: invoice.totalAmount,
        debtAmount: 0,
      });
      toast.success(
        'Thanh toán hoàn tất!',
        `Đã gạch nợ thành công cho hóa đơn ${invoice.code} kỳ ${invoice.period}.`
      );
    }, 1200);
  };

  const handleSendDispute = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDisputeModal(false);
    toast.success(
      'Đã gửi khiếu nại tới chủ nhà!',
      `Chủ nhà Nguyễn An sẽ kiểm tra lại số liệu hóa đơn ${invoice.code} và liên hệ phản hồi.`
    );
    setDisputeMessage('');
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => navigate('/tenant/invoices')}
          style={{ padding: '6px 12px' }}
        >
          <ArrowLeft size={14} /> Quay lại danh sách hóa đơn
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => setShowDisputeModal(true)}
          >
            <HelpCircle size={14} /> Khiếu nại số tiền
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => window.print()}
          >
            <Printer size={14} /> In biên lai
          </button>
          {invoice.status !== 'paid' && (
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setPaymentSuccess(false);
                setShowQRModal(true);
              }}
            >
              <QrCode size={14} /> Quét mã VietQR thanh toán
            </button>
          )}
        </div>
      </div>

      {/* Invoice Card */}
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E5E7EB', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={24} color="#00594C" />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>
                {property?.name}
              </h2>
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              {property?.address} • Hotline chủ trọ: 0988 123 456
            </div>
            <div style={{ fontSize: '13px', color: '#111827', marginTop: '4px' }}>
              Người thuê: <strong>{invoice.tenantName}</strong> — Phòng <strong>{invoice.roomCode}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>HÓA ĐƠN THÁNG</span>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#00594C', margin: '2px 0 4px 0' }}>
              {invoice.code}
            </h1>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Kỳ thanh toán: <strong>{invoice.period}</strong> • Hạn: <strong>{invoice.dueDate}</strong>
            </div>
            <div style={{ marginTop: '6px' }}>
              <span className={`rf-badge ${invoice.status === 'paid' ? 'rf-badge-active' : 'rf-badge-warning'}`}>
                {invoice.status === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized charges table */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 10px 0' }}>
            Chi tiết các khoản thu trong kỳ {invoice.period}
          </h3>
          <table className="rf-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Khoản mục</th>
                <th>Chi tiết / Chỉ số tiêu thụ</th>
                <th style={{ textAlign: 'right' }}>Đơn giá</th>
                <th style={{ textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Tiền thuê phòng</strong></td>
                <td style={{ fontSize: '12px', color: '#6B7280' }}>Định kỳ 1 tháng</td>
                <td style={{ textAlign: 'right' }}>{formatVND(invoice.roomFee)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVND(invoice.roomFee)}</td>
              </tr>
              <tr>
                <td><strong>Tiền điện sinh hoạt</strong></td>
                <td style={{ fontSize: '12px', color: '#4B5563' }}>
                  {relatedReading
                    ? `${relatedReading.prevElectric} → ${relatedReading.currElectric} (${relatedReading.currElectric - relatedReading.prevElectric} kWh)`
                    : `${Math.round(invoice.electricFee / 3800)} kWh`}
                  {relatedReading && (
                    <Link to="/tenant/utilities" style={{ marginLeft: '8px', color: '#2563EB', fontSize: '11px', textDecoration: 'none' }}>
                      [Xem chỉ số điện nước]
                    </Link>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>3.800 đ/kWh</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVND(invoice.electricFee)}</td>
              </tr>
              <tr>
                <td><strong>Tiền nước sinh hoạt</strong></td>
                <td style={{ fontSize: '12px', color: '#4B5563' }}>
                  {relatedReading
                    ? `${relatedReading.prevWater} → ${relatedReading.currWater} (${relatedReading.currWater - relatedReading.prevWater} m³)`
                    : `${Math.round(invoice.waterFee / 20000)} m³`}
                </td>
                <td style={{ textAlign: 'right' }}>20.000 đ/m³</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVND(invoice.waterFee)}</td>
              </tr>
              <tr>
                <td><strong>Dịch vụ & tiện ích</strong></td>
                <td style={{ fontSize: '12px', color: '#6B7280' }}>Wifi tốc độ cao, vệ sinh, rác</td>
                <td style={{ textAlign: 'right' }}>{formatVND(invoice.serviceFee)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVND(invoice.serviceFee)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '360px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4B5563' }}>Tổng cộng:</span>
              <strong style={{ fontSize: '15px' }}>{formatVND(invoice.totalAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D' }}>
              <span>Đã thanh toán:</span>
              <strong>- {formatVND(invoice.paidAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111827', paddingTop: '8px', fontSize: '15px' }}>
              <span style={{ fontWeight: 700 }}>Số tiền còn phải đóng:</span>
              <strong style={{ color: invoice.debtAmount > 0 ? '#DC2626' : '#15803D', fontSize: '18px' }}>
                {formatVND(invoice.debtAmount)}
              </strong>
            </div>
          </div>
        </div>

        {/* Payment QR Section */}
        {invoice.status !== 'paid' ? (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#F0FDF4',
              borderRadius: '8px',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: '#166534' }}>
                Thanh toán nhanh qua VietQR
              </h4>
              <div style={{ fontSize: '13px', color: '#14532D', lineHeight: 1.5 }}>
                <div>• Ngân hàng: <strong>{savedLandlordAuth.bankName}</strong></div>
                <div>• Số tài khoản: <strong>{savedLandlordAuth.accountNumber}</strong> ({savedLandlordAuth.accountHolder})</div>
                <div>• Nội dung chuyển tiền: <strong>{transferContent}</strong></div>
              </div>
            </div>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setPaymentSuccess(false);
                setShowQRModal(true);
              }}
            >
              <QrCode size={16} /> Quét mã QR ngay
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#F0FDF4',
              borderRadius: '8px',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#15803D',
            }}
          >
            <CheckCircle2 size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>Hóa đơn này đã được thanh toán đầy đủ!</div>
              <div style={{ fontSize: '12px', color: '#166534' }}>
                Giao dịch đã được ghi nhận trên sổ quỹ hệ thống và email xác nhận đã gửi tới chủ nhà.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Quét mã VietQR nộp tiền phòng"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '420px', alignItems: 'center' }}>
          {paymentSuccess ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 10px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Thanh toán thành công!
              </h3>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: '6px 0 16px 0' }}>
                Hóa đơn {invoice.code} kỳ {invoice.period} đã được gạch nợ.
              </p>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setShowQRModal(false)}
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#00594C' }}>
                  {formatVND(paymentAmount)}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {invoice.code} • Phòng {userRoomCode}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <img src={qrUrl} alt="VietQR" style={{ width: '220px', height: '220px', display: 'block' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowQRModal(false)}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Đang kiểm tra...' : 'Xác nhận đã chuyển khoản'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Gửi khiếu nại / Thắc mắc về hóa đơn"
      >
        <form onSubmit={handleSendDispute} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '400px' }}>
          <div style={{ fontSize: '13px', color: '#4B5563' }}>
            Bạn đang khiếu nại về hóa đơn <strong>{invoice.code}</strong> kỳ <strong>{invoice.period}</strong>.
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Nội dung khiếu nại (VD: Sai số điện, sai tiền dịch vụ...):
            </label>
            <textarea
              rows={4}
              value={disputeMessage}
              onChange={(e) => setDisputeMessage(e.target.value)}
              placeholder="Mô tả cụ thể thắc mắc của bạn để chủ nhà kiểm tra lại..."
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
              Gửi phản ánh tới chủ nhà
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
