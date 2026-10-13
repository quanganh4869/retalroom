import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Wrench,
  Download,
  ShieldCheck,
  QrCode,
  Mail,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { formatVND, mockInvoices, mockMaintenance, mockContracts } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { Modal } from '@/components/ui/Modal';

export const TenantPortalPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'utilities' | 'maintenance' | 'contract'>('overview');
  const [reported, setReported] = useState(false);
  const [reportedTitle, setReportedTitle] = useState('');
  const [reportedCategory, setReportedCategory] = useState('Nước (Vòi sen, bồn cầu, lavabo)');
  const [reportedDesc, setReportedDesc] = useState('');

  // Handle URL hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'invoices') setActiveTab('invoices');
    else if (hash === 'utilities') setActiveTab('utilities');
    else if (hash === 'maintenance') setActiveTab('maintenance');
    else if (hash === 'contract') setActiveTab('contract');
  }, [location.hash]);

  const tenantInvoice = mockInvoices[0]; // P.101 Le Hoang Nam
  const tenantTickets = mockMaintenance.filter((m) => m.roomCode === 'P.101');
  const tenantContract = mockContracts.find((c) => c.roomCode === 'P.101') || mockContracts[0];

  // Bank Info of Landlord (Retrieved from Landlord account / settings / fallback)
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

  const [showQRModal, setShowQRModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [invoicePaid, setInvoicePaid] = useState(false);

  // Bank transfer content template
  const transferContent = `${tenantInvoice?.code || 'INV-2403-01'} P101`;
  const paymentAmount = tenantInvoice?.totalAmount || 4830000;

  // VietQR Quick URL: https://img.vietqr.io/image/<BANK>-<ACC>-compact2.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
  const qrUrl = `https://img.vietqr.io/image/${savedLandlordAuth.bankName}-${savedLandlordAuth.accountNumber}-compact2.png?amount=${paymentAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(savedLandlordAuth.accountHolder)}`;

  const handleSimulateBankSuccess = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setInvoicePaid(true);

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

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề sự cố');
      return;
    }
    setReported(true);
    toast.success('Đã gửi báo hỏng', 'Chủ nhà đã nhận được thông báo sự cố và sẽ phân công thợ sửa chữa.');
    setReportedTitle('');
    setReportedDesc('');
    setTimeout(() => setReported(false), 5000);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-active">Cổng cư dân RentFlow</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Phòng {user?.roomCode || 'P.101'}</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '6px 0 0 0' }}>
            Xin chào, {user?.name || 'Lê Hoàng Nam'}! 👋
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Cơ sở: Nhà trọ Hưng Phát • Hợp đồng đến {tenantContract?.endDate || '31/12/2026'}
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setActiveTab('maintenance')}
        >
          <Wrench size={15} />
          Báo hỏng / Sửa chữa
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', gap: '24px', fontSize: '13px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'none',
            fontWeight: activeTab === 'overview' ? 600 : 400,
            color: activeTab === 'overview' ? '#00594C' : '#6B7280',
            borderBottom: activeTab === 'overview' ? '2px solid #00594C' : 'none',
            cursor: 'pointer',
          }}
        >
          Tổng quan & Hóa đơn tháng
        </button>
        <button
          onClick={() => setActiveTab('utilities')}
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'none',
            fontWeight: activeTab === 'utilities' ? 600 : 400,
            color: activeTab === 'utilities' ? '#00594C' : '#6B7280',
            borderBottom: activeTab === 'utilities' ? '2px solid #00594C' : 'none',
            cursor: 'pointer',
          }}
        >
          Chỉ số Điện & Nước
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'none',
            fontWeight: activeTab === 'maintenance' ? 600 : 400,
            color: activeTab === 'maintenance' ? '#00594C' : '#6B7280',
            borderBottom: activeTab === 'maintenance' ? '2px solid #00594C' : 'none',
            cursor: 'pointer',
          }}
        >
          Yêu cầu bảo trì ({tenantTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('contract')}
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'none',
            fontWeight: activeTab === 'contract' ? 600 : 400,
            color: activeTab === 'contract' ? '#00594C' : '#6B7280',
            borderBottom: activeTab === 'contract' ? '2px solid #00594C' : 'none',
            cursor: 'pointer',
          }}
        >
          Hợp đồng & Tiền cọc
        </button>
      </div>

      {/* TAB 1: OVERVIEW & INVOICE */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
          {/* Invoice Detail */}
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>HÓA ĐƠN THÁNG 03/2024</span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {tenantInvoice?.code || 'INV-2403-01'}
                </h3>
              </div>
              <span className={`rf-badge ${invoicePaid ? 'rf-badge-active' : 'rf-badge-warning'}`}>
                {invoicePaid ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN (HẠN 05/03)'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#4B5563' }}>Tiền thuê phòng:</span>
                <span style={{ fontWeight: 600 }}>{formatVND(tenantInvoice?.roomFee || 4200000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#4B5563' }}>Tiền điện (90 kWh x 3.800đ):</span>
                <span>{formatVND(tenantInvoice?.electricFee || 360000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#4B5563' }}>Tiền nước (6 m³ x 20.000đ):</span>
                <span>{formatVND(tenantInvoice?.waterFee || 120000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#4B5563' }}>Phí quản lý & dịch vụ rác:</span>
                <span>{formatVND(tenantInvoice?.serviceFee || 150000)}</span>
              </div>
            </div>

            <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>
                {invoicePaid ? 'Tổng tiền đã thanh toán:' : 'Số tiền cần thanh toán:'}
              </span>
              <strong style={{ fontSize: '20px', color: invoicePaid ? '#137333' : '#DC2626' }}>
                {formatVND(paymentAmount)}
              </strong>
            </div>

            {invoicePaid ? (
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
                <span>Hóa đơn kỳ này đã được thanh toán hoàn tất và gạch nợ thành công!</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  style={{ flex: 1, padding: '10px 16px', fontSize: '13px', fontWeight: 600 }}
                  onClick={() => setShowQRModal(true)}
                >
                  <QrCode size={16} />
                  <span>Quét mã VietQR trả tiền ngay</span>
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  onClick={() => toast.info('Đang tải hóa đơn PDF...', 'Tệp đã sẵn sàng tải về thiết bị.')}
                >
                  <Download size={14} />
                  In biên lai
                </button>
              </div>
            )}
          </div>

          {/* Quick Info & Landlord Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="rf-card">
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 10px 0' }}>
                Thông tin chủ nhà & Tài khoản nhận tiền
              </h4>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Chủ nhà:</strong> {savedLandlordAuth.accountHolder}</div>
                <div><strong>Hotline:</strong> 0988 123 456</div>
                <div><strong>Email nhận báo có:</strong> {savedLandlordAuth.notificationEmail}</div>
                <div><strong>Ngân hàng:</strong> {savedLandlordAuth.bankName}</div>
                <div><strong>Số tài khoản:</strong> {savedLandlordAuth.accountNumber}</div>
              </div>
            </div>

            <div className="rf-card" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#137333', fontWeight: 600, fontSize: '13px' }}>
                <ShieldCheck size={16} /> Tiền cọc giữ chỗ an toàn
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#137333', marginTop: '6px' }}>
                {formatVND(tenantContract?.depositAmount || 4200000)}
              </div>
              <p style={{ fontSize: '11px', color: '#166534', margin: '4px 0 0 0' }}>
                Khoản cọc được bảo chứng trong hợp đồng {tenantContract?.id || 'CT-2023-041'}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UTILITIES HISTORY */}
      {activeTab === 'utilities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Lịch sử chỉ số Điện & Nước phòng {user?.roomCode || 'P.101'}
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Minh bạch các kỳ ghi nhận thực tế từ công tơ</span>
              </div>
              <button
                className="rf-btn rf-btn-secondary"
                style={{ fontSize: '12px' }}
                onClick={() => toast.info('Yêu cầu kiểm tra', 'Đã chuyển phản ánh chỉ số đồng hồ tới chủ nhà.')}
              >
                Báo chỉ số bất thường
              </button>
            </div>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Kỳ ghi nhận</th>
                  <th>Điện (Cũ - Mới)</th>
                  <th>Tiêu thụ Điện</th>
                  <th>Nước (Cũ - Mới)</th>
                  <th>Tiêu thụ Nước</th>
                  <th>Tổng tiền dịch vụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Tháng 03/2024</td>
                  <td>1,240 - 1,330 kWh</td>
                  <td><strong>90 kWh</strong> (342.000 đ)</td>
                  <td>42 - 48 m³</td>
                  <td><strong>6 m³</strong> (120.000 đ)</td>
                  <td style={{ fontWeight: 600, color: '#00594C' }}>462.000 đ</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Tháng 02/2024</td>
                  <td>1,155 - 1,240 kWh</td>
                  <td><strong>85 kWh</strong> (323.000 đ)</td>
                  <td>37 - 42 m³</td>
                  <td><strong>5 m³</strong> (100.000 đ)</td>
                  <td style={{ fontWeight: 600, color: '#00594C' }}>423.000 đ</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Tháng 01/2024</td>
                  <td>1,060 - 1,155 kWh</td>
                  <td><strong>95 kWh</strong> (361.000 đ)</td>
                  <td>31 - 37 m³</td>
                  <td><strong>6 m³</strong> (120.000 đ)</td>
                  <td style={{ fontWeight: 600, color: '#00594C' }}>481.000 đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MAINTENANCE REQUESTS */}
      {activeTab === 'maintenance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
              Gửi yêu cầu sửa chữa thiết bị
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Chủ nhà sẽ nhận thông báo ngay lập tức và điều phối thợ đến kiểm tra.
            </p>

            {reported && (
              <div style={{ padding: '10px 14px', backgroundColor: '#E6F4EA', color: '#137333', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>
                ✓ Đã gửi yêu cầu thành công! Thợ kỹ thuật sẽ liên hệ trong ít phút.
              </div>
            )}

            <form onSubmit={handleMaintenanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Danh mục hư hỏng *
                </label>
                <select
                  value={reportedCategory}
                  onChange={(e) => setReportedCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#fff' }}
                >
                  <option>Nước (Vòi sen, bồn cầu, lavabo)</option>
                  <option>Điện (Bóng đèn, ổ cắm)</option>
                  <option>Điều hòa / Máy lạnh</option>
                  <option>Nội thất (Giường, tủ, khóa cửa)</option>
                  <option>Khác</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Tiêu đề sự cố *
                </label>
                <input
                  type="text"
                  value={reportedTitle}
                  onChange={(e) => setReportedTitle(e.target.value)}
                  placeholder="VD: Máy lạnh chảy nước, bóng đèn ban công tắt..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={3}
                  value={reportedDesc}
                  onChange={(e) => setReportedDesc(e.target.value)}
                  placeholder="Mô tả cụ thể để thợ mang sẵn dụng cụ phù hợp..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="rf-btn rf-btn-primary"
                style={{ alignSelf: 'flex-start', padding: '10px 20px' }}
              >
                Gửi yêu cầu tới chủ nhà
              </button>
            </form>
          </div>

          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
              Lịch sử các yêu cầu ({tenantTickets.length})
            </h4>
            {tenantTickets.map((t) => (
              <div key={t.id} style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#00594C' }}>{t.id}</span>
                  <span className="rf-badge rf-badge-active">{t.status === 'completed' ? 'Đã sửa xong' : 'Đang xử lý'}</span>
                </div>
                <div style={{ fontWeight: 600, marginTop: '6px', color: '#111827' }}>{t.title}</div>
                <div style={{ color: '#6B7280', marginTop: '4px' }}>Thợ: {t.assignee || 'Đang điều phối'} • {t.createdAt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONTRACT & DEPOSIT */}
      {activeTab === 'contract' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>HỢP ĐỒNG THUÊ PHÒNG</span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {tenantContract?.id || 'CT-2023-041'}
                </h3>
              </div>
              <span className="rf-badge rf-badge-active">Đang hiệu lực</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Thời hạn thuê:</span>
                <span>{tenantContract?.startDate} đến {tenantContract?.endDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Tiền phòng cố định:</span>
                <strong style={{ color: '#111827' }}>{formatVND(tenantContract?.monthlyRent || 4200000)} / tháng</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Tiền cọc bảo chứng:</span>
                <strong style={{ color: '#137333' }}>{formatVND(tenantContract?.depositAmount || 4200000)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#6B7280' }}>Kỳ thu tiền phòng:</span>
                <span>Hàng tháng (từ ngày 01 đến 05)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                className="rf-btn rf-btn-secondary"
                style={{ flex: 1 }}
                onClick={() => toast.info('Đã gửi đề nghị gia hạn', 'Chủ nhà sẽ nhận thông tin để thống nhất phụ lục gia hạn.')}
              >
                Gửi đề nghị gia hạn hợp đồng
              </button>
              <button
                className="rf-btn rf-btn-secondary"
                style={{ flex: 1, color: '#C5221F' }}
                onClick={() => toast.info('Gửi thông báo trả phòng', 'Đã chuyển thông tin trả phòng dự kiến tới chủ nhà.')}
              >
                Đề nghị trả phòng trước hạn
              </button>
            </div>
          </div>

          <div className="rf-card">
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 10px 0' }}>
              Quy chế khu trọ & Trách nhiệm
            </h4>
            <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>• Không gây tiếng ồn lớn sau 22h30 đêm.</div>
              <div>• Khóa cổng và cửa phòng cẩn thận khi ra vào.</div>
              <div>• Báo trước ít nhất 30 ngày trước khi trả phòng để quyết toán cọc.</div>
              <div>• Giữ gìn vệ sinh chung khu vực hành lang và thang máy.</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIETQR PAYMENT MODAL WITH EMAIL NOTIFICATION SIMULATION */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Thanh toán tiền phòng qua VietQR"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '460px' }}>
          {paymentSuccess ? (
            /* Success State */
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
                Giao dịch đã được ghi nhận trên hệ thống RentFlow. Hóa đơn phòng {user?.roomCode || 'P.101'} kỳ Tháng 03/2024 đã được gạch nợ.
              </p>

              {/* Email Notification Simulation Box */}
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
                  <div>• <strong>Tiêu đề:</strong> [RentFlow] Nhận thanh toán tiền phòng {user?.roomCode || 'P.101'} - {formatVND(paymentAmount)}</div>
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
            /* QR Display & Instructions */
            <>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Quét mã bằng bất kỳ ứng dụng Ngân hàng nào</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#00594C', margin: '4px 0' }}>
                  {formatVND(paymentAmount)}
                </div>
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
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <img
                    src={qrUrl}
                    alt="VietQR Rent Payment"
                    style={{ width: '220px', height: '220px', display: 'block', objectFit: 'contain' }}
                    onError={(e) => {
                      // Fallback if external image service has connectivity limit
                      e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(`2|99|${savedLandlordAuth.accountNumber}|${savedLandlordAuth.accountHolder}|${savedLandlordAuth.bankName}|0|0|${paymentAmount}|${transferContent}`);
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} color="#00594C" />
                  Chuẩn VietQR liên ngân hàng NAPAS247
                </div>
              </div>

              {/* Bank Transfer Details with Copy Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>Ngân hàng thụ hưởng</span>
                    <strong style={{ color: '#111827' }}>{savedLandlordAuth.bankName}</strong>
                  </div>
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => handleCopy(savedLandlordAuth.bankName, 'Ngân hàng')}
                  >
                    <Copy size={12} />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>Số tài khoản chủ nhà</span>
                    <strong style={{ color: '#00594C', fontSize: '15px' }}>{savedLandlordAuth.accountNumber}</strong>
                  </div>
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => handleCopy(savedLandlordAuth.accountNumber, 'Số tài khoản')}
                  >
                    <Copy size={12} />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>Chủ tài khoản</span>
                    <strong style={{ color: '#111827' }}>{savedLandlordAuth.accountHolder}</strong>
                  </div>
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => handleCopy(savedLandlordAuth.accountHolder, 'Tên chủ TK')}
                  >
                    <Copy size={12} />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#FEF3C7',
                    borderRadius: '6px',
                    border: '1px solid #FDE68A',
                  }}
                >
                  <div>
                    <span style={{ color: '#92400E', fontSize: '11px', display: 'block' }}>Nội dung chuyển khoản (bắt buộc)</span>
                    <strong style={{ color: '#B45309', fontSize: '14px' }}>{transferContent}</strong>
                  </div>
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => handleCopy(transferContent, 'Nội dung chuyển khoản')}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {/* Automated Email Notice */}
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#F0FDF4',
                  borderRadius: '6px',
                  border: '1px solid #BBF7D0',
                  fontSize: '12px',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Mail size={15} />
                <span>
                  Sau khi quét mã, hệ thống Webhook ngân hàng sẽ tự gạch nợ và <strong>gửi email thông báo</strong> ngay cho chủ nhà <em>({savedLandlordAuth.notificationEmail})</em>.
                </span>
              </div>

              {/* Action Buttons & Simulation */}
              <div style={{ display: 'flex', gap: '10px' }}>
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
                  style={{ flex: 2, padding: '10px', fontSize: '13px' }}
                  onClick={handleSimulateBankSuccess}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <span>Đang xác nhận với ngân hàng...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Xác nhận đã chuyển tiền thành công</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
