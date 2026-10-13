import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Download,
  CheckCircle2,
  Mail,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { formatVND, mockInvoices, InvoiceItem } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { Modal } from '@/components/ui/Modal';

export const TenantInvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const periodParam = searchParams.get('period') || 'all';
  const statusParam = searchParams.get('status') || 'all';

  // Tenant's authorized invoices
  const userRoomCode = user?.roomCode || 'P.101';
  const tenantAllInvoices = useMemo(() => {
    return mockInvoices.filter((i) => i.roomCode === userRoomCode);
  }, [userRoomCode]);

  // Available periods for this tenant
  const availablePeriods = useMemo(() => {
    const map = new Map<string, string>();
    tenantAllInvoices.forEach((inv) => {
      const key = inv.periodKey || (inv.period.includes('03/2024') ? '2024-03' : inv.period.includes('02/2024') ? '2024-02' : inv.period.includes('01/2024') ? '2024-01' : '2023-12');
      if (!map.has(key)) map.set(key, inv.period);
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [tenantAllInvoices]);

  const updateFilters = (updates: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const next = { ...current, ...updates };
    Object.keys(next).forEach((k) => {
      if (next[k] === 'all' || next[k] === '') delete next[k];
    });
    setSearchParams(next);
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return tenantAllInvoices.filter((inv) => {
      if (periodParam !== 'all') {
        const key = inv.periodKey || (inv.period.includes('03/2024') ? '2024-03' : inv.period.includes('02/2024') ? '2024-02' : inv.period.includes('01/2024') ? '2024-01' : '2023-12');
        if (key !== periodParam) return false;
      }
      if (statusParam !== 'all' && inv.status !== statusParam) {
        return false;
      }
      return true;
    });
  }, [tenantAllInvoices, periodParam, statusParam]);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem>(
    filteredInvoices[0] || tenantAllInvoices[0] || mockInvoices[0]!
  );

  // Update selectedInvoice if filtered list changes
  React.useEffect(() => {
    if (filteredInvoices.length > 0) {
      if (!filteredInvoices.some((i) => i.id === selectedInvoice.id)) {
        setSelectedInvoice(filteredInvoices[0]!);
      }
    }
  }, [filteredInvoices, selectedInvoice.id]);

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

  const transferContent = `${selectedInvoice.code} ${userRoomCode}`;
  const paymentAmount = selectedInvoice.debtAmount > 0 ? selectedInvoice.debtAmount : selectedInvoice.totalAmount;

  const qrUrl = `https://img.vietqr.io/image/${savedLandlordAuth.bankName}-${savedLandlordAuth.accountNumber}-compact2.png?amount=${paymentAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(savedLandlordAuth.accountHolder)}`;

  const handleSimulateBankSuccess = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div
        className="rf-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Hóa đơn & Tiền phòng
            </h2>
            <span className="rf-badge rf-badge-active">
              Phòng {userRoomCode}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Xem lại lịch sử tất cả các tháng tiền thuê, tiền điện nước và thanh toán qua mã VietQR
          </p>
        </div>

        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => {
            toast.info('Tải báo cáo tài chính', 'Đang kết xuất bản sao kê lịch sử hóa đơn PDF...');
          }}
        >
          <Download size={15} />
          <span>Tải sao kê lịch sử (PDF)</span>
        </button>
      </div>

      {/* Monthly History Selector & Filter Bar */}
      <div
        className="rf-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Month selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#00594C" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Chọn tháng:</span>
            <select
              value={periodParam}
              onChange={(e) => updateFilters({ period: e.target.value })}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                fontWeight: 600,
                color: '#111827',
                backgroundColor: '#F9FAFB',
                cursor: 'pointer',
              }}
            >
              <option value="all">Tất cả các tháng ({tenantAllInvoices.length} kỳ)</option>
              {availablePeriods.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'pending', 'paid'] as const).map((tab) => {
              const labelMap = { all: 'Tất cả', pending: 'Chưa thanh toán', paid: 'Đã thanh toán' };
              const active = statusParam === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => updateFilters({ status: tab })}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 500,
                    backgroundColor: active ? '#00594C' : '#F3F4F6',
                    color: active ? '#FFFFFF' : '#4B5563',
                  }}
                >
                  {labelMap[tab]}
                </button>
              );
            })}
          </div>
        </div>

        <span style={{ fontSize: '12px', color: '#6B7280' }}>
          Hiển thị <strong>{filteredInvoices.length}</strong> hóa đơn
        </span>
      </div>

      {/* Main Grid: Full Width History Table */}
      <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Bảng lịch sử hóa đơn phòng {userRoomCode}
            </h3>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>
              Danh sách chi tiết hóa đơn theo từng tháng, bấm vào từng dòng để mở trang chi tiết
            </span>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#6B7280' }}>
            <AlertCircle size={32} color="#9CA3AF" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Không có hóa đơn trong kỳ này.</p>
          </div>
        ) : (
          <table className="rf-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Kỳ hóa đơn</th>
                <th>Tổng tiền</th>
                <th>Còn nợ</th>
                <th>Hạn đóng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/tenant/invoices/${inv.id}`)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  title={`Bấm để xem chi tiết hóa đơn ${inv.code}`}
                >
                  <td>
                    <strong style={{ color: '#00594C' }}>
                      {inv.code} →
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
              ))}
            </tbody>
          </table>
        )}
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
                  <div>• <strong>Tiêu đề:</strong> [RentFlow] Nhận thanh toán {selectedInvoice.code} phòng {userRoomCode} - {formatVND(paymentAmount)}</div>
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
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#00594C', margin: '4px 0' }}>
                  {formatVND(paymentAmount)}
                </div>
                <span style={{ fontSize: '12px', color: '#4B5563' }}>Hóa đơn: {selectedInvoice.code} ({selectedInvoice.period})</span>
              </div>

              {/* VietQR Dynamic Code Box */}
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
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={qrUrl}
                    alt="VietQR Code"
                    style={{ width: '220px', height: '220px', display: 'block', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' +
                        encodeURIComponent(
                          `2|99|${savedLandlordAuth.accountNumber}|${savedLandlordAuth.accountHolder}|${savedLandlordAuth.bankName}|0|0|${paymentAmount}|${transferContent}`
                        );
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  onClick={() => setShowQRModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  onClick={handleSimulateBankSuccess}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'Đang xác nhận...' : 'Mô phỏng Chuyển khoản thành công'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
