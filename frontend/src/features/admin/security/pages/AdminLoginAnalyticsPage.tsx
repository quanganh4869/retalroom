import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastSystem';
import { securityApiService } from '../services/securityApiService';
import { LoginAnalyticsData } from '../types';
import { SecurityBreadcrumbs } from '../components/SecuritySubNav';

export const AdminLoginAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [timeRange, setTimeRange] = useState<string>('7d');
  const [data, setData] = useState<LoginAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const loadAnalytics = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await securityApiService.getLoginAnalytics(timeRange);
      setData(res);
      if (isManual) {
        toast.success('Đã cập nhật biểu đồ', 'Dữ liệu phân tích xác thực đã được đồng bộ.');
      }
    } catch (err: unknown) {
      toast.error('Lỗi tải phân tích', (err as Error).message || 'Không thể lấy dữ liệu.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const maxTimelineTotal = data?.activityTimeline
    ? Math.max(...data.activityTimeline.map((t) => t.total), 1)
    : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header */}
      <div>
        <SecurityBreadcrumbs
          items={[
            { label: 'Lịch sử đăng nhập', to: '/platform/security/login-logs' },
            { label: 'Phân tích xác thực' },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Phân tích xác thực
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>
              Theo dõi xu hướng đăng nhập, hiệu quả xác thực và các dấu hiệu bất thường theo thời gian.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="24h">24 giờ qua</option>
              <option value="7d">7 ngày qua (Mặc định)</option>
              <option value="30d">30 ngày qua</option>
            </select>

            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => loadAnalytics(true)}
              disabled={isRefreshing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'rf-spin' : ''} />
              <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
            </button>

            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => navigate('/platform/security/login-logs')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <ArrowLeft size={13} />
              <span>Quay lại lịch sử đăng nhập</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="rf-card" style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
          <RefreshCw size={24} className="rf-spin" style={{ margin: '0 auto 12px auto' }} />
          <div>Đang tổng hợp dữ liệu thống kê...</div>
        </div>
      ) : (
        <>
          {/* 2. Four KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* KPI 1 */}
            <div className="rf-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                Tổng số lượt xác thực
              </span>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
                {data.totalAttempts.toLocaleString('vi-VN')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px' }}>
                {data.previousPeriodComparison.pctChangeTotal >= 0 ? (
                  <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                    <TrendingUp size={12} /> +{data.previousPeriodComparison.pctChangeTotal}%
                  </span>
                ) : (
                  <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                    <TrendingDown size={12} /> {data.previousPeriodComparison.pctChangeTotal}%
                  </span>
                )}
                <span style={{ color: '#6B7280' }}>so với kỳ trước</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="rf-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                Tỷ lệ đăng nhập thành công
              </span>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#00594C', marginTop: '4px' }}>
                {data.successRate}%
              </div>
              <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginTop: '6px' }}>
                {data.successCount.toLocaleString('vi-VN')} lần thành công
              </div>
            </div>

            {/* KPI 3 */}
            <div className="rf-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                Tổng số lần đăng nhập thất bại
              </span>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#DC2626', marginTop: '4px' }}>
                {data.failedCount}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px' }}>
                {data.previousPeriodComparison.pctChangeFailed <= 0 ? (
                  <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                    <TrendingDown size={12} /> {data.previousPeriodComparison.pctChangeFailed}%
                  </span>
                ) : (
                  <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                    <TrendingUp size={12} /> +{data.previousPeriodComparison.pctChangeFailed}%
                  </span>
                )}
                <span style={{ color: '#6B7280' }}>so với kỳ trước</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="rf-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                Bị hệ thống bảo mật chặn (WAF)
              </span>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#7C3AED', marginTop: '4px' }}>
                {data.blockedCount}
              </div>
              <div style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 600, marginTop: '6px' }}>
                Rate-limit & danh sách đen
              </div>
            </div>
          </div>

          {/* 3. Main Chart: Authentication Activity Timeline */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Hoạt động xác thực theo thời gian
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  Phân phối số lượt đăng nhập Thành công, Thất bại và Bị chặn
                </span>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#374151' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#00594C', borderRadius: '2px' }} />
                  Thành công
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#374151' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#DC2626', borderRadius: '2px' }} />
                  Thất bại
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#374151' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#7C3AED', borderRadius: '2px' }} />
                  Bị chặn (WAF)
                </span>
              </div>
            </div>

            {/* Interactive Timeline Bar Chart */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                height: '180px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '8px',
                paddingTop: '20px',
                position: 'relative',
              }}
            >
              {data.activityTimeline.map((item, idx) => {
                const totalHeightPct = Math.max(15, Math.round((item.total / maxTimelineTotal) * 100));
                const successPct = item.total > 0 ? (item.success / item.total) * 100 : 100;
                const failedPct = item.total > 0 ? (item.failed / item.total) * 100 : 0;
                const blockedPct = item.total > 0 ? (item.blocked / item.total) * 100 : 0;

                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setActiveTooltip(idx)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={() => navigate('/platform/security/login-logs')}
                  >
                    {/* Tooltip */}
                    {activeTooltip === idx && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 10px)',
                          backgroundColor: '#111827',
                          color: '#FFFFFF',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          zIndex: 30,
                          pointerEvents: 'none',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>Thời điểm: {item.label}</div>
                        <div style={{ color: '#34D399' }}>Thành công: {item.success}</div>
                        <div style={{ color: '#F87171' }}>Thất bại: {item.failed}</div>
                        <div style={{ color: '#C084FC' }}>Bị chặn: {item.blocked}</div>
                        <div style={{ borderTop: '1px solid #374151', marginTop: '4px', paddingTop: '4px', fontWeight: 600 }}>
                          Tổng cộng: {item.total}
                        </div>
                      </div>
                    )}

                    {/* Stacked bar */}
                    <div
                      style={{
                        width: '75%',
                        maxWidth: '36px',
                        height: `${totalHeightPct}%`,
                        borderRadius: '4px 4px 0 0',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        backgroundColor: '#E5E7EB',
                        transition: 'opacity 0.15s ease',
                        opacity: activeTooltip === idx ? 0.9 : 1,
                      }}
                    >
                      <div style={{ height: `${successPct}%`, backgroundColor: '#00594C' }} />
                      <div style={{ height: `${failedPct}%`, backgroundColor: '#DC2626' }} />
                      <div style={{ height: `${blockedPct}%`, backgroundColor: '#7C3AED' }} />
                    </div>

                    <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Two Distribution Sections: Methods & Statuses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Auth Method Distribution */}
            <div className="rf-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Layers size={16} color="#00594C" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Phân bố theo phương thức xác thực
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.authMethodDistribution.map((m) => (
                  <div
                    key={m.key}
                    style={{ cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'background 0.12s ease' }}
                    onClick={() => navigate(`/platform/security/login-logs?method=${m.key}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    title="Nhấn để xem nhật ký phương thức này"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{m.label}</span>
                      <span style={{ color: '#6B7280' }}>
                        <strong>{m.count.toLocaleString('vi-VN')}</strong> ({m.percentage}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '7px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${m.percentage}%`,
                          height: '100%',
                          backgroundColor: '#00594C',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="rf-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <CheckCircle size={16} color="#00594C" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Phân tích tỷ lệ trạng thái xác thực
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.statusDistribution.map((st) => {
                  const color =
                    st.key === 'SUCCESS' ? '#16A34A' : st.key === 'FAILED' ? '#DC2626' : '#7C3AED';
                  return (
                    <div
                      key={st.key}
                      style={{ cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'background 0.12s ease' }}
                      onClick={() => navigate(`/platform/security/login-logs?status=${st.key}`)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      title="Nhấn để xem nhật ký theo trạng thái này"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{st.label}</span>
                        <span style={{ color: '#6B7280' }}>
                          <strong>{st.count.toLocaleString('vi-VN')}</strong> ({st.percentage}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '7px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${st.percentage}%`,
                            height: '100%',
                            backgroundColor: color,
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Suspicious Sources Table */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Nguồn truy cập đáng chú ý & Dấu hiệu bất thường
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
                Tổng hợp các địa chỉ IP có chuỗi xác thực thất bại hoặc thử tấn công vào nhiều tài khoản.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Địa chỉ IP</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Vị trí địa lý</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Lần thất bại</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Tài khoản bị nhắm tới</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Dấu hiệu nhận diện</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Trạng thái IP</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {data.suspiciousSources.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                        Không phát hiện nguồn truy cập nào có dấu hiệu bất thường trong kỳ này.
                      </td>
                    </tr>
                  ) : (
                    data.suspiciousSources.map((src, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }}>
                          {src.ipAddress}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#4B5563' }}>{src.location}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontWeight: 700, color: '#DC2626' }}>{src.failedAttempts} lần</span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#4B5563', fontSize: '12px' }}>
                          {src.accountsTargeted.join(', ')}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#B45309', fontSize: '12px' }}>
                          {src.riskReason}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {src.isBlocked ? (
                            <span className="rf-badge rf-badge-danger" style={{ backgroundColor: '#450A0A', color: '#FCA5A5' }}>
                              Đã khóa WAF
                            </span>
                          ) : (
                            <span className="rf-badge rf-badge-warning">Chưa chặn</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="rf-btn rf-btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => navigate(`/platform/security/login-logs?search=${encodeURIComponent(src.ipAddress)}`)}
                          >
                            <ExternalLink size={11} />
                            Xem sự kiện
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
