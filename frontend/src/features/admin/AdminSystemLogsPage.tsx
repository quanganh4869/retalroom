import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Clock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformSystemLog } from './types/platformAdmin';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminSystemLogsPage: React.FC = () => {
  const { systemLogs } = usePlatformAdmin();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = systemLogs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.correlationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.endpoint && log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesService = serviceFilter === 'ALL' || log.service === serviceFilter;

    return matchesSearch && matchesLevel && matchesService;
  });

  const handleExport = () => {
    toast.success('Xuất log thành công', `Đã kết xuất ${filteredLogs.length} dòng log hệ thống.`);
  };

  const getLevelBadge = (level: PlatformSystemLog['level']) => {
    switch (level) {
      case 'CRITICAL':
      case 'ERROR':
        return <span className="rf-badge rf-badge-danger">{level}</span>;
      case 'WARNING':
        return <span className="rf-badge rf-badge-warning">{level}</span>;
      case 'INFO':
        return <span className="rf-badge rf-badge-active">{level}</span>;
      default:
        return <span className="rf-badge">{level}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>
            Nhật ký ứng dụng & Lỗi API (Application & Error Logs)
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Truy vết lỗi HTTP 4xx/5xx, stack trace kỹ thuật, mã Correlation ID và hiệu năng vi dịch vụ (Microservices Latency).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="rf-btn rf-btn-secondary" onClick={handleExport}>
            <Download size={13} /> Xuất Logs
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rf-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo nội dung lỗi, endpoint (/api/v1/...) hoặc Correlation ID..."
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
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Mọi cấp độ (All Levels)</option>
            <option value="ERROR">ERROR / CRITICAL</option>
            <option value="WARNING">WARNING</option>
            <option value="INFO">INFO</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Mọi dịch vụ</option>
            <option value="API_GATEWAY">API Gateway</option>
            <option value="BILLING_ENGINE">Billing Engine</option>
            <option value="AI_OCR_SVC">AI OCR Service</option>
            <option value="AUTH_SVC">Auth Service</option>
            <option value="NOTIFICATION_SVC">Notification Service</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredLogs.map((log) => {
          const isExpanded = expandedLogId === log.id;
          return (
            <div
              key={log.id}
              className="rf-card"
              style={{
                padding: '14px 18px',
                borderLeft: log.level === 'ERROR' || log.level === 'CRITICAL' ? '4px solid #DC2626' : log.level === 'WARNING' ? '4px solid #F59E0B' : '4px solid #16A34A',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getLevelBadge(log.level)}
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563', fontFamily: 'monospace', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>
                    {log.service}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>
                    {log.timestamp}
                  </span>
                  {log.httpStatus && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: log.httpStatus >= 400 ? '#DC2626' : '#16A34A' }}>
                      {log.httpMethod} {log.endpoint} [{log.httpStatus}]
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {log.durationMs}ms
                  </span>
                  <span style={{ fontFamily: 'monospace' }}>ID: {log.correlationId}</span>
                  {log.stackTraceSnippet && (
                    <button
                      type="button"
                      className="rf-btn rf-btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      Stack trace
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '8px', fontSize: '13px', color: '#1F2937', fontWeight: 500 }}>
                {log.message}
              </div>

              {isExpanded && log.stackTraceSnippet && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '12px',
                    backgroundColor: '#1E293B',
                    color: '#F87171',
                    borderRadius: '6px',
                    fontFamily: 'Consolas, monospace',
                    fontSize: '12px',
                    overflowX: 'auto',
                    lineHeight: 1.4,
                  }}
                >
                  <pre style={{ margin: 0 }}>{log.stackTraceSnippet}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
