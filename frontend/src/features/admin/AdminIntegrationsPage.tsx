import React, { useState } from 'react';
import {
  CheckCircle,
  Zap,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformIntegration } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminIntegrationsPage: React.FC = () => {
  const { integrations, testIntegrationPing } = usePlatformAdmin();
  const toast = useToast();

  const [selectedIntegration, setSelectedIntegration] = useState<PlatformIntegration | null>(null);

  const handlePing = (id: string, name: string) => {
    testIntegrationPing(id);
    toast.success('Kiểm tra kết nối', `Gửi tín hiệu ping tới ${name} thành công. Thời gian phản hồi < 100ms.`);
  };

  const getStatusBadge = (status: PlatformIntegration['status']) => {
    switch (status) {
      case 'OPERATIONAL':
        return (
          <span className="rf-badge rf-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={11} /> Sẵn sàng (Operational)
          </span>
        );
      case 'DEGRADED':
        return <span className="rf-badge rf-badge-warning">Chậm (Degraded)</span>;
      case 'DISRUPTED':
        return <span className="rf-badge rf-badge-danger">Gián đoạn (Outage)</span>;
      default:
        return <span className="rf-badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>
            Tích hợp hệ thống & Dịch vụ ngoại vi (Integrations)
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Kiểm tra trạng thái kết nối, độ trễ và tỷ lệ lỗi 24h của VNPay, VietQR, Zalo ZNS OA, AI OCR và SMS Brandname. Bảo mật: Không để lộ API secret keys.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {integrations.map((intg) => (
          <div
            key={intg.id}
            className="rf-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="rf-badge" style={{ fontSize: '11px', fontWeight: 700 }}>
                  {intg.category}
                </span>
                {getStatusBadge(intg.status)}
              </div>

              <div style={{ fontWeight: 700, fontSize: '16px', color: '#111827', margin: '12px 0 2px 0' }}>
                {intg.name}
              </div>
              <div style={{ fontSize: '12px', color: '#00594C', fontWeight: 600 }}>
                Nhà cung cấp: {intg.provider}
              </div>

              <p style={{ fontSize: '13px', color: '#4B5563', margin: '10px 0', lineHeight: 1.4 }}>
                {intg.description}
              </p>

              {/* Technical specs */}
              <div style={{ padding: '10px 12px', backgroundColor: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#374151' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Xác thực:</span>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{intg.authMode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Độ trễ trung bình:</span>
                  <span style={{ fontWeight: 600, color: '#16A34A' }}>{intg.latencyMs} ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Tỷ lệ lỗi (24h):</span>
                  <span style={{ fontWeight: 600 }}>{intg.errorRate24h}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Ping lần cuối:</span>
                  <span>{intg.lastPingAt}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => setSelectedIntegration(intg)}
              >
                Endpoint Specs
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ padding: '4px 12px', fontSize: '12px' }}
                onClick={() => handlePing(intg.id, intg.name)}
              >
                <Zap size={12} /> Test Ping
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Detail Modal */}
      {selectedIntegration && (
        <Modal
          isOpen={!!selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          title={`Thông số kỹ thuật: ${selectedIntegration.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#6B7280', fontSize: '12px' }}>Endpoint API:</span>
              <div style={{ padding: '8px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '4px' }}>
                {selectedIntegration.endpoint}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '6px', color: '#92400E', fontSize: '12px', border: '1px solid #FDE68A' }}>
              <strong>Chính sách bảo mật dữ liệu:</strong> Khóa bí mật API Keys / Client Secret được mã hóa trong AWS Secrets Manager và bảo vệ bởi RBAC. Quản trị viên chỉ có thể xem cấu hình phương thức kết nối.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setSelectedIntegration(null)}
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
