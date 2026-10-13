import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { RentFlowLogo } from '@/components/ui/RentFlowLogo';
import { ButtonSpinner } from '@/components/ui/LoadingSystem';
import { useToast } from '@/components/feedback/ToastSystem';
import { useAuth } from './AuthContext';

export const OnboardingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, updateUserBank } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Organization profile
  const [orgName, setOrgName] = useState('Nguyễn An Property');
  const [hotline, setHotline] = useState('0988 123 456');

  // Step 2: First property
  const [propertyName, setPropertyName] = useState('Nhà trọ Hưng Phát');
  const [address, setAddress] = useState('123/4 Lê Văn Sỹ, P.13, Q.3, TP.HCM');
  const [totalFloors, setTotalFloors] = useState(3);
  const [roomsPerFloor, setRoomsPerFloor] = useState(8);

  // Step 3: Default utilities
  const [electricPrice, setElectricPrice] = useState(3800);
  const [waterPrice, setWaterPrice] = useState(20000);

  // Step 4: Bank Account for VietQR payments & email notifications
  const [bankName, setBankName] = useState(user?.bankAccount?.bankName || 'Techcombank');
  const [accountNumber, setAccountNumber] = useState(user?.bankAccount?.accountNumber || '190345678901');
  const [accountHolder, setAccountHolder] = useState(user?.bankAccount?.accountHolder || (user?.name || 'NGUYEN AN').toUpperCase());
  const [notificationEmail, setNotificationEmail] = useState(user?.bankAccount?.notificationEmail || user?.email || 'nguyenan.property@gmail.com');

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      if (accountNumber.trim()) {
        updateUserBank({
          bankName,
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim().toUpperCase(),
          notificationEmail: notificationEmail.trim(),
        });
      }
      setTimeout(() => {
        setIsSubmitting(false);
        toast.success('Khởi tạo thành công!', 'Tài khoản ngân hàng VietQR & không gian quản lý đã sẵn sàng.');
        navigate('/landlord/dashboard');
      }, 700);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFBF9', padding: '24px' }}>
      <div
        className="rf-card rf-page-enter"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <RentFlowLogo size={34} />
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#00594C', backgroundColor: '#E6F0EE', padding: '4px 10px', borderRadius: '12px' }}>
            Bước {step} / 4: {step === 1 ? 'Hồ sơ chủ nhà' : step === 2 ? 'Tạo tòa nhà' : step === 3 ? 'Cấu hình đơn giá' : 'Tài khoản VietQR & Email'}
          </div>
        </div>

        {/* Step Progress Line */}
        <div style={{ display: 'flex', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(step / 4) * 100}%`,
              backgroundColor: '#00594C',
              transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)',
            }}
          />
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'rfFadeIn 0.2s ease-out' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Thông tin thương hiệu / Quản lý</h2>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>Tên hiển thị trên hóa đơn và thông báo Zalo gửi cho khách thuê.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Tên thương hiệu / Tổ chức *</label>
              <input type="text" className="rf-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Hotline liên hệ *</label>
              <input type="tel" className="rf-input" value={hotline} onChange={(e) => setHotline(e.target.value)} required />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'rfFadeIn 0.2s ease-out' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Cơ sở cho thuê đầu tiên</h2>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>Hệ thống sẽ tự động tạo sơ đồ phòng theo số tầng bạn thiết lập.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Tên tòa nhà / Cơ sở *</label>
              <input type="text" className="rf-input" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Địa chỉ chi tiết *</label>
              <input type="text" className="rf-input" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Số tầng</label>
                <input type="number" className="rf-input" value={totalFloors} onChange={(e) => setTotalFloors(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Số phòng mỗi tầng</label>
                <input type="number" className="rf-input" value={roomsPerFloor} onChange={(e) => setRoomsPerFloor(Number(e.target.value))} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'rfFadeIn 0.2s ease-out' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Đơn giá điện nước mặc định</h2>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>Đơn giá này sẽ được áp dụng tự động khi tính tiền hóa đơn hàng tháng.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Đơn giá điện (đ/kWh)</label>
                <input type="number" className="rf-input" value={electricPrice} onChange={(e) => setElectricPrice(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Đơn giá nước (đ/m³)</label>
                <input type="number" className="rf-input" value={waterPrice} onChange={(e) => setWaterPrice(Number(e.target.value))} />
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '6px', backgroundColor: '#F0FDF4', color: '#166534', fontSize: '12px', border: '1px solid #BBF7D0' }}>
              ✓ Sẵn sàng khởi tạo <strong>{totalFloors * roomsPerFloor} phòng</strong> với sơ đồ ma trận phòng thông minh!
            </div>
          </div>
        )}

        {/* Step 4: Bank Account for VietQR and Email Notifications */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'rfFadeIn 0.2s ease-out' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#00594C" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Tài khoản ngân hàng thụ hưởng & Email thông báo
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
                Tài khoản này dùng để sinh mã VietQR khi cư dân thanh toán tiền phòng hàng tháng. Khi tiền vào thành công, hệ thống gửi email xác nhận tức thì.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                Ngân hàng thụ hưởng *
              </label>
              <select
                className="rf-input"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                style={{ backgroundColor: '#fff', cursor: 'pointer' }}
              >
                <option value="Techcombank">Techcombank (TCB)</option>
                <option value="Vietcombank">Vietcombank (VCB)</option>
                <option value="MBBank">MB Bank (Quân Đội)</option>
                <option value="ACB">ACB (Á Châu)</option>
                <option value="VPBank">VPBank (Việt Nam Thịnh Vượng)</option>
                <option value="BIDV">BIDV (Đầu tư & Phát triển)</option>
                <option value="VietinBank">VietinBank (Công Thương)</option>
                <option value="TPBank">TPBank (Tiên Phong)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  Số tài khoản nhận tiền *
                </label>
                <input
                  type="text"
                  className="rf-input"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="190345678901"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  Tên chủ tài khoản (in hoa không dấu) *
                </label>
                <input
                  type="text"
                  className="rf-input"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  placeholder="NGUYEN AN"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                Email nhận thông báo tiền về *
              </label>
              <input
                type="email"
                className="rf-input"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="nguyenan.property@gmail.com"
                required
              />
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: '#065F46',
              }}
            >
              <ShieldCheck size={18} />
              <span>
                Mã VietQR động sẽ tự điền đúng số tiền và cú pháp phòng (VD: <em>INV-2403 P.101</em>), giúp đối soát chuẩn 100% không bị sai sót.
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
          {step > 1 ? (
            <button type="button" className="rf-btn rf-btn-secondary" onClick={() => setStep(step - 1)}>
              Quay lại
            </button>
          ) : (
            <div />
          )}

          <button type="button" className="rf-btn rf-btn-primary" onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <ButtonSpinner />
                <span>Đang thiết lập tòa nhà & kết nối ngân hàng...</span>
              </>
            ) : step < 4 ? (
              <>
                <span>Tiếp tục</span>
                <ArrowRight size={15} />
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Hoàn tất & Vào Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
