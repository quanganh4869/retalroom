import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { onboardingService } from './services/authOnboardingService';
import { useToast } from '@/components/feedback/ToastSystem';
import { RentFlowLogo } from '@/components/ui/RentFlowLogo';

export const ChooseRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserOnboarding } = useAuth();
  const toast = useToast();

  const [selectedRole, setSelectedRole] = useState<'LANDLORD' | 'TENANT' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmRole = async () => {
    if (!selectedRole) {
      toast.warning('Vui lòng chọn vai trò', 'Hãy chọn một vai trò phù hợp với nhu cầu của bạn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onboardingService.selectRole(selectedRole);
      if (response.accessToken) {
        localStorage.setItem('access_token', response.accessToken);
      }
      updateUserOnboarding('IN_PROGRESS', 'PROFILE', selectedRole);
      toast.success('Thiết lập vai trò thành công', 'Bắt đầu quá trình cấu hình tài khoản');

      if (selectedRole === 'LANDLORD') {
        navigate('/onboarding/landlord', { replace: true });
      } else {
        navigate('/onboarding/tenant', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu lựa chọn';
      toast.error('Lỗi thiết lập', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        className="rf-page-enter"
        style={{
          width: '100%',
          maxWidth: '720px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
            <RentFlowLogo size={42} />
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 10px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Chào mừng {user?.name || 'bạn'}! Bạn tham gia RentFlow với vai trò gì?
          </h1>
          <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
            Lựa chọn vai trò phù hợp để chúng tôi cá nhân hóa trải nghiệm quản lý và thanh toán tốt nhất cho bạn.
          </p>
        </div>

        {/* 2 Roles Selection Cards (Strictly Landlord & Tenant only) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {/* Option 1: LANDLORD */}
          <div
            onClick={() => setSelectedRole('LANDLORD')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px 24px',
              border: selectedRole === 'LANDLORD' ? '2.5px solid #00594C' : '1.5px solid #E2E8F0',
              cursor: 'pointer',
              position: 'relative',
              boxShadow:
                selectedRole === 'LANDLORD'
                  ? '0 12px 24px -8px rgba(0, 89, 76, 0.15)'
                  : '0 2px 6px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {selectedRole === 'LANDLORD' && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: '#00594C',
                  color: '#FFFFFF',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
            )}

            <div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: '#E6F4F1',
                  color: '#00594C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '18px',
                }}
              >
                🏢
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                Tôi là Chủ trọ / Quản lý
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Quản lý các tòa nhà, phòng trọ, chốt chỉ số điện nước, lập hóa đơn tự động và quản lý hợp đồng thuê.
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155', lineHeight: 1.8 }}>
                <li>Quản lý danh sách phòng & khách thuê</li>
                <li>Tự động tính toán tiền điện, nước</li>
                <li>Gửi thông báo & nhắc nhở đóng tiền tự động</li>
                <li>Báo cáo doanh thu & tỷ lệ lấp đầy</li>
              </ul>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: selectedRole === 'LANDLORD' ? '#00594C' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {selectedRole === 'LANDLORD' ? '● Đang chọn vai trò này' : 'Chọn vai trò Chủ trọ'}
              </div>
            </div>
          </div>

          {/* Option 2: TENANT */}
          <div
            onClick={() => setSelectedRole('TENANT')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px 24px',
              border: selectedRole === 'TENANT' ? '2.5px solid #00594C' : '1.5px solid #E2E8F0',
              cursor: 'pointer',
              position: 'relative',
              boxShadow:
                selectedRole === 'TENANT'
                  ? '0 12px 24px -8px rgba(0, 89, 76, 0.15)'
                  : '0 2px 6px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {selectedRole === 'TENANT' && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: '#00594C',
                  color: '#FFFFFF',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
            )}

            <div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '18px',
                }}
              >
                🔑
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                Tôi là Khách thuê phòng
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Xem thông tin phòng thuê, tra cứu chi tiết hóa đơn tháng, gửi ảnh chỉ số công tơ và phản ánh sự cố kỹ thuật.
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155', lineHeight: 1.8 }}>
                <li>Tra cứu hóa đơn & thanh toán tiện lợi</li>
                <li>Theo dõi chỉ số điện nước minh bạch</li>
                <li>Gửi phản ánh sự cố, sửa chữa trực tiếp</li>
                <li>Lưu trữ hợp đồng thuê điện tử</li>
              </ul>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: selectedRole === 'TENANT' ? '#00594C' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {selectedRole === 'TENANT' ? '● Đang chọn vai trò này' : 'Chọn vai trò Người thuê'}
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            disabled={!selectedRole || isSubmitting}
            onClick={handleConfirmRole}
            style={{
              padding: '14px 40px',
              backgroundColor: selectedRole ? '#00594C' : '#CBD5E1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: selectedRole && !isSubmitting ? 'pointer' : 'not-allowed',
              boxShadow: selectedRole ? '0 4px 14px rgba(0, 89, 76, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {isSubmitting ? 'Đang thiết lập...' : 'Tiếp tục bước thiết lập →'}
          </button>
        </div>
      </div>
    </div>
  );
};
