import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Droplets, Eye, X, Zap, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastSystem';

interface ChecklistItem {
  id: number;
  name: string;
  checked: boolean;
  imageUrl: string;
  photoDate: string;
  condition: string;
}

export const HandoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const contractId = searchParams.get('contractId') || 'CT-2023-048';
  const roomCode = searchParams.get('roomCode') || 'P.302';
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 1,
      name: 'Khóa cửa phòng & thẻ từ căn hộ (2 chìa, 1 thẻ)',
      checked: true,
      imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&auto=format&fit=crop&q=80',
      photoDate: '11/10/2026 09:05',
      condition: 'Khóa cửa điện tử và 2 chìa khóa cơ hoạt động trơn tru.',
    },
    {
      id: 2,
      name: 'Máy lạnh hoạt động tốt, có remote điều khiển',
      checked: true,
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      photoDate: '11/10/2026 09:10',
      condition: 'Máy lạnh làm lạnh sâu, lưới lọc đã được vệ sinh sạch.',
    },
    {
      id: 3,
      name: 'Tủ lạnh mini, sạch sẽ, làm đá bình thường',
      checked: true,
      imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80',
      photoDate: '11/10/2026 09:12',
      condition: 'Tủ lạnh mini 90L chạy êm, đủ khay kệ.',
    },
    {
      id: 4,
      name: 'Hệ thống đèn trần & công tắc điện hoạt động đủ',
      checked: false,
      imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&auto=format&fit=crop&q=80',
      photoDate: '11/10/2026 09:15',
      condition: 'Đèn led downlight sáng đều, 1 bóng góc tường hơi chớp nhẹ.',
    },
    {
      id: 5,
      name: 'Bồn cầu, vòi sen, lavabo không rò rỉ nước',
      checked: true,
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
      photoDate: '11/10/2026 09:18',
      condition: 'Áp lực nước mạnh, thiết bị vệ sinh sạch sẽ không rò rỉ.',
    },
    {
      id: 6,
      name: 'Giường, nệm, tủ quần áo không trầy xước nặng',
      checked: true,
      imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?w=800&auto=format&fit=crop&q=80',
      photoDate: '11/10/2026 09:20',
      condition: 'Nệm cao su non có ga bọc mới, tủ gỗ mở êm.',
    },
  ]);

  const [previewItem, setPreviewItem] = useState<ChecklistItem | null>(null);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => navigate(-1)}
            title="Quay lại trang trước"
          >
            <ArrowLeft size={14} /> Quay lại
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Biên bản bàn giao phòng — {roomCode}
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
              Khách nhận phòng: Bùi Lan Anh • Ngày bàn giao: 11/10/2026 • Hợp đồng {contractId}
            </p>
          </div>
        </div>
        <span className="rf-badge rf-badge-warning" style={{ fontSize: '13px', padding: '6px 12px' }}>
          Đang thực hiện bàn giao
        </span>
      </div>

      {/* Stepper Wizard (Screen 23.png) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#E6F4EA', color: '#137333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
            ✓
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>1. Ký hợp đồng & nộp cọc</span>
        </div>
        <ChevronRight size={16} color="#D1D5DB" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#00594C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
            2
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#00594C' }}>2. Kiểm kê hiện trạng phòng</span>
        </div>
        <ChevronRight size={16} color="#D1D5DB" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
            3
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>3. Chốt số điện nước đầu vào</span>
        </div>
        <ChevronRight size={16} color="#D1D5DB" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
            4
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>4. Ký nhận & Giao chìa khóa</span>
        </div>
      </div>

      {/* Main Checklist Card */}
      <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
          Danh mục trang thiết bị bàn giao phòng P.302
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: item.checked ? '#F0FDF4' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  style={{ width: '16px', height: '16px', accentColor: '#00594C' }}
                />
                <span style={{ fontSize: '13px', color: '#111827', fontWeight: item.checked ? 600 : 400 }}>
                  {item.name}
                </span>
              </div>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ padding: '3px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewItem(item);
                }}
              >
                <Eye size={12} />
                Xem ảnh
              </button>
            </div>
          ))}
        </div>

        {/* Chốt chỉ số ban đầu */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '10px' }}>
            Chỉ số đồng hồ tại thời điểm bàn giao
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#92400E' }}>
                <Zap size={14} /> Chỉ số Điện ban đầu (kWh)
              </div>
              <input
                type="number"
                defaultValue={835}
                style={{ marginTop: '6px', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #D97706', fontSize: '14px', fontWeight: 700 }}
              />
            </div>
            <div style={{ padding: '12px', backgroundColor: '#E0F2FE', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#075985' }}>
                <Droplets size={14} /> Chỉ số Nước ban đầu (m³)
              </div>
              <input
                type="number"
                defaultValue={29}
                style={{ marginTop: '6px', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #0284C7', fontSize: '14px', fontWeight: 700 }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => {
              toast.info('Đã lưu bản nháp', 'Tiến trình kiểm kê hiện trạng đã được lưu tạm.');
            }}
          >
            Lưu bản nháp
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => {
              toast.success('Bàn giao thành công!', `Biên bản bàn giao phòng ${roomCode} theo hợp đồng ${contractId} đã được ký nhận điện tử.`);
              navigate(-1);
            }}
          >
            <CheckCircle2 size={15} />
            <span>Xác nhận & Hoàn tất bàn giao phòng</span>
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '560px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Ảnh hiện trạng bàn giao
                </h3>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  {previewItem.name}
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F9FAFB' }}>
              <div
                style={{
                  width: '100%',
                  height: '280px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Thời điểm chụp:</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{previewItem.photoDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Tình trạng:</span>
                  <span style={{ fontWeight: 600, color: '#00594C' }}>{previewItem.condition}</span>
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '12px 18px',
                borderTop: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => setPreviewItem(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
