import React, { useState } from 'react';
import {
  Download,
  QrCode,
  CheckCircle2,
  Copy,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { formatVND, mockInvoices, InvoiceItem } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { Modal } from '@/components/ui/Modal';

export const TenantInvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [invoices, setInvoices] = useState<InvoiceItem[]>(
    mockInvoices.filter((i) => i.roomCode === (user?.roomCode || 'P.101'))
  );
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem>(
    (mockInvoices.filter((i) => i.roomCode === (user?.roomCode || 'P.101'))[0] || mockInvoices[0])!
  );
  const [showQRModal, setShowQRModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Bank info of Landlord
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

  const transferContent = `${selectedInvoice?.code || 'INV-2403-01'} P101`;
  const paymentAmount = selectedInvoice?.debtAmount > 0 ? selectedInvoice.debtAmount : selectedInvoice?.totalAmount || 4830000;

  const qrUrl = `https://img.vietqr.io/image/${savedLandlordAuth.bankName}-${savedLandlordAuth.accountNumber}-compact2.png?amount=${paymentAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(savedLandlordAuth.accountHolder)}`;

  const handleSimulateBankSuccess = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);

      // Update state for invoice
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedInvoice.id
            ? { ...inv, status: 'paid', paidAmount: inv.totalAmount, debtAmount: 0 }
            : inv
        )
      );
      setSelectedInvoice({
        ...selectedInvoice,
        status: 'paid',
        paidAmount: selectedInvoice.totalAmount,
        debtAmount: 0,
      });

      toast.success(
        'Thanh toán thành công!',
        `Hệ thống đã tự động gửi email thông báo nhận tiền đến chủ nhà (${savedLandlordAuth.notificationEmail}).`
      );
    }, 1200);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.info('Đã sao chép', `Đã chép ${label} vào bộ nhớ tạm.`);
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Hóa đơn & Tiền phòng
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
          Tra cứu toàn bộ phiếu thu tiền phòng hàng tháng, lịch sử thanh toán và quét mã chuyển khoản VietQR.
        </p>
      </div>

      {/* Main Grid: Invoices List on Left, Active Invoice Details on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px' }}>
        {/* Left Column: Invoices Table */}
        <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Danh sách hóa đơn phòng {user?.roomCode || 'P.101'}
            </h3>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>
              Hiển thị {invoices.length} kỳ hóa đơn
            </span>
          </div>

          <table className="rf-table">
            <thead>
              <tr>
                <th>Mã hóa đơn</th>
                <th>Kỳ thu</th>
                <th>Tổng tiền</th>
                <th>Còn nợ</th>
                <th>Hạn đóng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const isSelected = inv.id === selectedInvoice.id;
                return (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#F0FDF4' : 'transparent',
                    }}
                  >
                    <td>
                      <strong style={{ color: isSelected ? '#00594C' : '#111827' }}>
                        {inv.code}
                      </strong>
                    </td>
                    <td>{inv.period}</td>
                    <td style={{ fontWeight: 600 }}>{formatVND(inv.totalAmount)}</td>
                    <td style={{ color: inv.debtAmount > 0 ? '#DC2626' : '#059669', fontWeight: 600 }}>
                      {formatVND(inv.debtAmount)}
                    </td>
                    <td style={{ fontSize: '12px', color: '#6B7280' }}>{inv.dueDate}</td>
                    <td>
                      <span className={`rf-badge ${inv.status === 'paid' ? 'rf-badge-active' : 'rf-badge-warning'}`}>
                        {inv.status === 'paid' ? 'Đã thanh toán' : 'Chờ nộp'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column: Selected Invoice Detail Breakdown & VietQR Button */}
        <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>CHI TIẾT {selectedInvoice.period.toUpperCase()}</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {selectedInvoice.code}
              </h3>
            </div>
            <span className={`rf-badge ${selectedInvoice.status === 'paid' ? 'rf-badge-active' : 'rf-badge-warning'}`}>
              {selectedInvoice.status === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
              <span style={{ color: '#4B5563' }}>Tiền thuê phòng:</span>
              <span style={{ fontWeight: 600 }}>{formatVND(selectedInvoice.roomFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
              <span style={{ color: '#4B5563' }}>Tiền điện (90 kWh x 3.800đ):</span>
              <span>{formatVND(selectedInvoice.electricFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
              <span style={{ color: '#4B5563' }}>Tiền nước (6 m³ x 20.000đ):</span>
              <span>{formatVND(selectedInvoice.waterFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
              <span style={{ color: '#4B5563' }}>Phí quản lý & rác:</span>
              <span>{formatVND(selectedInvoice.serviceFee)}</span>
            </div>
          </div>

          <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>
              {selectedInvoice.status === 'paid' ? 'Tổng tiền đã thanh toán:' : 'Số tiền cần thanh toán:'}
            </span>
            <strong style={{ fontSize: '20px', color: selectedInvoice.status === 'paid' ? '#137333' : '#DC2626' }}>
              {formatVND(selectedInvoice.debtAmount > 0 ? selectedInvoice.debtAmount : selectedInvoice.totalAmount)}
            </strong>
          </div>

          {selectedInvoice.status === 'paid' ? (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#F0FDF4',
                borderRadius: '6px',
                border: '1px solid #BBF7D0',
                color: '#166534',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Hóa đơn kỳ này đã được thanh toán hoàn tất!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ width: '100%', padding: '10px 16px', fontSize: '13px', fontWeight: 600 }}
                onClick={() => {
                  setPaymentSuccess(false);
                  setShowQRModal(true);
                }}
              >
                <QrCode size={16} />
                <span>Quét mã VietQR thanh toán ngay</span>
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ width: '100%' }}
                onClick={() => toast.info('Đang tải hóa đơn PDF...', 'Tệp đã sẵn sàng tải về thiết bị.')}
              >
                <Download size={14} />
                In / Tải biên lai PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VietQR Payment Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Thanh toán tiền phòng qua VietQR"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '460px' }}>
          {paymentSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Thanh toán thành công {formatVND(paymentAmount)}!
              </h3>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, maxWidth: '380px', lineHeight: 1.5 }}>
                Giao dịch đã được ghi nhận trên hệ thống RentFlow. Hóa đơn {selectedInvoice.code} kỳ {selectedInvoice.period} đã được gạch nợ thành công.
              </p>

              <div
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#EFF6FF',
                  borderRadius: '8px',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1D4ED8', fontWeight: 600, fontSize: '13px' }}>
                  <Mail size={16} />
                  <span>Đã gửi thông báo email cho chủ nhà:</span>
                </div>
                <div style={{ fontSize: '12px', color: '#1E40AF', lineHeight: 1.5 }}>
                  <div>• <strong>Người nhận:</strong> {savedLandlordAuth.notificationEmail}</div>
                  <div>• <strong>Tiêu đề:</strong> [RentFlow] Nhận thanh toán {selectedInvoice.code} phòng {user?.roomCode || 'P.101'} - {formatVND(paymentAmount)}</div>
                  <div>• <strong>Người nộp:</strong> {user?.name || 'Lê Hoàng Nam'} ({savedLandlordAuth.accountNumber} • {savedLandlordAuth.bankName})</div>
                  <div>• <strong>Nội dung:</strong> {transferContent}</div>
                </div>
              </div>

              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ width: '100%', padding: '10px' }}
                onClick={() => setShowQRModal(false)}
              >
                Đóng hộp thoại
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Quét mã bằng bất kỳ ứng dụng Ngân hàng nào</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#00594C', margin: '4px 0' }}>
                  {formatVND(paymentAmount)}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <img
                    src={qrUrl}
                    alt="VietQR Rent Payment"
                    style={{ width: '220px', height: '220px', display: 'block', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(`2|99|${savedLandlordAuth.accountNumber}|${savedLandlordAuth.accountHolder}|${savedLandlordAuth.bankName}|0|0|${paymentAmount}|${transferContent}`);
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} color="#00594C" />
                  Chuẩn VietQR liên ngân hàng NAPAS247
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>Ngân hàng thụ hưởng</span>
                    <strong style={{ color: '#111827' }}>{savedLandlordAuth.bankName}</strong>
                  </div>
                  <button type="button" className="rf-btn rf-btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleCopy(savedLandlordAuth.bankName, 'Ngân hàng')}>
                    <Copy size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>Số tài khoản chủ nhà</span>
                    <strong style={{ color: '#00594C', fontSize: '15px' }}>{savedLandlordAuth.accountNumber}</strong>
                  </div>
                  <button type="button" className="rf-btn rf-btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleCopy(savedLandlordAuth.accountNumber, 'Số tài khoản')}>
                    <Copy size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>Chủ tài khoản</span>
                    <strong style={{ color: '#111827' }}>{savedLandlordAuth.accountHolder}</strong>
                  </div>
                  <button type="button" className="rf-btn rf-btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleCopy(savedLandlordAuth.accountHolder, 'Tên chủ TK')}>
                    <Copy size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#FEF3C7', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                  <div>
                    <span style={{ color: '#92400E', fontSize: '11px', display: 'block' }}>Nội dung chuyển khoản (bắt buộc)</span>
                    <strong style={{ color: '#B45309', fontSize: '14px' }}>{transferContent}</strong>
                  </div>
                  <button type="button" className="rf-btn rf-btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleCopy(transferContent, 'Nội dung chuyển khoản')}>
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} />
                <span>
                  Sau khi quét mã, hệ thống Webhook ngân hàng sẽ tự gạch nợ và <strong>gửi email thông báo</strong> ngay cho chủ nhà <em>({savedLandlordAuth.notificationEmail})</em>.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="rf-btn rf-btn-secondary" style={{ flex: 1 }} onClick={() => setShowQRModal(false)}>
                  Đóng
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  style={{ flex: 2, padding: '10px', fontSize: '13px' }}
                  onClick={handleSimulateBankSuccess}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? <span>Đang xác nhận với ngân hàng...</span> : <>
                    <CheckCircle2 size={16} />
                    <span>Xác nhận đã chuyển tiền thành công</span>
                  </>}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
