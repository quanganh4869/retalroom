import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { RentFlowLogo } from '@/components/ui/RentFlowLogo';

export const AccessDeniedPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFBF9', padding: '24px' }}>
      <div className="rf-card rf-page-enter" style={{ maxWidth: '460px', width: '100%', textAlign: 'center', padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FCE8E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldAlert size={26} color="#C5221F" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111827' }}>
          403 — Truy cập bị từ chối
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
          Tài khoản hiện tại của bạn không có đủ thẩm quyền để truy cập vào khu vực này.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <NavLink to="/" className="rf-btn rf-btn-primary">
            <ArrowLeft size={14} /> Quay về trang phù hợp
          </NavLink>
          <NavLink to="/auth/roles" className="rf-btn rf-btn-secondary">
            Đổi tài khoản khác
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFBF9', padding: '24px' }}>
      <div className="rf-card rf-page-enter" style={{ maxWidth: '460px', width: '100%', textAlign: 'center', padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <RentFlowLogo size={36} />
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#111827' }}>
          404 — Không tìm thấy trang
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
          Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được di chuyển sang vị trí mới.
        </p>
        <NavLink to="/" className="rf-btn rf-btn-primary" style={{ marginTop: '10px' }}>
          <ArrowLeft size={14} /> Trở về trang chủ
        </NavLink>
      </div>
    </div>
  );
};
