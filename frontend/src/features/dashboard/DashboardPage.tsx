import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp,
  AlertCircle,
  Wrench,
  Building2,
} from 'lucide-react';
import { formatVND, mockProperties, mockMaintenance } from '@/lib/mockData';
import { GroupedBarChart, DonutDistributionChart } from '@/components/ui/DashboardCharts';

export const DashboardPage: React.FC = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');

  // Compute metrics based on selected property
  const activeProperties = selectedPropertyId === 'all'
    ? mockProperties
    : mockProperties.filter((p) => p.id === selectedPropertyId);

  const totalRooms = activeProperties.reduce((sum, p) => sum + p.totalRooms, 0);
  const rentedRooms = activeProperties.reduce((sum, p) => sum + p.rentedRooms, 0);
  const vacantRooms = totalRooms - rentedRooms;
  const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 1000) / 10 : 0;

  // Financial calculations
  const targetRevenue = activeProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const actualRevenue = Math.round(targetRevenue * 0.79);
  const collectionRate = targetRevenue > 0 ? Math.round((actualRevenue / targetRevenue) * 100) : 0;
  const overdueDebt = targetRevenue - actualRevenue;

  // Urgent action items counts
  const overdueInvoicesCount = 3;
  const urgentTickets = mockMaintenance.filter((m) => m.priority === 'urgent' || m.priority === 'high');
  const totalUrgentTasks = overdueInvoicesCount + urgentTickets.length + 1; // +1 expiring lease

  // Room status distribution for secondary chart
  const maintenanceRooms = Math.min(3, Math.max(1, Math.round(vacantRooms * 0.2)));
  const availableVacantRooms = Math.max(0, vacantRooms - maintenanceRooms);

  const roomDonutSegments = [
    { label: 'Đang cho thuê', value: rentedRooms, color: '#00594C' },
    { label: 'Phòng trống sẵn sàng', value: availableVacantRooms, color: '#10B981' },
    { label: 'Bảo trì / Chuẩn bị', value: maintenanceRooms, color: '#F59E0B' },
  ];

  // Grouped Bar chart: Actual collected vs Invoiced Target over 6 months
  const monthlyRevenueData = [
    {
      label: 'T05',
      series: [
        { name: 'Thực thu', value: Math.round(targetRevenue * 0.92 / 1000000), color: '#00594C' },
        { name: 'Kế hoạch', value: Math.round(targetRevenue * 0.95 / 1000000), color: '#93C5FD' },
      ],
    },
    {
      label: 'T06',
      series: [
        { name: 'Thực thu', value: Math.round(targetRevenue * 0.95 / 1000000), color: '#00594C' },
        { name: 'Kế hoạch', value: Math.round(targetRevenue * 0.96 / 1000000), color: '#93C5FD' },
      ],
    },
    {
      label: 'T07',
      series: [
        { name: 'Thực thu', value: Math.round(targetRevenue * 0.97 / 1000000), color: '#00594C' },
        { name: 'Kế hoạch', value: Math.round(targetRevenue * 0.98 / 1000000), color: '#93C5FD' },
      ],
    },
    {
      label: 'T08',
      series: [
        { name: 'Thực thu', value: Math.round(targetRevenue * 0.94 / 1000000), color: '#00594C' },
        { name: 'Kế hoạch', value: Math.round(targetRevenue * 0.98 / 1000000), color: '#93C5FD' },
      ],
    },
    {
      label: 'T09',
      series: [
        { name: 'Thực thu', value: Math.round(targetRevenue * 0.96 / 1000000), color: '#00594C' },
        { name: 'Kế hoạch', value: Math.round(targetRevenue / 1000000), color: '#93C5FD' },
      ],
    },
    {
      label: 'T10 (Nay)',
      series: [
        { name: 'Thực thu', value: Math.round(actualRevenue / 1000000), color: '#00594C' },
        { name: 'Kế hoạch', value: Math.round(targetRevenue / 1000000), color: '#93C5FD' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1360px', margin: '0 auto' }}>
      {/* 1. Header with Context, Welcome & Quick Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: '#FFFFFF',
          padding: '18px 24px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
            Chào buổi sáng, Nguyễn An
          </h1>
        </div>
      </div>

      {/* 2. Operational Filters: Property Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} color="#00594C" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Bất động sản:</span>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              fontWeight: 600,
              color: '#111827',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả bất động sản ({mockProperties.length} cơ sở - {totalRooms} phòng)</option>
            {mockProperties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.totalRooms} phòng)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Top 4 Core Operational KPIs (Directly Linked) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* KPI 1: Tỷ lệ lấp đầy phòng */}
        <NavLink
          to={selectedPropertyId === 'all' ? '/rooms?status=vacant' : `/rooms?propertyId=${selectedPropertyId}&status=vacant`}
          className="rf-card"
          style={{ padding: '18px 20px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Tỷ lệ lấp đầy phòng</span>
            <span style={{ fontSize: '11px', color: '#137333', backgroundColor: '#E6F4EA', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              +4.2% so với T9
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827', marginTop: '8px', letterSpacing: '-0.5px' }}>
            {occupancyRate}%
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
              <span>{rentedRooms}/{totalRooms} phòng có khách</span>
              <span style={{ color: '#00594C', fontWeight: 700 }}>{vacantRooms} phòng trống →</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, occupancyRate)}%`, height: '100%', backgroundColor: '#00594C', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </NavLink>

        {/* KPI 2: Tiền thực thu trong kỳ */}
        <NavLink
          to="/payments"
          className="rf-card"
          style={{ padding: '18px 20px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Tiền thực thu trong kỳ</span>
            <TrendingUp size={16} color="#00594C" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827', marginTop: '8px', letterSpacing: '-0.5px' }}>
            {formatVND(actualRevenue)}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Đạt <strong>{collectionRate}%</strong> mục tiêu</span>
            <span style={{ color: '#00594C', fontWeight: 700 }}>Xem sổ thu →</span>
          </div>
        </NavLink>

        {/* KPI 3: Công nợ tồn đọng */}
        <NavLink
          to="/invoices?status=overdue"
          className="rf-card"
          style={{ padding: '18px 20px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C5221F')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Nợ tiền phòng & dịch vụ</span>
            <AlertCircle size={16} color="#C5221F" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#C5221F', marginTop: '8px', letterSpacing: '-0.5px' }}>
            {formatVND(overdueDebt)}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#C5221F', fontWeight: 600 }}>Từ 3 hóa đơn quá hạn</span>
            <span style={{ color: '#C5221F', fontWeight: 700 }}>Thu nợ →</span>
          </div>
        </NavLink>

        {/* KPI 4: Tác vụ bảo trì & sửa chữa */}
        <NavLink
          to="/maintenance"
          className="rf-card"
          style={{ padding: '18px 20px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#D97706')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Tác vụ cần xử lý ngay</span>
            <Wrench size={16} color="#D97706" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827', marginTop: '8px', letterSpacing: '-0.5px' }}>
            {totalUrgentTasks}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px', display: 'flex', gap: '6px' }}>
            <span style={{ color: '#C5221F', fontWeight: 700 }}>1 việc khẩn</span>
            <span>• 3 việc chờ xử lý</span>
          </div>
        </NavLink>
      </div>

      {/* 4. Main Analytics Charts: Monthly Collections & Occupancy Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '20px' }}>
        {/* Main Chart: Grouped Bar Chart comparing Collected vs Invoiced Target */}
        <div className="rf-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Tình hình thu tiền 6 tháng gần nhất
                </h3>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#00594C', backgroundColor: '#E6F4EA', padding: '2px 8px', borderRadius: '12px' }}>
                  Đối soát định kỳ
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                So sánh số tiền thực tế đã thu với doanh thu lập hóa đơn kế hoạch (Đơn vị: triệu VNĐ)
              </p>
            </div>
          </div>

          <GroupedBarChart
            data={monthlyRevenueData}
            height={240}
            valueFormatter={(val) => `${val} tr đ`}
            yAxisTitle="Doanh thu (triệu đồng)"
          />
        </div>

        {/* Secondary Chart: Room Status Breakdown */}
        <div className="rf-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Cơ cấu trạng thái phòng
              </h3>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#1E40AF', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '12px' }}>
                {totalRooms} phòng
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
              Phân bổ số lượng phòng có khách, phòng trống và phòng đang bảo trì
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <DonutDistributionChart
              segments={roomDonutSegments}
              centerValue={`${occupancyRate}%`}
              centerLabel="Tỷ lệ lấp đầy"
              size={175}
            />
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280' }}>
            <span>Phòng trống sẵn sàng: <strong style={{ color: '#10B981' }}>{availableVacantRooms} phòng</strong></span>
            <span>Bảo trì: <strong style={{ color: '#F59E0B' }}>{maintenanceRooms} phòng</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
