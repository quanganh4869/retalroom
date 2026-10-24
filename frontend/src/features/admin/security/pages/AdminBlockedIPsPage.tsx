import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Plus,
  ExternalLink,
  Unlock,
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastSystem';
import { securityApiService } from '../services/securityApiService';
import { BlockedIPItem, BlockedIPStats } from '../types';
import { SecurityBreadcrumbs } from '../components/SecuritySubNav';
import { BlockIpModal } from '../components/BlockIpModal';
import { UnblockIpModal } from '../components/UnblockIpModal';

export const AdminBlockedIPsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  const [items, setItems] = useState<BlockedIPItem[]>([]);
  const [stats, setStats] = useState<BlockedIPStats>({
    currentlyBlocked: 0,
    autoBlocked: 0,
    manuallyBlocked: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [unblockTarget, setUnblockTarget] = useState<BlockedIPItem | null>(null);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await securityApiService.getBlockedIPs({
        search: searchTerm,
        status: statusFilter,
        blockSource: sourceFilter,
      });
      setItems(res.items);
      setStats(res.stats);
      if (isManual) {
        toast.success('Đã làm mới', 'Đã tải danh sách IP bị chặn từ hệ thống.');
      }
    } catch (err: unknown) {
      toast.error('Lỗi tải danh sách IP', (err as Error).message || 'Không thể lấy dữ liệu.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchTerm, statusFilter, sourceFilter, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateBlock = async (data: { ipAddress: string; reason: string; durationHours: number; notes?: string }) => {
    const created = await securityApiService.createBlockedIP(data);
    toast.success('Đã chặn IP', `Địa chỉ IP ${created.ipAddress} đã được đưa vào danh sách chặn thành công.`);
    loadData();
  };

  const handleUnblock = async (blockId: string, reason: string) => {
    const updated = await securityApiService.unblockIP(blockId, reason);
    toast.success('Đã gỡ chặn IP', `Đã mở lại quyền truy cập cho địa chỉ IP ${updated.ipAddress}.`);
    loadData();
  };

  const getStatusBadge = (st: BlockedIPItem['status']) => {
    switch (st) {
      case 'ACTIVE':
        return <span className="rf-badge rf-badge-danger">Đang chặn</span>;
      case 'EXPIRED':
        return <span className="rf-badge rf-badge-neutral">Hết hạn</span>;
      case 'UNBLOCKED':
        return <span className="rf-badge rf-badge-active">Đã bỏ chặn</span>;
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
            { label: 'Quản lý IP bị chặn' },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Quản lý IP bị chặn
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>
              Theo dõi trạng thái chặn IP và quản lý các quyết định hạn chế truy cập.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={() => setIsBlockModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Plus size={14} />
              <span>Thêm IP vào danh sách chặn</span>
            </button>

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
        <div
          className="rf-card"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          title="Nhấn để lọc IP đang bị chặn"
        >
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>IP đang bị chặn</span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#DC2626', marginTop: '4px' }}>
            {stats.currentlyBlocked} địa chỉ
          </div>
          <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>Đang hiệu lực toàn hệ thống</span>
        </div>

        <div
          className="rf-card"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => {
            setSourceFilter('AUTOMATIC');
            setStatusFilter('ACTIVE');
          }}
          title="Nhấn để lọc IP bị chặn tự động"
        >
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>IP bị chặn tự động (WAF)</span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#7C3AED', marginTop: '4px' }}>
            {stats.autoBlocked} địa chỉ
          </div>
          <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 500 }}>Do vi phạm rate-limit</span>
        </div>

        <div
          className="rf-card"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => {
            setSourceFilter('MANUAL');
            setStatusFilter('ACTIVE');
          }}
          title="Nhấn để lọc IP bị chặn thủ công"
        >
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>IP bị chặn thủ công</span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#00594C', marginTop: '4px' }}>
            {stats.manuallyBlocked} địa chỉ
          </div>
          <span style={{ fontSize: '11px', color: '#00594C', fontWeight: 500 }}>Quyết định từ Quản trị viên</span>
        </div>
      </div>

      {/* 3. Search and Filters */}
      <div className="rf-card" style={{ padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Tìm theo địa chỉ IP hoặc lý do chặn..."
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
          <option value="ACTIVE">Đang chặn (Active)</option>
          <option value="EXPIRED">Đã hết hạn (Expired)</option>
          <option value="UNBLOCKED">Đã gỡ chặn (Unblocked)</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            fontSize: '13px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <option value="ALL">Tất cả nguồn chặn</option>
          <option value="AUTOMATIC">Tự động (WAF Rule)</option>
          <option value="MANUAL">Thủ công (Quản trị viên)</option>
        </select>

        {(searchTerm || statusFilter !== 'ALL' || sourceFilter !== 'ALL') && (
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setSourceFilter('ALL');
            }}
            style={{ fontSize: '13px', color: '#DC2626' }}
          >
            Đặt lại
          </button>
        )}
      </div>

      {/* 4. Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Địa chỉ IP</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Nguồn chặn</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Lý do hạn chế</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Bắt đầu</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Hết hạn</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Trạng thái</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>Người thực hiện</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#6B7280' }}>
                    <RefreshCw size={20} className="rf-spin" style={{ margin: '0 auto 8px auto' }} />
                    <div>Đang tải danh sách IP bị chặn...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#6B7280' }}>
                    Không có địa chỉ IP nào khớp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                items.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#111827' }}>
                      {b.ipAddress}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        className="rf-badge"
                        style={{
                          backgroundColor: b.blockSource === 'AUTOMATIC' ? '#F3E8FF' : '#E0F2FE',
                          color: b.blockSource === 'AUTOMATIC' ? '#6B21A8' : '#0369A1',
                        }}
                      >
                        {b.blockSource === 'AUTOMATIC' ? 'WAF Tự động' : 'Admin Thủ công'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#374151' }}>
                      <div>{b.reason}</div>
                      {b.unblockReason && (
                        <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>
                          Lý do gỡ: {b.unblockReason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#4B5563', whiteSpace: 'nowrap' }}>
                      {b.blockedAt}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#4B5563', whiteSpace: 'nowrap' }}>
                      {b.expiresAt || 'Vĩnh viễn'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{getStatusBadge(b.status)}</td>
                    <td style={{ padding: '10px 14px', color: '#4B5563', fontSize: '12px' }}>
                      {b.createdBy || 'Hệ thống'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="rf-btn rf-btn-secondary"
                          style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => navigate(`/platform/security/login-logs?search=${encodeURIComponent(b.ipAddress)}`)}
                          title="Xem toàn bộ lịch sử đăng nhập từ IP này"
                        >
                          <ExternalLink size={11} />
                          Lịch sử
                        </button>
                        {b.status === 'ACTIVE' && (
                          <button
                            type="button"
                            className="rf-btn rf-btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#00594C' }}
                            onClick={() => setUnblockTarget(b)}
                          >
                            <Unlock size={11} />
                            Bỏ chặn
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add IP Modal */}
      <BlockIpModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onSubmit={handleCreateBlock}
      />

      {/* Unblock Modal */}
      <UnblockIpModal
        isOpen={Boolean(unblockTarget)}
        onClose={() => setUnblockTarget(null)}
        target={unblockTarget}
        onConfirm={handleUnblock}
      />
    </div>
  );
};
