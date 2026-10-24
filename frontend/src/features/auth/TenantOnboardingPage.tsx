import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { onboardingService, OnboardingStatusResponse, InvitationDetails } from './services/authOnboardingService';
import { useToast } from '@/components/feedback/ToastSystem';
import { RentFlowLogo } from '@/components/ui/BrandLogos';
import { BrandLoader } from '@/components/ui/LoadingSystem';

const STEPS = [
  { id: 'PROFILE', label: '1. Hồ sơ cá nhân' },
  { id: 'CONNECT', label: '2. Mã mời phòng' },
  { id: 'CONFIRMATION', label: '3. Xác nhận' },
  { id: 'COMPLETE', label: '4. Hoàn tất' },
];

export const TenantOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserOnboarding } = useAuth();
  const toast = useToast();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');

  // Step 2 Invite Code
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [invitationPreview, setInvitationPreview] = useState<InvitationDetails | null>(null);
  const [isSkipped, setIsSkipped] = useState(false);

  // Step 3 Confirmation State
  const [confirmedProperty, setConfirmedProperty] = useState('');
  const [confirmedRoom, setConfirmedRoom] = useState('');

  // Load latest state from backend on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res: OnboardingStatusResponse = await onboardingService.getStatus();
        if (res.profile?.fullName) setFullName(res.profile.fullName);
        if (res.profile?.phoneNumber) setPhoneNumber(res.profile.phoneNumber);
        if (res.propertyName) setConfirmedProperty(res.propertyName);
        if (res.roomNumber) setConfirmedRoom(res.roomNumber);

        if (res.status === 'COMPLETED') {
          navigate('/tenant/dashboard', { replace: true });
          return;
        }

        const stepMap: Record<string, number> = {
          ROLE: 0,
          PROFILE: 0,
          CONNECT: 1,
          CONFIRMATION: 2,
          COMPLETE: 3,
        };
        if (res.step && stepMap[res.step] !== undefined) {
          setCurrentStepIndex(stepMap[res.step]);
        }
      } catch (err) {
        console.warn('Could not sync tenant onboarding status:', err);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  // Step 1: Profile Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.warning('Thiếu thông tin', 'Vui lòng nhập họ và tên của bạn.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onboardingService.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      });
      updateUserOnboarding('IN_PROGRESS', 'CONNECT');
      toast.success('Lưu thông tin thành công', 'Tiến hành kết nối phòng trọ');
      setCurrentStepIndex(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật hồ sơ';
      toast.error('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify Invite Code
  const handleVerifyCode = async () => {
    if (!inviteCode.trim()) {
      toast.warning('Thiếu mã mời', 'Vui lòng nhập mã mời được cấp bởi chủ nhà.');
      return;
    }
    setIsVerifyingCode(true);
    try {
      const details = await onboardingService.getInviteDetails(inviteCode.trim());
      setInvitationPreview(details);
      toast.success('Tìm thấy thông tin phòng!', `${details.propertyName} - Phòng ${details.roomNumber || ''}`);
    } catch (err: unknown) {
      setInvitationPreview(null);
      const msg = err instanceof Error ? err.message : 'Mã mời không tồn tại hoặc đã hết hạn';
      toast.error('Mã mời không hợp lệ', msg);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Step 2: Accept Code
  const handleAcceptInvite = async () => {
    if (!inviteCode.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await onboardingService.acceptInvite(inviteCode.trim());
      if (res.propertyName) setConfirmedProperty(res.propertyName);
      if (res.roomNumber) setConfirmedRoom(res.roomNumber);
      setIsSkipped(false);
      updateUserOnboarding('IN_PROGRESS', 'CONFIRMATION');
      toast.success('Gia nhập phòng thành công!', 'Kiểm tra thông tin trước khi hoàn tất');
      setCurrentStepIndex(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể chấp nhận mã mời';
      toast.error('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Skip Code
  const handleSkipInvite = async () => {
    setIsSubmitting(true);
    try {
      await onboardingService.skipInvite();
      setIsSkipped(true);
      updateUserOnboarding('IN_PROGRESS', 'CONFIRMATION');
      toast.info('Đã bỏ qua mã mời', 'Bạn có thể nhập mã mời sau trong Cài đặt tài khoản');
      setCurrentStepIndex(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể bỏ qua';
      toast.error('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Complete Onboarding
  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      await onboardingService.completeTenant();
      updateUserOnboarding('COMPLETED', 'COMPLETE');
      toast.success('Chào mừng bạn đến với RentFlow!', 'Truy cập cổng cư dân thành công');
      navigate('/tenant/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi hoàn tất thiết lập';
      toast.error('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitial) {
    return <BrandLoader message="Đang tải tiến trình thiết lập cư dân..." />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '32px 16px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Brand bar */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <RentFlowLogo size={40} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Khởi tạo không gian Khách thuê
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px' }}>
            Kết nối trực tiếp với phòng trọ và hóa đơn hàng tháng của bạn
          </p>
        </div>

        {/* Stepper Progress Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflowX: 'auto',
          }}
        >
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isCurrent || isCompleted ? 1 : 0.45,
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#00594C' : isCurrent ? '#00594C' : '#E2E8F0',
                    color: isCompleted || isCurrent ? '#FFFFFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? '#00594C' : '#334155',
                  }}
                >
                  {step.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <span style={{ color: '#CBD5E1', margin: '0 4px', fontSize: '14px' }}>›</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Card */}
        <div
          className="rf-card rf-page-enter"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* STEP 1: PROFILE */}
          {currentStepIndex === 0 && (
            <form onSubmit={handleProfileSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Bước 1: Thông tin liên hệ của Khách thuê
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Chủ nhà sẽ nhận diện và gửi thông báo tiền phòng qua các thông tin này.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Họ và tên của bạn <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Lê Hoàng Nam"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Số điện thoại liên hệ <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0901234567"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#00594C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Đang lưu...' : 'Tiếp tục: Kết nối phòng trọ →'}
              </button>
            </form>
          )}

          {/* STEP 2: CONNECT ROOM */}
          {currentStepIndex === 1 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Bước 2: Kết nối với phòng trọ của bạn
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Nhập mã mời được chủ nhà chia sẻ (ví dụ định dạng: <code>RF-ABC123</code>).
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã mời (ví dụ: RF-8X92B1)"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    disabled={isVerifyingCode || !inviteCode.trim()}
                    onClick={handleVerifyCode}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#F1F5F9',
                      color: '#0F172A',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: isVerifyingCode || !inviteCode.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isVerifyingCode ? 'Đang kiểm tra...' : 'Kiểm tra mã'}
                  </button>
                </div>

                {/* Preview Details if found */}
                {invitationPreview && (
                  <div
                    style={{
                      backgroundColor: '#F0FDF4',
                      borderRadius: '10px',
                      padding: '18px',
                      border: '1.5px solid #86EFAC',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '18px' }}>🏠</span>
                      <strong style={{ fontSize: '15px', color: '#166534' }}>
                        Tìm thấy thông tin phòng!
                      </strong>
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#14532D', lineHeight: 1.6 }}>
                      <div>
                        <strong>Tòa nhà:</strong> {invitationPreview.propertyName}
                      </div>
                      <div>
                        <strong>Địa chỉ:</strong> {invitationPreview.propertyAddress}
                      </div>
                      <div>
                        <strong>Phòng:</strong> {invitationPreview.roomNumber || 'Chưa định danh'}
                      </div>
                      <div>
                        <strong>Chủ nhà:</strong> {invitationPreview.landlordName}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleAcceptInvite}
                      style={{
                        marginTop: '14px',
                        width: '100%',
                        padding: '11px',
                        backgroundColor: '#166534',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isSubmitting ? 'Đang xử lý...' : '✓ Xác nhận tham gia phòng này'}
                    </button>
                  </div>
                )}
              </div>

              {/* Skip option */}
              <div
                style={{
                  paddingTop: '18px',
                  borderTop: '1px solid #F1F5F9',
                  textAlign: 'center',
                }}
              >
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSkipInvite}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Tôi chưa có mã mời từ chủ nhà, bỏ qua bước này →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION */}
          {currentStepIndex === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: isSkipped ? '#FEF3C7' : '#E6F4F1',
                    color: isSkipped ? '#D97706' : '#00594C',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    marginBottom: '12px',
                  }}
                >
                  {isSkipped ? '⏳' : '✅'}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                  {isSkipped ? 'Tài khoản cư dân đang sẵn sàng' : 'Đã kết nối phòng trọ thành công!'}
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  {isSkipped
                    ? 'Bạn có thể xem các tính năng cơ bản và nhập mã mời khi nhận được từ chủ nhà.'
                    : 'Thông tin phòng và hóa đơn sẽ được cập nhật đồng bộ trực tiếp.'}
                </p>
              </div>

              {/* Detail summary */}
              {!isSkipped && (
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '18px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '24px',
                    fontSize: '13.5px',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Khu trọ: </span>
                    <strong style={{ color: '#0F172A' }}>{confirmedProperty || 'Nhà trọ liên kết'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Số phòng: </span>
                    <strong style={{ color: '#00594C' }}>{confirmedRoom || 'Phòng thuê'}</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinishOnboarding}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#00594C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 89, 76, 0.25)',
                }}
              >
                {isSubmitting ? 'Đang hoàn tất...' : 'Vào Cổng Cư Dân RentFlow →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
