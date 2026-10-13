import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Filter,
  Info,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformBackgroundJob } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminBackgroundJobsPage: React.FC = () => {
  const { backgroundJobs, retryBackgroundJob } = usePlatformAdmin();
  const toast = useToast();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedJob, setSelectedJob] = useState<PlatformBackgroundJob | null>(null);

  const filteredJobs = backgroundJobs.filter((job) => {
    return statusFilter === 'ALL' || job.status === statusFilter;
  });

  const handleRetry = (job: PlatformBackgroundJob) => {
    retryBackgroundJob(job.id);
    toast.success('Đã kích hoạt lại Job', `Tác vụ [${job.id}] ${job.title} đang được tiến hành thử lại.`);
  };

  const getStatusBadge = (status: PlatformBackgroundJob['status']) => {
    switch (status) {
      case 'SUCCEEDED':
        return (
          <span className="rf-badge rf-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={11} /> Thành công
          </span>
        );
      case 'RUNNING':
        return (
          <span className="rf-badge rf-badge-vacant" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Play size={11} /> Đang chạy
          </span>
        );
      case 'FAILED':
        return (
          <span className="rf-badge rf-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={11} /> Thất bại
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
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Cron Jobs & Asynchronous Workers</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 2px 0' }}>
            Quản lý tác vụ nền & Công việc định kỳ (Background Jobs)
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Theo dõi tiến độ tạo hóa đơn chu kỳ tự động, gửi tin nhắn Zalo ZNS nhắc nợ, đối soát ngân hàng và batch nhận diện AI OCR.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rf-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
        <Filter size={15} color="#6B7280" />
        <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: 500 }}>Lọc theo trạng thái:</span>
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
          <option value="ALL">Tất cả trạng thái</option>
          <option value="RUNNING">Đang chạy (Running)</option>
          <option value="SUCCEEDED">Thành công (Succeeded)</option>
          <option value="FAILED">Thất bại (Failed)</option>
        </select>
      </div>

      {/* Jobs Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Mã Job / Tên tác vụ</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Phân loại</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Thời gian thực thi</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Số lần thử</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Thời lượng</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{job.title}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>ID: {job.id}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="rf-badge" style={{ fontSize: '11px' }}>{job.jobType}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{getStatusBadge(job.status)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4B5563' }}>
                    {job.startedAt || job.createdAt}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{job.attempts} lần</td>
                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{(job.durationMs / 1000).toFixed(1)}s</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="rf-btn rf-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setSelectedJob(job)}
                      >
                        <Info size={12} /> Chi tiết
                      </button>
                      {job.status === 'FAILED' && (
                        <button
                          type="button"
                          className="rf-btn rf-btn-primary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleRetry(job)}
                        >
                          <RotateCcw size={12} /> Thử lại
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`Chi tiết tác vụ: ${selectedJob.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>{selectedJob.title}</div>
              <div style={{ color: '#4B5563', marginTop: '4px' }}>{selectedJob.payloadSummary}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Trạng thái:</span>
                <div>{getStatusBadge(selectedJob.status)}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Thời lượng:</span>
                <div style={{ fontWeight: 600 }}>{(selectedJob.durationMs / 1000).toFixed(1)} giây</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Tạo lúc:</span>
                <div>{selectedJob.createdAt}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Số lần thử lại:</span>
                <div>{selectedJob.attempts}</div>
              </div>
            </div>

            {selectedJob.lastError && (
              <div style={{ padding: '10px 12px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FEE2E2', color: '#991B1B' }}>
                <strong>Lỗi kỹ thuật ghi nhận:</strong>
                <pre style={{ margin: '6px 0 0 0', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                  {selectedJob.lastError}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setSelectedJob(null)}
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
