import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { PropertyForm } from '@/features/properties/components/PropertyForm';
import { DoorOpen, MapPin, Layers, Building2 } from 'lucide-react';

export const PropertyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = React.useState(false);
  const { data, isLoading, isError, error } = useProperties();

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý Bất động sản & Tòa nhà
          </h1>
          <p style={{ color: '#6B7280', fontSize: '13px', margin: '4px 0 0 0' }}>
            Danh sách các cụm tòa nhà, chung cư mini và nhà trọ đang vận hành.
          </p>
        </div>

        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            + Thêm tòa nhà mới
          </Button>
        )}
      </div>

      {showForm && (
        <PropertyForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      )}

      {isLoading && (
        <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
          Đang tải danh sách cơ sở...
        </div>
      )}

      {isError && (
        <Alert
          type="error"
          title="Không thể tải danh sách bất động sản"
          message={error instanceof Error ? error.message : 'Có lỗi không xác định xảy ra'}
        />
      )}

      {!isLoading && !isError && data?.items.length === 0 && (
        <EmptyState
          title="Chưa có tòa nhà nào được đăng ký"
          description="Bắt đầu thiết lập cơ sở đầu tiên để quản lý các tầng và danh mục phòng trọ."
          actionText="Thêm tòa nhà đầu tiên"
          onAction={() => setShowForm(true)}
        />
      )}

      {!isLoading && !isError && (data?.items.length ?? 0) > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {data?.items.map((prop) => (
            <div
              key={prop.id}
              className="rf-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{prop.name}</h3>
                <span className="rf-badge rf-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={11} /> {prop.total_floors} Tầng
                </span>
              </div>
              <p style={{ color: '#4B5563', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="#6B7280" /> {prop.address}, {prop.city}
              </p>
              {prop.description && (
                <p style={{ color: '#6B7280', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
                  {prop.description}
                </p>
              )}
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                  onClick={() => navigate(`/properties/${prop.id}`)}
                >
                  <Building2 size={13} /> Chi tiết tòa nhà
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                  onClick={() => navigate('/rooms')}
                >
                  <DoorOpen size={13} /> Sơ đồ phòng →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
