import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  ShieldAlert,
  Smartphone,
  Monitor,
  Laptop,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformLoginLog } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminLoginHistoryPage: React.FC = () => {
  const { loginLogs, refreshAuditLogs } = usePlatformAdmin();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<PlatformLoginLog | null>(null);

  const filteredLogs = loginLogs.filter((log) => {
    const matchesSearch =
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.failureReason && log.failureReason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || log.authMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleExport = () => {
    toast.success('Xuất file thành công', `Đã xuất ${filteredLogs.length} dòng nhật ký đăng nhập sang CSV.`);
  };

  const getDeviceIcon = (device: PlatformLoginLog['deviceType']) => {
    switch (device) {
      case 'MOBILE':
        return <Smartphone size={15} color="#4F46E5" />;
      case 'TABLET':
        return <Laptop size={15} color="#0284C7" />;
      case 'API_CLIENT':
        return <ShieldAlert size={15} color="#DC2626" />;
      default:
        return <Monitor size={15} color="#4B5563" />;
    }
  };

  const getStatusBadge = (status: PlatformLoginLog['status']) => {
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
          <span className="rf-badge rf-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#450A0A', color: '#FCA5A5' }}>
            <AlertTriangle size={11} /> WAF Chặn
          </span>
        );
      default:
        return <span className="rf-badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-danger">BẢO MẬT & TRUY CẬP</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Phân biệt riêng với Audit Logs vận hành</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 2px 0' }}>
            Lịch sử đăng nhập & Nỗ lực xác thực (Login Logs)
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Theo dõi mọi phiên xác thực thành công, thất bại, IP bất thường và các dấu hiệu dò quét tấn công trên toàn nền tảng RentFlow.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="rf-btn rf-btn-secondary" onClick={refreshAuditLogs}>
            <RefreshCw size={13} /> Làm mới
          </button>
          <button type="button" className="rf-btn rf-btn-secondary" onClick={handleExport}>
            <Download size={13} /> Xuất CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Tổng lần đăng nhập (24h)</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            1,842
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>Tỷ lệ hợp lệ 98.6%</span>
        </div>
        <div className="rf-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Đăng nhập 2FA TOTP</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            418
          </div>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Bảo mật cấp cao</span>
        </div>
        <div className="rf-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Thất bại / Sai mật khẩu</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626', marginTop: '6px' }}>
            24
          </div>
          <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>12 lần từ 1 IP tấn công</span>
        </div>
        <div className="rf-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>WAF Tự động khóa IP</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#9333EA', marginTop: '6px' }}>
            2 địa chỉ
          </div>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Hiệu lực 24 giờ</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rf-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo email, IP (vd: 118.69...), địa điểm hoặc lý do thất bại..."
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
            <option value="ALL">Mọi trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="BLOCKED">WAF Chặn</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Mọi phương thức</option>
            <option value="PASSWORD_2FA">Mật khẩu + 2FA</option>
            <option value="PASSWORD">Mật khẩu chuẩn</option>
            <option value="GOOGLE_SSO">Google SSO</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Thời gian</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Tài khoản / Người dùng</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Địa chỉ IP & Vị trí</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Thiết bị & Client</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Phương thức</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563', textAlign: 'right' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                    Không tìm thấy bản ghi đăng nhập nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background-color 0.1s ease',
                      backgroundColor: log.status === 'BLOCKED' ? '#FEF2F2' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '12px', color: '#374151' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{log.userName}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>{log.email}</div>
                      {log.organizationName && (
                        <div style={{ fontSize: '11px', color: '#00594C' }}>{log.organizationName}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(log.status)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1F2937' }}>{log.ipAddress}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{log.location}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getDeviceIcon(log.deviceType)}
                        <span style={{ fontSize: '12px', color: '#374151' }}>{log.browser}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{log.os}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4B5563' }}>
                      {log.authMethod === 'PASSWORD_2FA' ? (
                        <span style={{ color: '#00594C', fontWeight: 600 }}>2FA TOTP</span>
                      ) : log.authMethod === 'GOOGLE_SSO' ? (
                        <span style={{ color: '#2563EB', fontWeight: 600 }}>Google SSO</span>
                      ) : (
                        <span>Mật khẩu</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="rf-btn rf-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => setSelectedLog(log)}
                      >
                        <Info size={12} /> Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Chi tiết sự kiện xác thực: ${selectedLog.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>Trạng thái xác thực:</span>
                {getStatusBadge(selectedLog.status)}
              </div>
              {selectedLog.failureReason && (
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#FEF2F2', borderRadius: '4px', color: '#991B1B', fontSize: '12px' }}>
                  <strong>Lý do:</strong> {selectedLog.failureReason}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Thời gian:</span>
                <div style={{ fontWeight: 600 }}>{selectedLog.timestamp}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Email người dùng:</span>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedLog.email}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Địa chỉ IP:</span>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedLog.ipAddress}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Vị trí địa lý:</span>
                <div style={{ fontWeight: 600 }}>{selectedLog.location}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Trình duyệt:</span>
                <div style={{ fontWeight: 600 }}>{selectedLog.browser}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Hệ điều hành:</span>
                <div style={{ fontWeight: 600 }}>{selectedLog.os}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setSelectedLog(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
