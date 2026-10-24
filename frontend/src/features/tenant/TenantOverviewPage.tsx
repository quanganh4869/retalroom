import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { formatVND, mockInvoices, mockMaintenance } from '@/lib/mockData';
import { StackedBarChart } from '@/components/ui/DashboardCharts';

export const TenantOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tenantInvoice = mockInvoices[0];
  const tenantTickets = mockMaintenance.filter((m) => m.roomCode === (user?.roomCode || 'P.101'));

  const hasUnpaidInvoice = tenantInvoice && tenantInvoice.debtAmount > 0;

  // Monthly Living Cost Breakdown for Tenant (6 months of actual living expenses)
  const tenantMonthlyCosts = [
    {
      label: 'T10',
      segments: [
        { name: 'Tiền phòng', value: 4200000, color: '#00594C' },
        { name: 'Tiền điện', value: 340000, color: '#F59E0B' },
        { name: 'Tiền nước', value: 120000, color: '#0284C7' },
        { name: 'Phí dịch vụ', value: 150000, color: '#64748B' },
      ],
    },
    {
      label: 'T11',
      segments: [
        { name: 'Tiền phòng', value: 4200000, color: '#00594C' },
        { name: 'Tiền điện', value: 380000, color: '#F59E0B' },
        { name: 'Tiền nước', value: 140000, color: '#0284C7' },
        { name: 'Phí dịch vụ', value: 150000, color: '#64748B' },
      ],
    },
    {
      label: 'T12',
      segments: [
        { name: 'Tiền phòng', value: 4200000, color: '#00594C' },
        { name: 'Tiền điện', value: 410000, color: '#F59E0B' },
        { name: 'Tiền nước', value: 140000, color: '#0284C7' },
        { name: 'Phí dịch vụ', value: 150000, color: '#64748B' },
      ],
    },
    {
      label: 'T01',
      segments: [
        { name: 'Tiền phòng', value: 4200000, color: '#00594C' },
        { name: 'Tiền điện', value: 320000, color: '#F59E0B' },
        { name: 'Tiền nước', value: 100000, color: '#0284C7' },
        { name: 'Phí dịch vụ', value: 150000, color: '#64748B' },
      ],
    },
    {
      label: 'T02',
      segments: [
        { name: 'Tiền phòng', value: 4200000, color: '#00594C' },
        { name: 'Tiền điện', value: 350000, color: '#F59E0B' },
        { name: 'Tiền nước', value: 120000, color: '#0284C7' },
        { name: 'Phí dịch vụ', value: 150000, color: '#64748B' },
      ],
    },
    {
      label: 'T03 (Kỳ này)',
      segments: [
        { name: 'Tiền phòng', value: tenantInvoice?.roomFee || 4200000, color: '#00594C' },
        { name: 'Tiền điện', value: tenantInvoice?.electricFee || 360000, color: '#F59E0B' },
        { name: 'Tiền nước', value: tenantInvoice?.waterFee || 120000, color: '#0284C7' },
        { name: 'Phí dịch vụ', value: tenantInvoice?.serviceFee || 150000, color: '#64748B' },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Tenant Greeting & Header Banner */}
      <div
        className="rf-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-active" style={{ fontWeight: 700 }}>Tổng quan</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#00594C' }}>
              Phòng {user?.roomCode || 'P.101'} • {user?.organizationName || 'Nhà trọ Hưng Phát'}
            </span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '6px 0 0 0' }}>
            Xin chào, {user?.name || 'Lê Hoàng Nam'}!
          </h1>
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

      {/* 2. Top 4 Core Personal KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {/* KPI 1: Hóa đơn tháng gần nhất */}
        <div
          className="rf-card"
          onClick={() => navigate('/tenant/invoices')}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            border: hasUnpaidInvoice ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
            backgroundColor: hasUnpaidInvoice ? '#FEF2F2' : '#FFFFFF',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = hasUnpaidInvoice ? '#DC2626' : '#00594C')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = hasUnpaidInvoice ? '#FCA5A5' : '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Hóa đơn tháng gần nhất
            </span>
            <CreditCard size={18} color={hasUnpaidInvoice ? '#DC2626' : '#00594C'} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: hasUnpaidInvoice ? '#DC2626' : '#111827', marginTop: '8px', letterSpacing: '-0.4px' }}>
            {formatVND(tenantInvoice?.totalAmount || 4830000)}
          </div>
          <div style={{ fontSize: '12px', color: hasUnpaidInvoice ? '#B91C1C' : '#059669', marginTop: '6px', fontWeight: 600 }}>
            {hasUnpaidInvoice ? `Hạn thanh toán: ${tenantInvoice?.dueDate || '05/03/2024'}` : '✓ Đã thanh toán đầy đủ'}
          </div>
        </div>

        {/* KPI 2: Kỳ thanh toán tiếp theo */}
        <div
          className="rf-card"
          onClick={() => navigate('/tenant/invoices')}
          style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Kỳ thanh toán
            </span>
            <Calendar size={18} color="#00594C" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '8px', letterSpacing: '-0.4px' }}>
            {tenantInvoice?.period || 'Tháng 03/2024'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} color="#D97706" />
            <span>Thu định kỳ ngày 01-05 hàng tháng</span>
          </div>
        </div>

        {/* KPI 3: Lịch sử thanh toán gần nhất */}
        <div
          className="rf-card"
          onClick={() => navigate('/tenant/payments')}
          style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Đã đóng kỳ trước
            </span>
            <CheckCircle2 size={18} color="#16A34A" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '8px', letterSpacing: '-0.4px' }}>
            {formatVND(4810000)}
          </div>
          <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '6px', fontWeight: 600 }}>
            ✓ Kỳ Tháng 02/2024 (Đã đối soát)
          </div>
        </div>

        {/* KPI 4: Yêu cầu bảo trì phòng */}
        <div
          className="rf-card"
          onClick={() => navigate('/tenant/maintenance')}
          style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Bảo trì & Sửa chữa
            </span>
            <Wrench size={18} color="#00594C" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '8px', letterSpacing: '-0.4px' }}>
            {tenantTickets.filter((t) => t.status !== 'completed').length} sự cố
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
            {tenantTickets.length} phiếu sửa chữa đã ghi nhận
          </div>
        </div>
      </div>

      {/* 3. Main Analytical Chart: Monthly Living Costs (6 months breakdown) */}
      <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Biến động chi phí thuê phòng 6 tháng gần nhất
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
              Chi tiết các khoản cấu thành tiền phòng, điện, nước và phí dịch vụ phát sinh theo từng kỳ
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/tenant/utilities')}
            style={{ background: 'none', border: 'none', color: '#00594C', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
          >
            Xem lịch sử chỉ số điện nước →
          </button>
        </div>

        <StackedBarChart
          data={tenantMonthlyCosts}
          height={240}
          valueFormatter={(val) => formatVND(val)}
          yAxisTitle="Tổng chi phí phát sinh"
        />
      </div>
    </div>
  );
};
