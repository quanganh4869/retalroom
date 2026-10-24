import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { onboardingService, OnboardingStatusResponse } from './services/authOnboardingService';
import { useToast } from '@/components/feedback/ToastSystem';
import { RentFlowLogo } from '@/components/ui/BrandLogos';
import { BrandLoader } from '@/components/ui/LoadingSystem';

const STEPS = [
  { id: 'PROFILE', label: '1. Hồ sơ chủ nhà' },
  { id: 'PROPERTY', label: '2. Tòa nhà / Khu trọ' },
  { id: 'MANAGEMENT_CONFIG', label: '3. Vận hành' },
  { id: 'FIRST_ROOM', label: '4. Phòng đầu tiên' },
  { id: 'CONFIRMATION', label: '5. Hoàn tất' },
];

export const LandlordOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserOnboarding } = useAuth();
  const toast = useToast();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');

  // Step 2 Property
  const [propertyName, setPropertyName] = useState('Nhà trọ RentFlow');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyCity, setPropertyCity] = useState('Hà Nội');
  const [totalFloors, setTotalFloors] = useState<number>(3);
  const [propertyDescription, setPropertyDescription] = useState('');
  const [savedPropertyId, setSavedPropertyId] = useState<string>('');

  // Step 3 Management Config
  const [billingDay, setBillingDay] = useState<number>(5);
  const [paymentCycle, setPaymentCycle] = useState<string>('MONTHLY');

  // Step 4 First Room
  const [roomNumber, setRoomNumber] = useState('P.101');
  const [floor, setFloor] = useState<number>(1);
  const [basePrice, setBasePrice] = useState<number>(3500000);
  const [areaSqm, setAreaSqm] = useState<number>(25);

  // Step 5 Result & Invite Code
  const [generatedInviteCode, setGeneratedInviteCode] = useState<string>('');

  // Load latest state from backend on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res: OnboardingStatusResponse = await onboardingService.getStatus();
        if (res.profile?.fullName) setFullName(res.profile.fullName);
        if (res.profile?.phoneNumber) setPhoneNumber(res.profile.phoneNumber);
        if (res.propertyId) setSavedPropertyId(res.propertyId);
        if (res.propertyName) setPropertyName(res.propertyName);
        if (res.roomNumber) setRoomNumber(res.roomNumber);
        if (res.inviteCode) setGeneratedInviteCode(res.inviteCode);

        // Resume at backend step
        if (res.status === 'COMPLETED') {
          navigate('/landlord/dashboard', { replace: true });
          return;
        }

        const stepMap: Record<string, number> = {
          ROLE: 0,
          PROFILE: 0,
          PROPERTY: 1,
          MANAGEMENT_CONFIG: 2,
          FIRST_ROOM: 3,
          CONFIRMATION: 4,
          COMPLETE: 4,
        };
        if (res.step && stepMap[res.step] !== undefined) {
          setCurrentStepIndex(stepMap[res.step]);
        }
      } catch (err) {
        console.warn('Could not sync onboarding status:', err);
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
      updateUserOnboarding('IN_PROGRESS', 'PROPERTY');
      toast.success('Lưu thông tin thành công', 'Chuyển sang bước thêm khu trọ');
      setCurrentStepIndex(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật hồ sơ';
      toast.error('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Property Submit
  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName.trim() || !propertyAddress.trim()) {
      toast.warning('Thiếu thông tin', 'Vui lòng nhập tên nhà trọ và địa chỉ chi tiết.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await onboardingService.setupLandlordProperty({
        name: propertyName.trim(),
        address: propertyAddress.trim(),
        city: propertyCity,
        totalFloors: Number(totalFloors) || 1,
        description: propertyDescription.trim() || undefined,
      });
      if (res.propertyId) {
        setSavedPropertyId(res.propertyId);
      }
      updateUserOnboarding('IN_PROGRESS', 'MANAGEMENT_CONFIG');
      toast.success('Khởi tạo tòa nhà thành công', 'Thiết lập chu kỳ vận hành');
      setCurrentStepIndex(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khởi tạo bất động sản';
      toast.error('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Management Config Submit
  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedPropertyId) {
      toast.error('Lỗi', 'Không tìm thấy thông tin tòa nhà. Vui lòng quay lại bước trước.');
      setCurrentStepIndex(1);
      return;
    }
    setIsSubmitting(true);
    try {
      await onboardingService.setupLandlordManagementConfig({
        propertyId: savedPropertyId,
        billingDay: Number(billingDay) || 1,
        paymentCycle,
      });
      updateUserOnboarding('IN_PROGRESS', 'FIRST_ROOM');
      toast.success('Lưu cấu hình thành công', 'Bây giờ hãy tạo căn phòng đầu tiên');
      setCurrentStepIndex(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi lưu cấu hình';
      toast.error('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: First Room Submit
  const handleFirstRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedPropertyId) {
      toast.error('Lỗi', 'Không tìm thấy thông tin tòa nhà.');
      setCurrentStepIndex(1);
      return;
    }
    if (!roomNumber.trim()) {
      toast.warning('Thiếu thông tin', 'Vui lòng nhập số phòng / tên phòng.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await onboardingService.setupLandlordFirstRoom({
        propertyId: savedPropertyId,
        roomNumber: roomNumber.trim(),
        floor: Number(floor) || 1,
        basePrice: Number(basePrice) || 0,
        areaSqm: Number(areaSqm) || 20,
      });
      if (res.inviteCode) {
        setGeneratedInviteCode(res.inviteCode);
      }
      updateUserOnboarding('IN_PROGRESS', 'CONFIRMATION');
      toast.success('Tạo phòng thành công', 'Đã cấp mã mời cư dân đầu tiên');
      setCurrentStepIndex(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tạo phòng';
      toast.error('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5: Finalize
  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      await onboardingService.completeLandlord();
      updateUserOnboarding('COMPLETED', 'COMPLETE');
      toast.success('Chào mừng bạn đến với RentFlow!', 'Bắt đầu quản lý khu trọ của bạn');
      navigate('/landlord/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi hoàn tất thiết lập';
      toast.error('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedInviteCode) return;
    navigator.clipboard.writeText(generatedInviteCode);
    toast.info('Đã sao chép mã mời', generatedInviteCode);
  };

  if (isLoadingInitial) {
    return <BrandLoader message="Đang tải tiến trình thiết lập..." />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '32px 16px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Brand bar */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <RentFlowLogo size={40} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Khởi tạo không gian quản lý Chủ trọ
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px' }}>
            Chỉ mất 2 phút để cấu hình tòa nhà và bắt đầu quản lý tiện lợi
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

        {/* Step Content Card */}
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
                  Bước 1: Xác nhận thông tin liên hệ của Chủ nhà
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Thông tin này sẽ hiển thị trên hợp đồng thuê và hóa đơn gửi tới khách thuê.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Họ và tên chủ nhà / người đại diện <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
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
                    placeholder="Ví dụ: 0988123456"
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
                {isSubmitting ? 'Đang lưu...' : 'Tiếp tục: Thêm tòa nhà →'}
              </button>
            </form>
          )}

          {/* STEP 2: PROPERTY */}
          {currentStepIndex === 1 && (
            <form onSubmit={handlePropertySubmit}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Bước 2: Khởi tạo Tòa nhà / Khu trọ đầu tiên
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Nhập thông tin địa chỉ khu trọ mà bạn muốn đưa vào quản lý ngay bây giờ.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Tên khu trọ / Tòa nhà <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="Ví dụ: Nhà trọ Hưng Phát, Tòa nhà Cầu Giấy..."
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
                    Địa chỉ chi tiết <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder="Ví dụ: Số 45 Ngõ 123 Đường Cầu Giấy, Phường Dịch Vọng"
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Tỉnh / Thành phố
                    </label>
                    <input
                      type="text"
                      value={propertyCity}
                      onChange={(e) => setPropertyCity(e.target.value)}
                      placeholder="Hà Nội, TP.HCM..."
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
                      Tổng số tầng
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={totalFloors}
                      onChange={(e) => setTotalFloors(parseInt(e.target.value) || 1)}
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

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Ghi chú / Tiện ích chung (Tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    value={propertyDescription}
                    onChange={(e) => setPropertyDescription(e.target.value)}
                    placeholder="Có khóa cửa vân tay, camera an ninh 24/7, chỗ để xe máy miễn phí..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex(0)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
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
                  {isSubmitting ? 'Đang tạo tòa nhà...' : 'Lưu tòa nhà & Cấu hình vận hành →'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: MANAGEMENT CONFIG */}
          {currentStepIndex === 2 && (
            <form onSubmit={handleConfigSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Bước 3: Cấu hình Vận hành & Lập hóa đơn
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Thiết lập ngày chốt tiền định kỳ để RentFlow tự động nhắc nhở và tạo hóa đơn phòng.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Ngày chốt số & phát hành hóa đơn hàng tháng (1 - 31) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      required
                      value={billingDay}
                      onChange={(e) => setBillingDay(parseInt(e.target.value) || 1)}
                      style={{
                        width: '100px',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '15px',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '13.5px', color: '#64748B' }}>
                      (Ví dụ: Ngày 5 hàng tháng - hệ thống tự động lập hóa đơn tiền phòng và điện nước)
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Chu kỳ thu tiền <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={paymentCycle}
                    onChange={(e) => setPaymentCycle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="MONTHLY">Thu hàng tháng (Phổ biến nhất)</option>
                    <option value="QUARTERLY">Thu 3 tháng một lần (Theo quý)</option>
                    <option value="SEMI_ANNUAL">Thu 6 tháng một lần</option>
                    <option value="YEARLY">Thu hàng năm</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex(1)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
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
                  {isSubmitting ? 'Đang lưu cấu hình...' : 'Tiếp tục: Tạo phòng đầu tiên →'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: FIRST ROOM */}
          {currentStepIndex === 3 && (
            <form onSubmit={handleFirstRoomSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Bước 4: Khởi tạo Phòng trọ đầu tiên
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Thêm ít nhất 1 phòng trọ. Hệ thống sẽ cấp ngay mã mời riêng để bạn gửi cho khách thuê.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Số phòng / Tên phòng <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Ví dụ: P.101 hoặc Phòng 101"
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
                      Tầng
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={floor}
                      onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Giá thuê cơ bản (VNĐ / tháng) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                      placeholder="3,500,000"
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
                      Diện tích (m²)
                    </label>
                    <input
                      type="number"
                      min={5}
                      step={0.5}
                      value={areaSqm}
                      onChange={(e) => setAreaSqm(parseFloat(e.target.value) || 20)}
                      placeholder="25"
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
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex(2)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
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
                  {isSubmitting ? 'Đang tạo phòng...' : 'Hoàn tất khởi tạo phòng & sinh mã mời →'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: CONFIRMATION */}
          {currentStepIndex === 4 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#E6F4F1',
                    color: '#00594C',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    marginBottom: '12px',
                  }}
                >
                  🎉
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Thiết lập ban đầu đã hoàn tất!
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Khu trọ và phòng đầu tiên của bạn đã sẵn sàng trên RentFlow.
                </p>
              </div>

              {/* Summary Card */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13.5px' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Tòa nhà:</span>
                    <strong style={{ display: 'block', color: '#0F172A', fontSize: '15px', marginTop: '2px' }}>
                      {propertyName}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Địa chỉ:</span>
                    <span style={{ display: 'block', color: '#334155', marginTop: '2px' }}>
                      {propertyAddress || 'Cầu Giấy, Hà Nội'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Phòng khởi tạo:</span>
                    <strong style={{ display: 'block', color: '#00594C', fontSize: '15px', marginTop: '2px' }}>
                      {roomNumber} ({new Intl.NumberFormat('vi-VN').format(basePrice)} đ/tháng)
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Ngày chốt tiền:</span>
                    <span style={{ display: 'block', color: '#334155', marginTop: '2px' }}>
                      Ngày {billingDay} hàng tháng
                    </span>
                  </div>
                </div>

                {/* Invite Code highlight */}
                {generatedInviteCode && (
                  <div
                    style={{
                      marginTop: '18px',
                      paddingTop: '16px',
                      borderTop: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                      🔑 Mã mời Người thuê phòng {roomNumber}:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <code
                        style={{
                          backgroundColor: '#FFFFFF',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1.5px dashed #00594C',
                          fontSize: '18px',
                          fontWeight: 800,
                          color: '#00594C',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {generatedInviteCode}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#00594C',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Sao chép mã
                      </button>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Khách thuê chỉ cần nhập mã này trong bước Onboarding của họ để tự động liên kết vào phòng!
                    </span>
                  </div>
                )}
              </div>

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
                {isSubmitting ? 'Đang hoàn tất...' : 'Vào trang quản lý Chủ trọ ngay →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
