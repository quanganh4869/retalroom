import React, { useState } from 'react';
import { X, Filter, RotateCcw, Check } from 'lucide-react';
import { AdvancedFilterState } from '../types';

interface AdvancedFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  onApply: (newFilters: AdvancedFilterState) => void;
  onReset: () => void;
}

export const AdvancedFilterDrawer: React.FC<AdvancedFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [draft, setDraft] = useState<AdvancedFilterState>(filters);

  // Sync draft when opened
  React.useEffect(() => {
    setDraft(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    const empty: AdvancedFilterState = {
      fromDate: '',
      toDate: '',
      status: 'ALL',
      authMethod: 'ALL',
      role: 'ALL',
      deviceType: 'ALL',
      os: 'ALL',
      isSuspiciousOnly: false,
    };
    setDraft(empty);
    onReset();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '380px',
          maxWidth: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 61,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#00594C" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
              Bộ lọc nâng cao
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body Form */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontSize: '13px',
          }}
        >
          {/* Time range date inputs */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Khoảng ngày (Từ ngày — Đến ngày)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="date"
                value={draft.fromDate}
                onChange={(e) => setDraft({ ...draft, fromDate: e.target.value })}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <input
                type="date"
                value={draft.toDate}
                onChange={(e) => setDraft({ ...draft, toDate: e.target.value })}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Trạng thái xác thực
            </label>
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công (SUCCESS)</option>
              <option value="FAILED">Thất bại (FAILED)</option>
              <option value="BLOCKED">Bị WAF / Hệ thống chặn (BLOCKED)</option>
            </select>
          </div>

          {/* Auth Method */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Phương thức xác thực
            </label>
            <select
              value={draft.authMethod}
              onChange={(e) => setDraft({ ...draft, authMethod: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">Tất cả phương thức</option>
              <option value="PASSWORD">Mật khẩu tiêu chuẩn</option>
              <option value="PASSWORD_2FA">Mật khẩu + 2FA TOTP</option>
              <option value="GOOGLE_SSO">Google SSO</option>
              <option value="MAGIC_LINK">Magic Link Email</option>
            </select>
          </div>

          {/* User Role */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Vai trò tài khoản
            </label>
            <select
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="SUPERADMIN">SuperAdmin (Nền tảng)</option>
              <option value="SUPPORT_AGENT">Hỗ trợ CSKH (Support)</option>
              <option value="LANDLORD">Chủ nhà (Landlord)</option>
              <option value="TENANT">Khách thuê (Tenant)</option>
              <option value="UNAUTHENTICATED">Chưa xác thực (Ẩn danh)</option>
            </select>
          </div>

          {/* Device Type */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Loại thiết bị
            </label>
            <select
              value={draft.deviceType}
              onChange={(e) => setDraft({ ...draft, deviceType: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">Tất cả thiết bị</option>
              <option value="DESKTOP">Máy tính bàn / Laptop (Desktop)</option>
              <option value="MOBILE">Điện thoại di động (Mobile)</option>
              <option value="TABLET">Máy tính bảng (Tablet)</option>
              <option value="API_CLIENT">API Client / Tool tự động</option>
            </select>
          </div>

          {/* Operating System */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Hệ điều hành
            </label>
            <select
              value={draft.os}
              onChange={(e) => setDraft({ ...draft, os: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">Tất cả hệ điều hành</option>
              <option value="Windows">Windows</option>
              <option value="macOS">macOS</option>
              <option value="Linux">Linux</option>
              <option value="iOS">iOS (iPhone/iPad)</option>
              <option value="Android">Android</option>
            </select>
          </div>

          {/* Suspicious Only */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#FEF2F2',
              borderRadius: '6px',
              border: '1px solid #FECACA',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#991B1B',
              }}
            >
              <input
                type="checkbox"
                checked={draft.isSuspiciousOnly}
                onChange={(e) => setDraft({ ...draft, isSuspiciousOnly: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Chỉ hiển thị các sự kiện đáng ngờ / tấn công</span>
            </label>
          </div>
        </div>

        {/* Drawer Actions */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            gap: '10px',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          }}
        >
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={handleReset}
            style={{ fontSize: '13px' }}
          >
            <RotateCcw size={13} /> Đặt lại
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={onClose}
              style={{ fontSize: '13px' }}
            >
              Đóng
            </button>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={handleApply}
              style={{ fontSize: '13px' }}
            >
              <Check size={14} /> Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ActiveFilterChips: React.FC<{
  filters: AdvancedFilterState;
  onRemove: (key: keyof AdvancedFilterState) => void;
}> = ({ filters, onRemove }) => {
  const chips: { key: keyof AdvancedFilterState; label: string }[] = [];

  if (filters.status && filters.status !== 'ALL') {
    const statusMap: Record<string, string> = {
      SUCCESS: 'Thành công',
      FAILED: 'Thất bại',
      BLOCKED: 'Bị chặn',
    };
    chips.push({ key: 'status', label: `Trạng thái: ${statusMap[filters.status] || filters.status}` });
  }

  if (filters.authMethod && filters.authMethod !== 'ALL') {
    chips.push({ key: 'authMethod', label: `Phương thức: ${filters.authMethod}` });
  }

  if (filters.role && filters.role !== 'ALL') {
    chips.push({ key: 'role', label: `Vai trò: ${filters.role}` });
  }

  if (filters.deviceType && filters.deviceType !== 'ALL') {
    chips.push({ key: 'deviceType', label: `Thiết bị: ${filters.deviceType}` });
  }

  if (filters.os && filters.os !== 'ALL') {
    chips.push({ key: 'os', label: `HĐH: ${filters.os}` });
  }

  if (filters.isSuspiciousOnly) {
    chips.push({ key: 'isSuspiciousOnly', label: 'Chỉ sự kiện đáng ngờ' });
  }

  if (filters.fromDate || filters.toDate) {
    const fromStr = filters.fromDate ? `Từ ${filters.fromDate}` : '';
    const toStr = filters.toDate ? `Đến ${filters.toDate}` : '';
    chips.push({ key: 'fromDate', label: [fromStr, toStr].filter(Boolean).join(' - ') });
  }

  if (chips.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Bộ lọc đang bật:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            backgroundColor: '#E6F0EE',
            color: '#00594C',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#00594C',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
            }}
            title="Xóa bộ lọc này"
          >
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
};
