import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminAuditLogsPage: React.FC = () => {
  const { auditLogs, refreshAuditLogs } = usePlatformAdmin();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);

    const matchesTarget = targetTypeFilter === 'ALL' || log.targetType === targetTypeFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesTarget && matchesStatus;
  });

  const handleExport = () => {
    toast.success('Xuất file thành công', `Đã kết xuất ${filteredLogs.length} dòng nhật ký sang định dạng CSV/JSON.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Audit Logs — Nhật ký sự kiện bảo mật & vận hành
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={refreshAuditLogs}
          >
            <RefreshCw size={13} /> Làm mới
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={handleExport}
          >
            <Download size={13} /> Xuất CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rf-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo thao tác, email người thực hiện, địa chỉ IP hoặc chi tiết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#F9FAFB',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="#6B7280" />
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Tất cả phân hệ</option>
            <option value="ACCOUNT">Tài khoản (Account)</option>
            <option value="ORGANIZATION">Tổ chức (Organization)</option>
            <option value="SUBSCRIPTION">Thuê bao (Subscription)</option>
            <option value="SECURITY">Bảo mật (Security)</option>
            <option value="SYSTEM">Hệ thống (System)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Tất cả kết quả</option>
            <option value="SUCCESS">Thành công (Success)</option>
            <option value="WARNING">Cảnh báo (Warning)</option>
            <option value="FAILED">Thất bại (Failed)</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="rf-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người thực hiện</th>
              <th>Thao tác</th>
              <th>Phân hệ / Đối tượng</th>
              <th>Địa chỉ IP & Vị trí</th>
              <th>Chi tiết sự kiện</th>
              <th>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                  {log.timestamp}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{log.actorEmail}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Vai trò: {log.actorRole}</div>
                </td>
                <td style={{ fontWeight: 600, color: '#00594C' }}>{log.action}</td>
                <td>
                  <span className="rf-badge rf-badge-neutral">{log.targetType}</span>
                </td>
                <td style={{ fontSize: '12px' }}>
                  <div>{log.ipAddress}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{log.location}</div>
                </td>
                <td style={{ fontSize: '12px', color: '#374151', maxWidth: '300px' }}>
                  {log.details}
                </td>
                <td>
                  {log.status === 'SUCCESS' ? (
                    <span className="rf-badge rf-badge-active">Thành công</span>
                  ) : log.status === 'WARNING' ? (
                    <span className="rf-badge rf-badge-warning">Cảnh báo</span>
                  ) : (
                    <span className="rf-badge rf-badge-danger">Thất bại</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#6B7280' }}>
                  Không tìm thấy sự kiện kiểm toán phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
