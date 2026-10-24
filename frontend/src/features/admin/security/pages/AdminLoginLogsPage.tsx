import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Monitor,
  Smartphone,
  Laptop,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastSystem';
import { securityApiService } from '../services/securityApiService';
import {
  LoginLogItem,
  LoginOverviewStats,
  AdvancedFilterState,
} from '../types';
import { SecurityBreadcrumbs, SecuritySubNav } from '../components/SecuritySubNav';
import { AdvancedFilterDrawer, ActiveFilterChips } from '../components/AdvancedFilterDrawer';
import { ExportCsvPopover } from '../components/ExportCsvPopover';

export const AdminLoginLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  // URL search query sync
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialMethod = searchParams.get('method') || 'ALL';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filters, setFilters] = useState<AdvancedFilterState>({
    fromDate: '',
    toDate: '',
    status: initialStatus,
    authMethod: initialMethod,
    role: 'ALL',
    deviceType: 'ALL',
    os: 'ALL',
    isSuspiciousOnly: false,
  });

  const [logs, setLogs] = useState<LoginLogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<LoginOverviewStats>({
    totalLogins: 0,
    successfulLogins: 0,
    failedLogins: 0,
    currentlyBlockedIps: 0,
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await securityApiService.getLoginLogs({
        page,
        pageSize,
        search: debouncedSearch,
        timeRange,
        filters,
      });
      setLogs(res.items);
      setTotalCount(res.total);
      setTotalPages(res.totalPages);
      setStats(res.stats);

      if (isManualRefresh) {
        toast.success('Làm mới thành công', 'Đã cập nhật dữ liệu lịch sử xác thực từ backend.');
      }
    } catch (err: unknown) {
      toast.error('Không thể tải nhật ký', (err as Error).message || 'Lỗi kết nối API');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, pageSize, debouncedSearch, timeRange, filters, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle URL params updates
  useEffect(() => {
    const query = searchParams.get('search');
    const statusParam = searchParams.get('status');
    const methodParam = searchParams.get('method');

    if (query !== null && query !== searchTerm) {
      setSearchTerm(query);
    }
    if (statusParam && statusParam !== filters.status) {
      setFilters((prev) => ({ ...prev, status: statusParam }));
    }
    if (methodParam && methodParam !== filters.authMethod) {
      setFilters((prev) => ({ ...prev, authMethod: methodParam }));
    }
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      fromDate: '',
      toDate: '',
      status: 'ALL',
      authMethod: 'ALL',
      role: 'ALL',
      deviceType: 'ALL',
      os: 'ALL',
      isSuspiciousOnly: false,
    });
    setPage(1);
    setSearchParams({});
    toast.info('Đã xóa bộ lọc', 'Bảng đã được khôi phục về trạng thái mặc định.');
  };

  const handleRemoveSingleFilter = (key: keyof AdvancedFilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'isSuspiciousOnly' ? false : key.includes('Date') ? '' : 'ALL',
    }));
    setPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(logs.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportAll = async () => {
    try {
      toast.info('Đang xuất dữ liệu', `Đang xuất ${totalCount} bản ghi sang file CSV...`);
      await securityApiService.exportLoginLogsCsv({
        search: debouncedSearch,
        status: filters.status,
        authMethod: filters.authMethod,
      });
      toast.success('Xuất file thành công', 'File CSV đã được tải về máy.');
    } catch {
      toast.error('Lỗi xuất file', 'Không thể kết xuất dữ liệu.');
    }
  };

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      toast.info('Đang xuất dữ liệu', `Đang xuất ${selectedIds.length} bản ghi đã chọn...`);
      await securityApiService.exportLoginLogsCsv({ ids: selectedIds });
      toast.success('Xuất file thành công', `Đã xuất ${selectedIds.length} bản ghi.`);
    } catch {
      toast.error('Lỗi xuất file', 'Không thể kết xuất dữ liệu.');
    }
  };

  const getDeviceIcon = (device: LoginLogItem['deviceType']) => {
    switch (device) {
      case 'MOBILE':
        return <Smartphone size={14} color="#4F46E5" />;
      case 'TABLET':
        return <Laptop size={14} color="#0284C7" />;
      case 'API_CLIENT':
        return <ShieldAlert size={14} color="#DC2626" />;
      default:
        return <Monitor size={14} color="#4B5563" />;
    }
  };

  const getStatusBadge = (status: LoginLogItem['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="rf-badge rf-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={11} /> Thành công
          </span>
        );
      case 'FAILED':
        return (
          <span className="rf-badge rf-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={11} /> Thất bại
          </span>
        );
      case 'BLOCKED':
        return (
          <span
            className="rf-badge rf-badge-danger"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#450A0A',
              color: '#FCA5A5',
            }}
          >
            <AlertTriangle size={11} /> Bị chặn (WAF)
          </span>
        );
      default:
        return <span className="rf-badge">{status}</span>;
    }
  };

  const hasActiveFilters =
    filters.status !== 'ALL' ||
    filters.authMethod !== 'ALL' ||
    filters.role !== 'ALL' ||
    filters.deviceType !== 'ALL' ||
    filters.os !== 'ALL' ||
    filters.isSuspiciousOnly ||
    Boolean(filters.fromDate) ||
    Boolean(filters.toDate) ||
    Boolean(searchTerm);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header Section */}
      <div>
        <SecurityBreadcrumbs items={[{ label: 'Lịch sử đăng nhập' }]} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Lịch sử đăng nhập
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>
              Theo dõi các lần xác thực, trạng thái đăng nhập và hoạt động truy cập trên nền tảng RentFlow.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Time range selector */}
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                color: '#374151',
              }}
            >
              <option value="24h">24 giờ qua</option>
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="">Tất cả thời gian</option>
            </select>

            {/* Refresh button with spinner */}
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'rf-spin' : ''} />
              <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
            </button>

            {/* Export CSV menu */}
            <ExportCsvPopover
              totalFilteredCount={totalCount}
              selectedCount={selectedIds.length}
              onExportAll={handleExportAll}
              onExportSelected={handleExportSelected}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation Toolbar */}
      <SecuritySubNav currentTab="logs" />

      {/* 3. KPI Summary Cards (4 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* Card 1: Total */}
        <div
          className="rf-card"
          style={{ padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => {
            setFilters((prev) => ({ ...prev, status: 'ALL' }));
            setPage(1);
          }}
          title="Nhấn để xem toàn bộ lượt đăng nhập"
        >
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Tổng lượt đăng nhập</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
            {stats.totalLogins.toLocaleString('vi-VN')}
          </div>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Khoảng thời gian: {timeRange || 'Tất cả'}</span>
        </div>

        {/* Card 2: Success */}
        <div
          className="rf-card"
          style={{ padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => {
            setFilters((prev) => ({ ...prev, status: 'SUCCESS' }));
            setPage(1);
          }}
          title="Nhấn để lọc các lượt đăng nhập thành công"
        >
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Đăng nhập thành công</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '4px' }}>
            {stats.successfulLogins.toLocaleString('vi-VN')}
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
            {stats.totalLogins > 0
              ? `${Math.round((stats.successfulLogins / stats.totalLogins) * 100)}% tỷ lệ hợp lệ`
              : '100% hợp lệ'}
          </span>
        </div>

        {/* Card 3: Failed */}
        <div
          className="rf-card"
          style={{ padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => {
            setFilters((prev) => ({ ...prev, status: 'FAILED' }));
            setPage(1);
          }}
          title="Nhấn để lọc các lượt đăng nhập thất bại"
        >
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Đăng nhập thất bại</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626', marginTop: '4px' }}>
            {stats.failedLogins.toLocaleString('vi-VN')}
          </div>
          <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
            Cần lưu ý các chuỗi dò mật khẩu
          </span>
        </div>

        {/* Card 4: Currently Blocked IPs (Navigates to Blocked IPs page) */}
        <div
          className="rf-card"
          style={{ padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => navigate('/platform/security/login-logs/blocked-ips')}
          title="Nhấn để chuyển sang trang Quản lý IP bị chặn"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>IP đang bị chặn</span>
            <ArrowRight size={13} color="#9CA3AF" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#7C3AED', marginTop: '4px' }}>
            {stats.currentlyBlockedIps} địa chỉ
          </div>
          <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 500 }}>Trạng thái WAF hiện tại</span>
        </div>
      </div>

      {/* 4. Search and Filter Toolbar */}
      <div className="rf-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            <input
              type="text"
              placeholder="Tìm theo email, IP (vd: 118.69...), mã sự kiện hoặc lý do thất bại..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setDebouncedSearch(searchTerm);
                }
              }}
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

          {/* Advanced filter toggle button */}
          <button
            type="button"
            className={`rf-btn ${hasActiveFilters ? 'rf-btn-primary' : 'rf-btn-secondary'}`}
            onClick={() => setIsFilterOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Filter size={13} />
            <span>Bộ lọc nâng cao</span>
            {hasActiveFilters && (
              <span
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#00594C',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '10px',
                }}
              >
                Bật
              </span>
            )}
          </button>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={handleResetFilters}
              style={{ fontSize: '13px', color: '#DC2626' }}
            >
              Xóa điều kiện lọc
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        <ActiveFilterChips filters={filters} onRemove={handleRemoveSingleFilter} />
      </div>

      {/* 5. Login Logs Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ width: '40px', padding: '10px 12px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={logs.length > 0 && selectedIds.length === logs.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    title="Chọn tất cả bản ghi hiển thị"
                  />
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Thời gian</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Tài khoản / Người dùng</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Trạng thái</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Địa chỉ IP & Vị trí</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Thiết bị & Client</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Phương thức</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#6B7280' }}>
                    <RefreshCw size={20} className="rf-spin" style={{ margin: '0 auto 8px auto' }} />
                    <div>Đang tải dữ liệu xác thực...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ color: '#4B5563', fontWeight: 600, fontSize: '15px' }}>
                      Không tìm thấy sự kiện phù hợp
                    </div>
                    <p style={{ color: '#6B7280', fontSize: '13px', margin: '6px 0 16px 0' }}>
                      Không có bản ghi nào khớp với điều kiện tìm kiếm hoặc khoảng thời gian đã chọn.
                    </p>
                    <button
                      type="button"
                      className="rf-btn rf-btn-secondary"
                      onClick={handleResetFilters}
                      style={{ fontSize: '13px' }}
                    >
                      Xóa bộ lọc
                    </button>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isChecked = selectedIds.includes(log.id);
                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: isChecked ? '#F0FDF4' : undefined,
                        transition: 'background 0.12s ease',
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(log.id)}
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                      </td>

                      {/* Time */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>
                          {log.timestamp.slice(11, 19)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                          {log.timestamp.slice(0, 10)}
                        </div>
                      </td>

                      {/* Account */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{log.userName}</div>
                        <div style={{ fontSize: '11px', color: '#4B5563' }}>{log.email}</div>
                        {log.organizationName && (
                          <div style={{ fontSize: '11px', color: '#00594C', fontWeight: 500 }}>
                            {log.organizationName}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        {getStatusBadge(log.status)}
                        {log.failureReason && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#DC2626',
                              marginTop: '2px',
                              maxWidth: '220px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={log.failureReason}
                          >
                            {log.failureReason}
                          </div>
                        )}
                      </td>

                      {/* IP & Location */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#111827' }}>
                          {log.ipAddress}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{log.location}</div>
                      </td>

                      {/* Device & OS */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getDeviceIcon(log.deviceType)}
                          <span style={{ fontWeight: 500, color: '#111827' }}>{log.browser}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{log.os}</div>
                      </td>

                      {/* Auth Method */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                          {log.authMethod === 'PASSWORD_2FA'
                            ? 'Mật khẩu + 2FA'
                            : log.authMethod === 'GOOGLE_SSO'
                            ? 'Google SSO'
                            : log.authMethod === 'MAGIC_LINK'
                            ? 'Magic Link'
                            : 'Mật khẩu'}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="rf-btn rf-btn-secondary"
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                          onClick={() => navigate(`/platform/security/login-logs/events/${log.id}`)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
            backgroundColor: '#F9FAFB',
          }}
        >
          {/* Summary */}
          <div style={{ color: '#4B5563' }}>
            Hiển thị <strong>{logs.length > 0 ? (page - 1) * pageSize + 1 : 0}</strong> -{' '}
            <strong>{Math.min(page * pageSize, totalCount)}</strong> trong tổng số{' '}
            <strong>{totalCount}</strong> sự kiện
          </div>

          {/* Page size & controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#6B7280' }}>Số dòng:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #D1D5DB',
                  fontSize: '12px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                Trước
              </button>
              <span style={{ padding: '0 8px', color: '#374151', fontWeight: 600 }}>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      <AdvancedFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />
    </div>
  );
};
