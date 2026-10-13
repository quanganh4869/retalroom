import React, { useState } from 'react';
import {
  CheckCircle,
  Shield,
  Sliders,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformBackupRecord } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminBackupsPage: React.FC = () => {
  const { backupRecords } = usePlatformAdmin();
  const toast = useToast();

  const [selectedRecord, setSelectedRecord] = useState<PlatformBackupRecord | null>(null);
  const [retentionPolicyModalOpen, setRetentionPolicyModalOpen] = useState(false);
  const [retentionDaysAudit, setRetentionDaysAudit] = useState(365);
  const [retentionDaysLogs, setRetentionDaysLogs] = useState(90);

  const handleSaveRetention = () => {
    setRetentionPolicyModalOpen(false);
    toast.success(
      'Cập nhật chính sách lưu trữ (Mô phỏng)',
      `Đã cập nhật thời hạn lưu Audit logs: ${retentionDaysAudit} ngày, System logs: ${retentionDaysLogs} ngày.`
    );
  };

  const getStatusBadge = (status: PlatformBackupRecord['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="rf-badge rf-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={11} /> Đã kiểm định (Verified)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="rf-badge rf-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={11} /> Hoàn tất
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
            <span className="rf-badge rf-badge-danger">VẬN HÀNH HỆ THỐNG</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Sao lưu dữ liệu & Chính sách lưu trữ (Demo Preview)</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 2px 0' }}>
            Trạng thái sao lưu & Lưu trữ dữ liệu (Backup Status & Retention)
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Kiểm tra trạng thái các bản sao lưu PostgreSQL tự động hàng ngày, mã băm Checksum toàn vẹn và cấu hình vòng đời lưu trữ dữ liệu.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => setRetentionPolicyModalOpen(true)}
          >
            <Sliders size={13} /> Chính sách lưu trữ (Retention)
          </button>
        </div>
      </div>

      {/* Demo Warning Alert */}
      <div style={{ padding: '12px 16px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#1E40AF' }}>
        <Shield size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Chế độ mô phỏng giao diện:</strong> Các bản sao lưu dưới đây minh họa trực quan trạng thái vận hành sao lưu đám mây. Thao tác phục hồi hạ tầng thực tế được phân quyền tại cụm máy chủ AWS/GCP DevOps.
        </div>
      </div>

      {/* Backups Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Mã bản sao lưu</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Loại sao lưu</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Dung lượng</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Thời điểm hoàn thành</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Vòng đời lưu</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563', textAlign: 'right' }}>Thông số</th>
              </tr>
            </thead>
            <tbody>
              {backupRecords.map((bk) => (
                <tr key={bk.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#00594C' }}>
                    {bk.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="rf-badge" style={{ fontSize: '11px' }}>{bk.backupType}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {(bk.fileSizeMb / 1024).toFixed(2)} GB
                  </td>
                  <td style={{ padding: '12px 16px', color: '#4B5563' }}>
                    {bk.completedAt}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>
                    {bk.retentionDays} ngày
                  </td>
                  <td style={{ padding: '12px 16px' }}>{getStatusBadge(bk.status)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="rf-btn rf-btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      onClick={() => setSelectedRecord(bk)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Thông số bản sao lưu: ${selectedRecord.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#6B7280', fontSize: '12px' }}>Đường dẫn lưu trữ đối tượng:</span>
              <div style={{ padding: '8px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontFamily: 'monospace', marginTop: '4px', wordBreak: 'break-all' }}>
                {selectedRecord.location}
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '12px' }}>Mã băm toàn vẹn Checksum SHA-256:</span>
              <div style={{ padding: '8px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontFamily: 'monospace', marginTop: '4px', wordBreak: 'break-all' }}>
                {selectedRecord.checksum}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setSelectedRecord(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Retention Policy Modal */}
      {retentionPolicyModalOpen && (
        <Modal
          isOpen={retentionPolicyModalOpen}
          onClose={() => setRetentionPolicyModalOpen(false)}
          title="Cấu hình chính sách vòng đời lưu trữ (Data Retention)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Thời hạn lưu trữ Audit Logs (ngày):
              </label>
              <input
                type="number"
                value={retentionDaysAudit}
                onChange={(e) => setRetentionDaysAudit(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Thời hạn lưu trữ Application / System Logs (ngày):
              </label>
              <input
                type="number"
                value={retentionDaysLogs}
                onChange={(e) => setRetentionDaysLogs(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => setRetentionPolicyModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={handleSaveRetention}
              >
                Lưu chính sách
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
