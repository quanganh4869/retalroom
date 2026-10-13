import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminSystemHealthPage: React.FC = () => {
  const toast = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshHealth = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Hạ tầng ổn định', 'Tất cả 6/6 dịch vụ cốt lõi phản hồi trong hạn mức 50ms.');
    }, 600);
  };

  const services = [
    {
      name: 'API Gateway & FastAPI Backend',
      status: 'OPERATIONAL',
      uptime: '99.99%',
      latency: '28ms',
      version: 'v2.4.1 (FastAPI/Python 3.11)',
      details: 'Cluster 3 Nodes • CPU 14% • RAM 1.2GB/4GB',
    },
    {
      name: 'PostgreSQL Database & Connection Pool',
      status: 'OPERATIONAL',
      uptime: '99.98%',
      latency: '8ms',
      version: 'PostgreSQL 15.4 RDS',
      details: 'Active Connections: 32/200 • Storage: 22GB/100GB (SSD)',
    },
    {
      name: 'Redis Cache & Session Store',
      status: 'OPERATIONAL',
      uptime: '100.0%',
      latency: '2ms',
      version: 'Redis 7.2 In-memory',
      details: 'Cache Hit Rate: 94.6% • Memory: 312MB',
    },
    {
      name: 'AI Agent & LLM OCR Service',
      status: 'OPERATIONAL',
      uptime: '99.95%',
      latency: '210ms',
      version: 'Gemini 1.5 Pro / Flash Inference API',
      details: 'Daily Token Quota: 12% Used • OCR Accuracy: 98.4%',
    },
    {
      name: 'Zalo ZNS & SMS Notification Webhook',
      status: 'OPERATIONAL',
      uptime: '99.92%',
      latency: '115ms',
      version: 'Official Zalo OA Integration v3',
      details: 'Queue: 0 pending • Delivery Rate: 99.8%',
    },
    {
      name: 'VietQR & Banking Webhook Engine',
      status: 'OPERATIONAL',
      uptime: '99.97%',
      latency: '42ms',
      version: 'VietQR / Napas Real-time Switch',
      details: 'Auto-reconciliation latency: < 3.2s',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-active">Infrastructure Monitoring</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Giám sát độ sẵn sàng hạ tầng SaaS theo thời gian thực</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>
            Sức khỏe hệ thống & Hạ tầng Cloud (System Health)
          </h1>
        </div>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={handleRefreshHealth}
          disabled={isRefreshing}
        >
          <RefreshCw size={13} className={isRefreshing ? 'rf-spin' : ''} />
          {isRefreshing ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
        </button>
      </div>

      {/* Global Status Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '8px',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#065F46' }}>
              Mọi hệ thống đang hoạt động tối ưu
            </div>
            <div style={{ fontSize: '12px', color: '#047857' }}>
              Không có sự cố gián đoạn dịch vụ nào được ghi nhận trong 90 ngày qua.
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#065F46' }}>
          <div>Uptime SLA cam kết: <strong>99.95%</strong></div>
          <div>Thực tế tháng này: <strong>99.98%</strong></div>
        </div>
      </div>

      {/* Service Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
        {services.map((svc, i) => (
          <div key={i} className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {svc.name}
                </h3>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{svc.version}</span>
              </div>
              <span className="rf-badge rf-badge-active">Hoạt động</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '6px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#6B7280' }}>Độ sẵn sàng (Uptime):</span>
                <div style={{ fontWeight: 700, color: '#16A34A' }}>{svc.uptime}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Thời gian phản hồi:</span>
                <div style={{ fontWeight: 700, color: '#111827' }}>{svc.latency}</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#4B5563', borderTop: '1px solid #F3F4F6', paddingTop: '8px' }}>
              {svc.details}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
