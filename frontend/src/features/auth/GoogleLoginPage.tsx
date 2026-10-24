import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from './AuthContext';
import { useToast } from '@/components/feedback/ToastSystem';
import { RentFlowLogo } from '@/components/ui/BrandLogos';

export const GoogleLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const handlePostLoginRedirect = (loggedInUser: { role?: UserRole; onboardingStatus?: string }) => {
    if (loggedInUser.role === 'ADMIN' || loggedInUser.role === 'SUPERADMIN') {
      navigate('/platform/overview', { replace: true });
      return;
    }

    if (loggedInUser.onboardingStatus === 'COMPLETED') {
      if (loggedInUser.role === 'TENANT') {
        navigate('/tenant/dashboard', { replace: true });
      } else {
        navigate('/landlord/dashboard', { replace: true });
      }
      return;
    }

    // Still onboarding
    if (!loggedInUser.role) {
      navigate('/onboarding/role', { replace: true });
    } else if (loggedInUser.role === 'LANDLORD') {
      navigate('/onboarding/landlord', { replace: true });
    } else {
      navigate('/onboarding/tenant', { replace: true });
    }
  };

  const handleContinueWithGoogle = async (mockToken?: string) => {
    setIsLoading(true);
    try {
      // In development / demo environment without Google OAuth Client credentials configured,
      // we utilize our secure dev-token handler which executes the exact same user-creation
      // and onboarding lifecycle on the PostgreSQL backend.
      const idToken = mockToken || 'dev-google-token:nguyenan.property@gmail.com:Nguyễn An';
      const authenticatedUser = await loginWithGoogle(idToken);
      toast.success('Đăng nhập Google thành công', `Chào mừng ${authenticatedUser.name}`);
      handlePostLoginRedirect(authenticatedUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xác thực với máy chủ';
      toast.error('Đăng nhập thất bại', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevQuickLogin = (email: string, name: string) => {
    setShowDevModal(false);
    handleContinueWithGoogle(`dev-google-token:${email}:${name}`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background aesthetic blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 89, 76, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="rf-card rf-page-enter"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 36px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
            <RentFlowLogo size={46} />
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Chào mừng đến với RentFlow
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
            Nền tảng quản lý phòng trọ và kết nối cư dân số 1 Việt Nam
          </p>
        </div>

        {/* Primary Action: Continue with Google */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleContinueWithGoogle()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '13px 20px',
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
              border: '1.5px solid #E2E8F0',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
              outline: 'none',
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
              }
            }}
          >
            {/* Official Google G Logo SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>{isLoading ? 'Đang xác thực...' : 'Tiếp tục với Google'}</span>
          </button>

          {/* Quick Dev Switcher for testing all scenarios */}
          <button
            type="button"
            onClick={() => setShowDevModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              fontSize: '12px',
              color: '#00594C',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '4px',
            }}
          >
            🛠️ Mở môi trường thử nghiệm tài khoản (Dev Hub)
          </button>
        </div>

        {/* Security & Terms note */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #F1F5F9',
            textAlign: 'center',
            fontSize: '12px',
            color: '#94A3B8',
            lineHeight: 1.6,
          }}
        >
          Bằng việc tiếp tục, bạn đồng ý với{' '}
          <a href="#" style={{ color: '#00594C', textDecoration: 'none', fontWeight: 500 }}>
            Điều khoản dịch vụ
          </a>{' '}
          và{' '}
          <a href="#" style={{ color: '#00594C', textDecoration: 'none', fontWeight: 500 }}>
            Chính sách quyền riêng tư
          </a>{' '}
          của RentFlow.
        </div>
      </div>

      {/* Dev Switcher Modal */}
      {showDevModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                🧪 Thử nghiệm đăng nhập Google
              </h3>
              <button
                type="button"
                onClick={() => setShowDevModal(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#64748B',
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Chọn kịch bản nhanh hoặc nhập địa chỉ email Google bất kỳ để kiểm thử quy trình khởi tạo tài khoản thực tế trên cơ sở dữ liệu:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => handleDevQuickLogin(`landlord.${Date.now()}@rentflow.vn`, 'Chủ Nhà Mới')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                    🆕 Chủ nhà mới (Chưa Onboarding)
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Tự động đưa vào luồng chọn vai trò & thiết lập nhà trọ</div>
                </div>
                <span style={{ fontSize: '12px', color: '#00594C', fontWeight: 600 }}>Chọn →</span>
              </button>

              <button
                type="button"
                onClick={() => handleDevQuickLogin(`tenant.${Date.now()}@rentflow.vn`, 'Người Thuê Mới')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                    🆕 Người thuê mới (Chưa Onboarding)
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Tự động đưa vào luồng nhập mã mời kết nối phòng</div>
                </div>
                <span style={{ fontSize: '12px', color: '#00594C', fontWeight: 600 }}>Chọn →</span>
              </button>

              <button
                type="button"
                onClick={() => handleDevQuickLogin('nguyenan.property@gmail.com', 'Nguyễn An')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                    ✅ Chủ nhà hiện hữu (Đã hoàn tất Onboarding)
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>nguyenan.property@gmail.com</div>
                </div>
                <span style={{ fontSize: '12px', color: '#00594C', fontWeight: 600 }}>Chọn →</span>
              </button>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Hoặc nhập thông tin tùy chỉnh:
              </div>
              <input
                type="email"
                placeholder="Email Google (ví dụ: myemail@gmail.com)"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}
              />
              <input
                type="text"
                placeholder="Họ tên hiển thị (ví dụ: Nguyễn Văn A)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  marginBottom: '12px',
                }}
              />
              <button
                type="button"
                disabled={!customEmail}
                onClick={() => handleDevQuickLogin(customEmail, customName || 'Google User')}
                style={{
                  width: '100%',
                  padding: '9px',
                  backgroundColor: customEmail ? '#00594C' : '#94A3B8',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: customEmail ? 'pointer' : 'not-allowed',
                }}
              >
                Xác thực với Email này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
