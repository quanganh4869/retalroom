import React, { useState } from 'react';
import { Camera, CheckCircle2, ChevronRight, Droplets, Zap } from 'lucide-react';

export const HandoverPage: React.FC = () => {
  const [checklist, setChecklist] = useState([
    { id: 1, name: 'Khóa cửa phòng & thẻ từ căn hộ (2 chìa, 1 thẻ)', checked: true },
    { id: 2, name: 'Máy lạnh hoạt động tốt, có remote điều khiển', checked: true },
    { id: 3, name: 'Tủ lạnh mini, sạch sẽ, làm đá bình thường', checked: true },
    { id: 4, name: 'Hệ thống đèn trần & công tắc điện hoạt động đủ', checked: false },
    { id: 5, name: 'Bồn cầu, vòi sen, lavabo không rò rỉ nước', checked: true },
    { id: 6, name: 'Giường, nệm, tủ quần áo không trầy xước nặng', checked: true },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Biên bản bàn giao phòng — P.302
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Khách nhận phòng: Bùi Lan Anh • Ngày bàn giao: 11/10/2026 • Hợp đồng CT-2023-048
          </p>
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
                style={{ padding: '3px 8px', fontSize: '11px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Chức năng đính kèm ảnh hiện trạng trang thiết bị');
                }}
              >
                <Camera size={12} />
                Chụp ảnh
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
          <button className="rf-btn rf-btn-secondary">
            Lưu bản nháp
          </button>
          <button className="rf-btn rf-btn-primary">
            <CheckCircle2 size={15} />
            <span>Xác nhận & Hoàn tất bàn giao phòng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
