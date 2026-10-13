import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Wrench,
  ShieldCheck,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { formatVND, mockInvoices, mockMaintenance, mockContracts } from '@/lib/mockData';

export const TenantOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tenantInvoice = mockInvoices[0];
  const tenantTickets = mockMaintenance.filter((m) => m.roomCode === (user?.roomCode || 'P.101'));
  const tenantContract = mockContracts.find((c) => c.roomCode === (user?.roomCode || 'P.101')) || mockContracts[0];

  const hasUnpaidInvoice = tenantInvoice && tenantInvoice.debtAmount > 0;

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Tenant Greeting & Property Banner */}
      <div
        className="rf-card"
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-active">Cổng cư dân RentFlow</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#00594C' }}>
              Phòng {user?.roomCode || 'P.101'}
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '6px 0 2px 0' }}>
            Xin chào, {user?.name || 'Lê Hoàng Nam'}! 👋
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Cơ sở: <strong>{user?.organizationName || 'Nhà trọ Hưng Phát'}</strong></span>
            <span>•</span>
            <span>Hợp đồng: <strong>{tenantContract?.id}</strong> (Hiệu lực đến {tenantContract?.endDate})</span>
          </p>
        </div>

        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => navigate('/tenant/maintenance?new=true')}
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Wrench size={15} />
          <span>Báo hỏng / Sửa chữa</span>
        </button>
      </div>

      {/* 2. Key Metrics & Action Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {/* Card 1: Tiền phòng & Hạn đóng */}
        <div
          className="rf-card"
          onClick={() => navigate('/tenant/invoices')}
          style={{
            padding: '18px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            border: hasUnpaidInvoice ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
            backgroundColor: hasUnpaidInvoice ? '#FEF2F2' : '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>HÓA ĐƠN THÁNG</span>
            <CreditCard size={18} color={hasUnpaidInvoice ? '#DC2626' : '#00594C'} />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: hasUnpaidInvoice ? '#DC2626' : '#111827', marginTop: '8px' }}>
            {formatVND(tenantInvoice?.totalAmount || 4830000)}
          </div>
          <div style={{ fontSize: '12px', color: hasUnpaidInvoice ? '#B91C1C' : '#059669', marginTop: '4px', fontWeight: 500 }}>
            {hasUnpaidInvoice ? `Hạn thanh toán: ${tenantInvoice?.dueDate || '05/03/2024'}` : '✓ Đã thanh toán đầy đủ'}
          </div>
        </div>

        {/* Card 2: Tiêu thụ Điện Nước */}
        <div
          className="rf-card"
          onClick={() => navigate('/tenant/utilities')}
          style={{ padding: '18px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>ĐIỆN & NƯỚC KỲ NÀY</span>
            <Zap size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginTop: '8px' }}>
            90 kWh • 6 m³
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            Tiền dịch vụ: {formatVND(462000)}
          </div>
        </div>

        {/* Card 3: Yêu cầu bảo trì */}
        <div
          className="rf-card"
          onClick={() => navigate('/tenant/maintenance')}
          style={{ padding: '18px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>BẢO TRÌ PHÒNG</span>
            <Wrench size={18} color="#00594C" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginTop: '8px' }}>
            {tenantTickets.filter((t) => t.status !== 'completed').length} sự cố
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            {tenantTickets.length} lịch sử sửa chữa
          </div>
        </div>

        {/* Card 4: Tiền cọc bảo chứng */}
        <div
          className="rf-card"
          onClick={() => navigate('/tenant/lease')}
          style={{ padding: '18px', cursor: 'pointer', backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#166534' }}>CỌC BẢO CHỨNG</span>
            <ShieldCheck size={18} color="#166534" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#166534', marginTop: '8px' }}>
            {formatVND(tenantContract?.depositAmount || 4200000)}
          </div>
          <div style={{ fontSize: '12px', color: '#15803D', marginTop: '4px' }}>
            Bảo toàn trong hợp đồng
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Left Column: Recent Invoice Summary & Utility Quick Peek */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Recent Invoice Card */}
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Hóa đơn tiền phòng gần nhất ({tenantInvoice?.period || 'Tháng 03/2024'})
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Mã phiếu thu: {tenantInvoice?.code}</span>
              </div>
              <Link
                to={tenantInvoice ? `/tenant/invoices/${tenantInvoice.id}` : "/tenant/invoices"}
                style={{ fontSize: '13px', fontWeight: 600, color: '#00594C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Xem chi tiết hóa đơn</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
              <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Tiền thuê phòng cố định</span>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                  {formatVND(tenantInvoice?.roomFee || 4200000)}
                </div>
              </div>
              <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Điện sinh hoạt (90 kWh)</span>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                  {formatVND(tenantInvoice?.electricFee || 360000)}
                </div>
              </div>
              <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Nước sinh hoạt (6 m³)</span>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                  {formatVND(tenantInvoice?.waterFee || 120000)}
                </div>
              </div>
              <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Phí quản lý & dịch vụ</span>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                  {formatVND(tenantInvoice?.serviceFee || 150000)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #E5E7EB' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Tổng số tiền cần trả kỳ này:</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#00594C' }}>
                  {formatVND(tenantInvoice?.totalAmount || 4830000)}
                </div>
              </div>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => navigate(tenantInvoice ? `/tenant/invoices/${tenantInvoice.id}` : '/tenant/invoices')}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Mở hóa đơn & Quét VietQR
              </button>
            </div>
          </div>

          {/* Recent Maintenance Requests */}
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Yêu cầu sửa chữa gần đây ({tenantTickets.length})
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Tiến độ xử lý sự cố thiết bị tại phòng</span>
              </div>
              <Link
                to="/tenant/maintenance"
                style={{ fontSize: '13px', fontWeight: 600, color: '#00594C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Tất cả yêu cầu</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tenantTickets.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/tenant/maintenance')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#111827' }}>{t.title}</strong>
                      <span className="rf-badge rf-badge-active" style={{ fontSize: '11px' }}>
                        {t.status === 'completed' ? 'Đã sửa xong' : 'Đang xử lý'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      Danh mục: {t.category} • Ngày gửi: {t.createdAt} • Thợ: {t.assignee || 'Đang điều phối'}
                    </div>
                  </div>
                  <ArrowRight size={14} color="#9CA3AF" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Landlord Contacts, Quick Info & Notice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Landlord Contact & Support */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>
              Thông tin chủ nhà & Ban quản lý
            </h4>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Chủ cơ sở:</strong> Nguyễn An</div>
              <div><strong>Hotline khẩn cấp:</strong> 0988 123 456</div>
              <div><strong>Email hỗ trợ:</strong> nguyenan.property@gmail.com</div>
              <div><strong>Ngân hàng thụ hưởng:</strong> Techcombank - 190345678901</div>
            </div>
          </div>

          {/* Quick Rules & Reminder */}
          <div className="rf-card" style={{ padding: '20px', backgroundColor: '#F8FAFC' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 10px 0' }}>
              Nội quy & Lưu ý quan trọng
            </h4>
            <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>• Thu tiền phòng định kỳ từ ngày 01 đến 05 hàng tháng.</div>
              <div>• Đóng cửa cổng và khóa xe cẩn thận sau 23h00.</div>
              <div>• Báo trước tối thiểu 30 ngày nếu có kế hoạch trả phòng để quyết toán cọc.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
