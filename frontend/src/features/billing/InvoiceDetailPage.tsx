import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  CreditCard,
  Send,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  mockInvoices,
  mockRooms,
  mockProperties,
  mockMeterReadings,
  mockPayments,
  formatVND,
  InvoiceItem,
} from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirmAction } = useActionModal();

  const foundInvoice = mockInvoices.find((i) => i.id === id || i.code === id);
  const [invoice, setInvoice] = useState<InvoiceItem | null>(foundInvoice || null);

  // If invoice not found, show appropriate not-found state
  if (!invoice) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', padding: '40px' }} className="rf-card">
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Không tìm thấy hóa đơn
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '8px 0 20px 0' }}>
          Hóa đơn với mã <strong>{id}</strong> không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </p>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => navigate('/invoices')}
        >
          <ArrowLeft size={14} /> Quay lại danh sách hóa đơn
        </button>
      </div>
    );
  }

  const room = mockRooms.find((r) => r.code === invoice.roomCode);
  const property = room ? mockProperties.find((p) => p.id === room.propertyId) : mockProperties[0];

  // Related utility reading for this invoice
  const relatedReading = mockMeterReadings.find(
    (m) =>
      (m.invoiceCode && m.invoiceCode === invoice.code) ||
      (m.roomCode === invoice.roomCode && m.period === invoice.period)
  );

  // Related payments for this invoice
  const relatedPayments = mockPayments.filter(
    (p) => p.invoiceCode === invoice.code || (p.roomCode === invoice.roomCode && p.period === invoice.period)
  );

  const savedLandlordBank = (() => {
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
      accountNumber: '190345678901',
      accountHolder: 'NGUYEN AN',
      notificationEmail: 'nguyenan.property@gmail.com',
    };
  })();

  const invoiceAmount = invoice.debtAmount > 0 ? invoice.debtAmount : invoice.totalAmount;
  const qrTransferContent = `${invoice.code} ${invoice.roomCode}`;
  const invoiceQrUrl = `https://img.vietqr.io/image/${savedLandlordBank.bankName}-${savedLandlordBank.accountNumber}-compact2.png?amount=${invoiceAmount}&addInfo=${encodeURIComponent(
    qrTransferContent
  )}&accountName=${encodeURIComponent(savedLandlordBank.accountHolder)}`;

  const handleMarkAsPaid = () => {
    confirmAction({
      title: `Xác nhận thu tiền phiếu ${invoice.code}`,
      description: `Ghi nhận người thuê ${invoice.tenantName} đã thanh toán toàn bộ số tiền ${formatVND(
        invoice.debtAmount > 0 ? invoice.debtAmount : invoice.totalAmount
      )} cho phòng ${invoice.roomCode}.`,
      confirmText: 'Xác nhận đã thu',
      successTitle: 'Đã cập nhật trạng thái thanh toán!',
      successMessage: `Phiếu thu ${invoice.code} đã được chuyển sang trạng thái ĐÃ THANH TOÁN (công nợ về 0đ).`,
      simulateDelayMs: 750,
      onSuccess: () => {
        setInvoice({
          ...invoice,
          status: 'paid',
          paidAmount: invoice.totalAmount,
          debtAmount: 0,
        });
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="rf-badge rf-badge-active">ĐÃ THANH TOÁN</span>;
      case 'partial':
        return <span className="rf-badge rf-badge-warning">THANH TOÁN 1 PHẦN</span>;
      case 'pending':
        return <span className="rf-badge rf-badge-neutral">CHỜ THANH TOÁN</span>;
      case 'overdue':
        return <span className="rf-badge rf-badge-danger">QUÁ HẠN</span>;
      default:
        return <span className="rf-badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={handlePrint}
        >
          <Printer size={14} /> In phiếu thu (A4)
        </button>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => {
              confirmAction({
                title: `Gửi phiếu thu qua Zalo / SMS`,
                description: `Gửi liên kết hóa đơn điện tử kỳ ${invoice.period} trực tiếp đến số điện thoại người thuê ${invoice.tenantName}.`,
                confirmText: 'Gửi thông báo',
                successTitle: 'Đã gửi hóa đơn Zalo ZNS!',
                successMessage: `Khách thuê ${invoice.tenantName} đã nhận được tin nhắn xác nhận hóa đơn.`,
                simulateDelayMs: 650,
              });
            }}
          >
            <Send size={14} /> Gửi Zalo/SMS
          </button>
          {invoice.status !== 'paid' && (
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={handleMarkAsPaid}
            >
              <CreditCard size={14} /> Xác nhận đã thu tiền
            </button>
          )}
      </div>

      {/* Main Printable Invoice Card */}
      <div
        className="rf-card"
        style={{
          padding: '40px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* Header Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E5E7EB', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={24} color="#00594C" />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>
                {property?.name || 'Nhà trọ Hưng Phát'}
              </h2>
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              {property?.address || '123/4 Lê Văn Sỹ, P.13, Q.3, TP.HCM'}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Quản lý: {property?.manager || 'Nguyễn An'} • Hotline: 0988 123 456
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>PHIẾU THU TIỀN PHÒNG</span>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#00594C', margin: '2px 0 4px 0' }}>
              {invoice.code}
            </h1>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Kỳ thanh toán: <strong>{invoice.period}</strong>
            </div>
            <div style={{ marginTop: '6px' }}>{getStatusBadge(invoice.status)}</div>
          </div>
        </div>

        {/* Tenant & Room Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            padding: '16px 20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Khách hàng / Người đại diện
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
              {invoice.tenantName}
            </div>
            <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '2px' }}>
              Số điện thoại: {invoice.tenantPhone || room?.tenantPhone || '0901234567'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Thông tin phòng thuê
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#00594C', marginTop: '4px' }}>
              Phòng: {invoice.roomCode}
              {room && (
                <Link
                  to={`/rooms/${room.id}`}
                  style={{ fontSize: '12px', marginLeft: '8px', fontWeight: 500, color: '#2563EB', textDecoration: 'none' }}
                >
                  (Xem hồ sơ phòng)
                </Link>
              )}
            </div>
            <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '2px' }}>
              Hạn thanh toán: <strong>{invoice.dueDate}</strong>
            </div>
          </div>
        </div>

        {/* Itemized Table Breakdown */}
        <div>
          <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Khoản mục thu</th>
                <th style={{ textAlign: 'center', padding: '12px 16px' }}>Số lượng / Chỉ số</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Đơn giá</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px 16px' }}>
                  <strong>Tiền thuê phòng</strong>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Phí thuê định kỳ theo tháng</div>
                </td>
                <td style={{ textAlign: 'center', padding: '12px 16px' }}>1 tháng</td>
                <td style={{ textAlign: 'right', padding: '12px 16px' }}>{formatVND(invoice.roomFee)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, padding: '12px 16px' }}>
                  {formatVND(invoice.roomFee)}
                </td>
              </tr>

              <tr>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong>Tiền điện sinh hoạt</strong>
                    {relatedReading && (
                      <Link
                        to={`/meter-readings`}
                        style={{ fontSize: '11px', color: '#2563EB', textDecoration: 'none' }}
                        title="Xem chỉ số công tơ điện nước kỳ này"
                      >
                        [Chi tiết số điện]
                      </Link>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>
                    {relatedReading
                      ? `Chỉ số: ${relatedReading.prevElectric} → ${relatedReading.currElectric} kWh`
                      : 'Theo chỉ số công tơ điện riêng'}
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                  {relatedReading
                    ? `${relatedReading.currElectric - relatedReading.prevElectric} kWh`
                    : `${Math.round(invoice.electricFee / 3800)} kWh`}
                </td>
                <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                  {relatedReading ? relatedReading.electricUnitPrice.toLocaleString('vi-VN') : '3.800'} đ/kWh
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, padding: '12px 16px' }}>
                  {formatVND(invoice.electricFee)}
                </td>
              </tr>

              <tr>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong>Tiền nước sinh hoạt</strong>
                    {relatedReading && (
                      <Link
                        to={`/meter-readings`}
                        style={{ fontSize: '11px', color: '#2563EB', textDecoration: 'none' }}
                      >
                        [Chi tiết số nước]
                      </Link>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>
                    {relatedReading
                      ? `Chỉ số: ${relatedReading.prevWater} → ${relatedReading.currWater} m³`
                      : 'Theo đồng hồ nước'}
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                  {relatedReading
                    ? `${relatedReading.currWater - relatedReading.prevWater} m³`
                    : `${Math.round(invoice.waterFee / 20000)} m³`}
                </td>
                <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                  {relatedReading ? relatedReading.waterUnitPrice.toLocaleString('vi-VN') : '20.000'} đ/m³
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, padding: '12px 16px' }}>
                  {formatVND(invoice.waterFee)}
                </td>
              </tr>

              <tr>
                <td style={{ padding: '12px 16px' }}>
                  <strong>Dịch vụ tiện ích</strong>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Rác sinh hoạt, wifi, vệ sinh khu vực chung</div>
                </td>
                <td style={{ textAlign: 'center', padding: '12px 16px' }}>Gói tháng</td>
                <td style={{ textAlign: 'right', padding: '12px 16px' }}>{formatVND(invoice.serviceFee)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, padding: '12px 16px' }}>
                  {formatVND(invoice.serviceFee)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals & Payment Status Calculation */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#4B5563' }}>Tổng cộng thành tiền:</span>
              <strong style={{ fontSize: '16px' }}>{formatVND(invoice.totalAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#059669' }}>Số tiền đã thanh toán:</span>
              <strong style={{ color: '#059669' }}>- {formatVND(invoice.paidAmount)}</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                borderTop: '2px solid #111827',
                paddingTop: '10px',
              }}
            >
              <span style={{ fontWeight: 700 }}>Số tiền còn phải thanh toán:</span>
              <strong style={{ color: invoice.debtAmount > 0 ? '#DC2626' : '#059669', fontSize: '18px' }}>
                {formatVND(invoice.debtAmount)}
              </strong>
            </div>
          </div>
        </div>

        {/* Related Payments History Section */}
        {relatedPayments.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#00594C" />
                <span>Lịch sử các giao dịch thanh toán cho hóa đơn này ({relatedPayments.length})</span>
              </h4>
              <Link to="/payments" style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none' }}>
                Xem sổ quỹ thu chi →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {relatedPayments.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={15} color="#16A34A" />
                    <strong>{p.code}</strong>
                    <span style={{ color: '#6B7280' }}>• {p.date} • {p.method}</span>
                    <span style={{ color: '#4B5563' }}>({p.note})</span>
                  </div>
                  <strong style={{ color: '#15803D', fontSize: '13px' }}>
                    +{formatVND(p.amount)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bank Transfer QR info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            backgroundColor: '#F0FDF4',
            borderRadius: '8px',
            border: '1px solid #BBF7D0',
          }}
        >
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: '#166534' }}>
              Thông tin chuyển khoản nhanh (VietQR)
            </h4>
            <div style={{ fontSize: '13px', color: '#14532D', lineHeight: 1.6 }}>
              <div>Ngân hàng: <strong>{savedLandlordBank.bankName}</strong></div>
              <div>Số tài khoản: <strong>{savedLandlordBank.accountNumber}</strong></div>
              <div>Chủ tài khoản: <strong>{savedLandlordBank.accountHolder}</strong></div>
              <div>Nội dung chuyển: <strong>{qrTransferContent}</strong></div>
              <div style={{ fontSize: '12px', color: '#15803D', marginTop: '4px' }}>
                ✓ Hệ thống sẽ gửi email báo có tức thì tới <strong>{savedLandlordBank.notificationEmail}</strong>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '8px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              textAlign: 'center',
            }}
          >
            <img
              src={invoiceQrUrl}
              alt="VietQR Invoice"
              style={{ width: '100px', height: '100px', display: 'block', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.src =
                  'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=' +
                  encodeURIComponent(
                    `2|99|${savedLandlordBank.accountNumber}|${savedLandlordBank.accountHolder}|${savedLandlordBank.bankName}|0|0|${invoiceAmount}|${qrTransferContent}`
                  );
              }}
            />
            <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>Quét mã chuyển tiền</div>
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            textAlign: 'center',
            paddingTop: '30px',
            borderTop: '1px dashed #E5E7EB',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>NGƯỜI NỘP TIỀN</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ height: '60px' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{invoice.tenantName}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>NGƯỜI THU TIỀN / CHỦ NHÀ</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ height: '60px' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{property?.manager || 'Nguyễn An'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
