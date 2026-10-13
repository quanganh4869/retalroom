import React, { useState } from 'react';
import {
  Key,
  Globe,
  Lock,
  Save,
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminSettingsPage: React.FC = () => {
  const toast = useToast();

  const [platformName, setPlatformName] = useState('RentFlow SaaS Enterprise');
  const [supportEmail, setSupportEmail] = useState('support@rentflow.vn');
  const [hotline, setHotline] = useState('1900 6868');
  const [require2FAForStaff, setRequire2FAForStaff] = useState(true);
  const [autoLockInactiveAccounts, setAutoLockInactiveAccounts] = useState(true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [vnpayTmnCode, setVnpayTmnCode] = useState('RENTFLOW_PROD');
  const [zaloOaAppId, setZaloOaAppId] = useState('482910481920');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã lưu cấu hình', 'Các thiết lập bảo mật và vận hành nền tảng đã được cập nhật.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-danger">Platform Configuration</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Thiết lập an ninh & cổng dịch vụ toàn hệ thống</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>
            Cài đặt & Cấu hình nền tảng RentFlow
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: Platform Brand & Contact */}
        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} color="#00594C" /> Thông tin thương hiệu & Liên hệ CSKH
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Tên nền tảng
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Email tiếp nhận hỗ trợ
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Hotline tổng đài 24/7
              </label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Platform Security Policies */}
        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} color="#00594C" /> Chính sách bảo mật & Xác thực
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={require2FAForStaff}
                onChange={(e) => setRequire2FAForStaff(e.target.checked)}
              />
              <span>
                <strong>Bắt buộc xác thực 2 lớp (2FA TOTP)</strong> đối với toàn bộ tài khoản nhân sự quản trị (SuperAdmin, Support Ops, Billing).
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={autoLockInactiveAccounts}
                onChange={(e) => setAutoLockInactiveAccounts(e.target.checked)}
              />
              <span>
                <strong>Tự động khóa tài khoản</strong> sau 90 ngày không phát sinh lượt đăng nhập nhằm phòng tránh chiếm quyền sử dụng.
              </span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <span style={{ fontSize: '13px', color: '#374151' }}>Số lần thử mật khẩu sai tối đa trước khi khóa IP tạm thời (30 phút):</span>
              <select
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px', backgroundColor: '#FFFFFF' }}
              >
                <option value="3">3 lần</option>
                <option value="5">5 lần (Khuyến nghị)</option>
                <option value="10">10 lần</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Integrations & Gateways */}
        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={16} color="#00594C" /> Khóa API Cổng thanh toán & Zalo ZNS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                VNPay Merchant Terminal Code (TMN Code)
              </label>
              <input
                type="text"
                value={vnpayTmnCode}
                onChange={(e) => setVnpayTmnCode(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px', fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Zalo OA App ID (Official Account Notification)
              </label>
              <input
                type="text"
                value={zaloOaAppId}
                onChange={(e) => setZaloOaAppId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px', fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="rf-btn rf-btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
            <Save size={16} /> Lưu thay đổi cấu hình
          </button>
        </div>
      </form>
    </div>
  );
};
