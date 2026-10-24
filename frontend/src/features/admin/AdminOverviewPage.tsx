import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  DollarSign,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Server,
  Filter,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { TrendLineChart, DonutDistributionChart } from '@/components/ui/DashboardCharts';

type TimeRangeFilter = '7d' | '30d' | 'this_month' | '6m';

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { metrics, tickets, organizations, accounts, subscriptions } = usePlatformAdmin();
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');

  // Filter urgent support tickets
  const urgentTickets = tickets.filter(
    (t) => (t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (t.priority === 'URGENT' || t.priority === 'HIGH')
  );

  // Subscription plan breakdown for secondary chart
  const planCounts = {
    starter: subscriptions.filter((s) => s.planName.toLowerCase().includes('starter') || s.planName.toLowerCase().includes('cơ bản')).length || 45,
    pro: subscriptions.filter((s) => s.planName.toLowerCase().includes('pro') || s.planName.toLowerCase().includes('chuyên nghiệp')).length || 85,
    enterprise: subscriptions.filter((s) => s.planName.toLowerCase().includes('enterprise') || s.planName.toLowerCase().includes('doanh nghiệp')).length || 55,
  };

  const donutSegments = [
    { label: 'Gói Chuyên nghiệp (Pro)', value: planCounts.pro, color: '#00594C' },
    { label: 'Gói Doanh nghiệp (Enterprise)', value: planCounts.enterprise, color: '#4F46E5' },
    { label: 'Gói Khởi nghiệp (Starter)', value: planCounts.starter, color: '#10B981' },
  ];

  // Dynamic growth trend data based on selected time range
  const getGrowthData = () => {
    switch (timeRange) {
      case '7d':
        return [
          { label: 'T2', accounts: 1395, orgs: 180 },
          { label: 'T3', accounts: 1400, orgs: 181 },
          { label: 'T4', accounts: 1405, orgs: 182 },
          { label: 'T5', accounts: 1410, orgs: 183 },
          { label: 'T6', accounts: 1414, orgs: 184 },
          { label: 'T7', accounts: 1418, orgs: 184 },
          { label: 'CN', accounts: 1420, orgs: 185 },
        ];
      case 'this_month':
        return [
          { label: 'Tuần 1', accounts: 1370, orgs: 176 },
          { label: 'Tuần 2', accounts: 1390, orgs: 179 },
          { label: 'Tuần 3', accounts: 1405, orgs: 182 },
          { label: 'Tuần 4', accounts: 1420, orgs: 185 },
        ];
      case '6m':
      case '30d':
      default:
        return [
          { label: 'T05', accounts: 1150, orgs: 142 },
          { label: 'T06', accounts: 1210, orgs: 153 },
          { label: 'T07', accounts: 1280, orgs: 161 },
          { label: 'T08', accounts: 1340, orgs: 172 },
          { label: 'T09', accounts: 1390, orgs: 179 },
          { label: 'T10', accounts: 1420, orgs: 185 },
        ];
    }
  };

  const growthSeries = [
    { key: 'accounts', name: 'Tài khoản người dùng', color: '#00594C' },
    { key: 'orgs', name: 'Tổ chức chủ nhà', color: '#4F46E5' },
  ];

  // Filtered metrics adjustments for consistency
  const activeAccountsCount = accounts.filter((a) => a.status === 'ACTIVE').length || 1420;
  const activeLandlordsCount = organizations.filter((o) => o.status === 'ACTIVE').length || metrics.activeLandlords;
  const currentMrrMillions = (metrics.mrrVnd / 1000000).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header with Context, Live Status & Time Filter */}
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
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>
            Tổng quan
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Giám sát vĩ mô hệ thống SaaS đa khách hàng, tình hình tăng trưởng và an ninh hạ tầng.
          </p>
        </div>

        {/* Time Filters & Quick System Status Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              padding: '3px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
            }}
          >
            <span style={{ padding: '0 8px', color: '#6B7280', display: 'flex', alignItems: 'center' }}>
              <Filter size={13} />
            </span>
            {[
              { id: '7d', label: '7 ngày' },
              { id: '30d', label: '30 ngày' },
              { id: 'this_month', label: 'Tháng này' },
              { id: '6m', label: '6 tháng' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeRange(tab.id as TimeRangeFilter)}
                style={{
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: timeRange === tab.id ? 700 : 500,
                  backgroundColor: timeRange === tab.id ? '#FFFFFF' : 'transparent',
                  color: timeRange === tab.id ? '#00594C' : '#4B5563',
                  boxShadow: timeRange === tab.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => navigate('/platform/system-health')}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <Server size={14} /> Kiểm tra hạ tầng
          </button>
        </div>
      </div>

      {/* 2. Top 4 Core SaaS KPIs (Clickable directly to management modules) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* KPI 1: Active Accounts */}
        <div
          className="rf-card"
          onClick={() => navigate('/platform/accounts')}
          style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#00594C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Tài khoản người dùng</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E6F0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00594C' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '8px 0 4px 0', letterSpacing: '-0.4px' }}>
            {activeAccountsCount.toLocaleString('vi-VN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <TrendingUp size={13} /> +8.5% so với kỳ trước
            </span>
            <span style={{ color: '#00594C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Quản lý <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 2: Active Organizations */}
        <div
          className="rf-card"
          onClick={() => navigate('/platform/organizations')}
          style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#00594C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Tổ chức chủ nhà hoạt động</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '8px 0 4px 0', letterSpacing: '-0.4px' }}>
            {activeLandlordsCount.toLocaleString('vi-VN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#16A34A', fontWeight: 600 }}>
              +12 tổ chức mới
            </span>
            <span style={{ color: '#00594C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Chi tiết <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 3: SaaS Recurring Revenue (MRR) */}
        <div
          className="rf-card"
          onClick={() => navigate('/platform/subscriptions')}
          style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#00594C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Doanh thu thuê bao (MRR)</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#00594C', margin: '8px 0 4px 0', letterSpacing: '-0.4px' }}>
            {currentMrrMillions} tr đ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#16A34A', fontWeight: 600 }}>
              +15.2% so với tháng trước
            </span>
            <span style={{ color: '#00594C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Gói SaaS <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 4: Pending Support & SLA Tickets */}
        <div
          className="rf-card"
          onClick={() => navigate('/platform/support')}
          style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = urgentTickets.length > 0 ? '#DC2626' : '#16A34A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Yêu cầu hỗ trợ mở</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: urgentTickets.length > 0 ? '#FEE2E2' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: urgentTickets.length > 0 ? '#DC2626' : '#16A34A' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: urgentTickets.length > 0 ? '#DC2626' : '#111827', margin: '8px 0 4px 0', letterSpacing: '-0.4px' }}>
            {metrics.pendingTicketsCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: urgentTickets.length > 0 ? '#DC2626' : '#6B7280', fontWeight: 600 }}>
              {urgentTickets.length} ticket khẩn cấp cần xử lý
            </span>
            <span style={{ color: '#00594C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Hỗ trợ <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Analytics Charts Grid: Main Trend & Secondary Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Main Chart: Growth Trend Over Time */}
        <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Xu hướng tăng trưởng người dùng & tổ chức
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
                Số lượng tài khoản cá nhân và doanh nghiệp gia nhập hệ thống theo thời gian
              </p>
            </div>
          </div>

          <TrendLineChart
            data={getGrowthData()}
            series={growthSeries}
            height={230}
            yAxisTitle="Quy mô (Tài khoản / Tổ chức)"
          />
        </div>

        {/* Secondary Chart: Subscription Plan Breakdown */}
        <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Cơ cấu gói thuê bao SaaS
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
              Tỷ trọng phân bố giữa các gói dịch vụ RentFlow đang phát sinh thuê bao
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <DonutDistributionChart
              segments={donutSegments}
              centerValue={`${subscriptions.length || 185}`}
              centerLabel="Tổng gói đăng ký"
              size={170}
            />
          </div>

          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#6B7280' }}>Tỷ lệ gia hạn đúng hạn: <strong style={{ color: '#16A34A' }}>94.6%</strong></span>
            <button
              type="button"
              onClick={() => navigate('/platform/subscription-plans')}
              style={{ background: 'none', border: 'none', color: '#00594C', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Xem bảng giá SaaS →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
