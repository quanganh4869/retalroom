import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastSystem';
import { securityApiService } from '../services/securityApiService';
import { SecurityAlertItem, SecurityAlertStats } from '../types';
import { SecurityBreadcrumbs } from '../components/SecuritySubNav';
import { AlertDetailDrawer } from '../components/AlertDetailDrawer';

export const AdminSecurityAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [alerts, setAlerts] = useState<SecurityAlertItem[]>([]);
  const [stats, setStats] = useState<SecurityAlertStats>({
    newAlerts: 0,
    investigating: 0,
    unresolvedCritical: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlertItem | null>(null);

  const loadAlerts = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await securityApiService.getSecurityAlerts({
        search: searchTerm,
        severity: severityFilter,
        status: statusFilter,
        category: categoryFilter,
      });
      setAlerts(res.items);
      setStats(res.stats);
      if (isManual) {
        toast.success('Đã làm mới', 'Đã tải danh sách cảnh báo an ninh mới nhất.');
      }
    } catch (err: unknown) {
      toast.error('Lỗi tải cảnh báo', (err as Error).message || 'Không thể lấy dữ liệu.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchTerm, severityFilter, statusFilter, categoryFilter, toast]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleStartInvestigate = async (alertId: string) => {
    try {
      const updated = await securityApiService.updateSecurityAlert(alertId, {
        status: 'INVESTIGATING',
        assignedTo: 'admin@rentflow.vn',
      });
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      setSelectedAlert(updated);
      toast.success('Bắt đầu điều tra', `Cảnh báo ${alertId} đã chuyển sang trạng thái Đang điều tra.`);
    } catch (err: unknown) {
      toast.error('Lỗi cập nhật', (err as Error).message);
    }
  };

  const handleResolveAlert = async (alertId: string, resolutionNote: string) => {
    try {
      const updated = await securityApiService.updateSecurityAlert(alertId, {
        status: 'RESOLVED',
        resolutionNote,
      });
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      setSelectedAlert(updated);
      toast.success('Đã xử lý cảnh báo', `Sự cố ${alertId} đã được đánh dấu là Đã giải quyết.`);
    } catch (err: unknown) {
      toast.error('Lỗi cập nhật', (err as Error).message);
    }
  };

  const handleAddNote = async (alertId: string, note: string) => {
    try {
      const updated = await securityApiService.addAlertNote(alertId, note);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      setSelectedAlert(updated);
      toast.success('Ghi chú đã lưu', 'Đã lưu ghi chú điều tra vào hệ thống.');
    } catch (err: unknown) {
      toast.error('Lỗi lưu ghi chú', (err as Error).message);
    }
  };

  const getSeverityBadge = (sev: SecurityAlertItem['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="rf-badge rf-badge-danger" style={{ backgroundColor: '#7F1D1D', color: '#FEE2E2', fontWeight: 700 }}>CRITICAL</span>;
      case 'HIGH':
        return <span className="rf-badge rf-badge-danger">HIGH</span>;
      case 'MEDIUM':
        return <span className="rf-badge rf-badge-warning">MEDIUM</span>;
      case 'LOW':
        return <span className="rf-badge rf-badge-neutral">LOW</span>;
      default:
        return <span className="rf-badge">{sev}</span>;
    }
  };

  const getStatusBadge = (st: SecurityAlertItem['status']) => {
    switch (st) {
      case 'OPEN':
        return <span className="rf-badge rf-badge-danger">Mới phát hiện</span>;
      case 'INVESTIGATING':
        return <span className="rf-badge rf-badge-warning">Đang điều tra</span>;
      case 'RESOLVED':
        return <span className="rf-badge rf-badge-active">Đã xử lý</span>;
      case 'DISMISSED':
        return <span className="rf-badge rf-badge-neutral">Bỏ qua</span>;
      default:
        return <span className="rf-badge">{st}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header */}
      <div>
        <SecurityBreadcrumbs
          items={[
            { label: 'Lịch sử đăng nhập', to: '/platform/security/login-logs' },
            { label: 'Cảnh báo bảo mật' },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Cảnh báo bảo mật
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>
              Theo dõi và xử lý các dấu hiệu bất thường được phát hiện trong hoạt động xác thực.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => loadAlerts(true)}
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

      {/* 2. Three Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {/* Card 1: New */}
        <div
          className="rf-card"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => setStatusFilter(statusFilter === 'OPEN' ? 'ALL' : 'OPEN')}
          title="Nhấn để lọc cảnh báo mới"
        >
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Cảnh báo mới phát hiện</span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#DC2626', marginTop: '4px' }}>
            {stats.newAlerts}
          </div>
          <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>Cần tiếp nhận & phân loại</span>
        </div>

        {/* Card 2: Investigating */}
        <div
          className="rf-card"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => setStatusFilter(statusFilter === 'INVESTIGATING' ? 'ALL' : 'INVESTIGATING')}
          title="Nhấn để lọc cảnh báo đang điều tra"
        >
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Đang điều tra xử lý</span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#D97706', marginTop: '4px' }}>
            {stats.investigating}
          </div>
          <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 500 }}>Đang có chuyên viên xử lý</span>
        </div>

        {/* Card 3: Unresolved Critical */}
        <div
          className="rf-card"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => {
            setSeverityFilter('CRITICAL');
            setStatusFilter('OPEN');
          }}
          title="Nhấn để lọc cảnh báo nghiêm trọng"
        >
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Nghiêm trọng chưa xử lý</span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#7F1D1D', marginTop: '4px' }}>
            {stats.unresolvedCritical}
          </div>
          <span style={{ fontSize: '11px', color: '#7F1D1D', fontWeight: 600 }}>Cấp độ Critical / High</span>
        </div>
      </div>

      {/* 3. Search and Filters */}
      <div className="rf-card" style={{ padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Tìm theo mã cảnh báo (sec-...), tiêu đề, IP hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            fontSize: '13px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <option value="ALL">Tất cả mức độ</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            fontSize: '13px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="OPEN">Mới phát hiện (Open)</option>
          <option value="INVESTIGATING">Đang điều tra (Investigating)</option>
          <option value="RESOLVED">Đã xử lý (Resolved)</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            fontSize: '13px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <option value="ALL">Tất cả loại sự cố</option>
          <option value="BRUTE_FORCE">Dò quét Brute-force</option>
          <option value="RATE_LIMIT">Vượt Rate Limit WAF</option>
          <option value="UNUSUAL_GEO">Vị trí địa lý lạ</option>
          <option value="ACCOUNT_TAKEOVER">Chiếm quyền tài khoản</option>
        </select>

        {(searchTerm || severityFilter !== 'ALL' || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setSeverityFilter('ALL');
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
            }}
            style={{ fontSize: '13px', color: '#DC2626' }}
          >
            Đặt lại
          </button>
        )}
      </div>

      {/* 4. Alerts Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Mã cảnh báo</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Thời điểm</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Loại & Tiêu đề sự cố</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Tài khoản / IP</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Mức độ</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Trạng thái</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Người xử lý</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#6B7280' }}>
                    <RefreshCw size={20} className="rf-spin" style={{ margin: '0 auto 8px auto' }} />
                    <div>Đang tải cảnh báo...</div>
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#6B7280' }}>
                    Không có cảnh báo an ninh nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#00594C' }}>
                      {alert.id}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#4B5563', whiteSpace: 'nowrap' }}>
                      {alert.timestamp}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{alert.title}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                        Phân loại: {alert.category}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#111827' }}>
                        {alert.ipAddress}
                      </div>
                      <div style={{ fontSize: '11px', color: '#4B5563' }}>
                        {alert.targetEmail || 'Không có email'}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>{getSeverityBadge(alert.severity)}</td>
                    <td style={{ padding: '10px 14px' }}>{getStatusBadge(alert.status)}</td>
                    <td style={{ padding: '10px 14px', color: '#4B5563', fontSize: '12px' }}>
                      {alert.assignedTo || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="rf-btn rf-btn-secondary"
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Alert Detail Drawer */}
      <AlertDetailDrawer
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        alert={selectedAlert}
        onStartInvestigate={handleStartInvestigate}
        onResolve={handleResolveAlert}
        onAddNote={handleAddNote}
      />
    </div>
  );
};
