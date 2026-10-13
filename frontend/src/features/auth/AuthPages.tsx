import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, ArrowLeft, CreditCard } from 'lucide-react';
import { RentFlowLogo } from '@/components/ui/RentFlowLogo';
import { ButtonSpinner } from '@/components/ui/LoadingSystem';
import { useAuth, UserRole } from './AuthContext';
import { useToast } from '@/components/feedback/ToastSystem';

export const RolesSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const roles: { role: UserRole; title: string; desc: string; badge: string; link: string }[] = [
    {
      role: 'LANDLORD',
      title: 'Chủ nhà & Chủ đầu tư',
      desc: 'Quản lý toàn bộ danh mục tòa nhà, theo dõi dòng tiền thu nợ, hợp đồng và đội ngũ nhân sự.',
      badge: 'Cổng Quản Trị Chính',
      link: '/auth/login?role=landlord',
    },
    {
      role: 'TENANT',
      title: 'Cư dân & Người thuê phòng',
      desc: 'Tra cứu hóa đơn tiền phòng hàng tháng, chỉ số điện nước và gửi yêu cầu sửa chữa thiết bị.',
      badge: 'Cổng Dành Cho Khách',
      link: '/auth/login?role=tenant',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFBF9', padding: '24px' }}>
      <div style={{ maxWidth: '680px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <RentFlowLogo size={40} />
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '14px 0 6px 0' }}>
            Chọn không gian đăng nhập của bạn
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Hệ thống RentFlow phân tách trải nghiệm chuyên biệt cho từng nhóm người dùng
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {roles.map((item) => (
            <div
              key={item.role}
              onClick={() => navigate(item.link)}
              className="rf-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                border: '1px solid #E5E7EB',
                transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00594C';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 89, 76, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="rf-badge rf-badge-active" style={{ alignSelf: 'flex-start' }}>
                {item.badge}
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                {item.desc}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#00594C' }}>
                Tiếp tục đăng nhập <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <NavLink to="/" style={{ fontSize: '13px', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Quay lại trang chủ RentFlow
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = (searchParams.get('role') || 'landlord').toUpperCase() as UserRole;
  const { login } = useAuth();
  const toast = useToast();

  const [role, setRole] = useState<UserRole>(roleParam === 'TENANT' ? 'TENANT' : 'LANDLORD');
  const [email, setEmail] = useState(
    roleParam === 'TENANT' ? 'nam.le@gmail.com' : 'nguyenan.property@gmail.com'
  );
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setValidationError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    setValidationError('');
    setIsSubmitting(true);

    try {
      await login(email, role);
      toast.success('Đăng nhập thành công!', `Chào mừng bạn quay trở lại RentFlow.`);
      if (role === 'TENANT') {
        navigate('/tenant/dashboard');
      } else {
        navigate('/landlord/dashboard');
      }
    } catch {
      toast.error('Đăng nhập thất bại', 'Vui lòng kiểm tra lại thông tin hoặc kết nối mạng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFBF9', padding: '24px' }}>
      <div
        className="rf-card rf-page-enter"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <RentFlowLogo size={38} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '12px 0 4px 0' }}>
            {role === 'TENANT' ? 'Cổng Cư Dân RentFlow' : 'Đăng nhập Quản Trị RentFlow'}
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            {role === 'TENANT'
              ? 'Tra cứu hóa đơn, điện nước và báo hỏng phòng'
              : 'Nền tảng quản lý nhà trọ & căn hộ cho thuê'}
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '8px', gap: '4px' }}>
          <button
            type="button"
            onClick={() => {
              setRole('LANDLORD');
              setEmail('nguyenan.property@gmail.com');
            }}
            style={{
              flex: 1,
              padding: '6px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: role === 'LANDLORD' ? 600 : 400,
              backgroundColor: role === 'LANDLORD' ? '#FFFFFF' : 'transparent',
              color: role === 'LANDLORD' ? '#00594C' : '#6B7280',
              cursor: 'pointer',
              boxShadow: role === 'LANDLORD' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Chủ nhà
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('TENANT');
              setEmail('nam.le@gmail.com');
            }}
            style={{
              flex: 1,
              padding: '6px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: role === 'TENANT' ? 600 : 400,
              backgroundColor: role === 'TENANT' ? '#FFFFFF' : 'transparent',
              color: role === 'TENANT' ? '#00594C' : '#6B7280',
              cursor: 'pointer',
              boxShadow: role === 'TENANT' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Người thuê / Cư dân
          </button>
        </div>

        {validationError && (
          <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#FCE8E6', color: '#C5221F', fontSize: '12px' }}>
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              Email đăng nhập
            </label>
            <input
              type="email"
              className="rf-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                Mật khẩu
              </label>
              <NavLink to="/auth/forgot-password" style={{ fontSize: '12px', color: '#00594C' }}>
                Quên mật khẩu?
              </NavLink>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="rf-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                style={{ paddingRight: '36px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="rf-btn rf-btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '6px' }}
          >
            {isSubmitting ? (
              <>
                <ButtonSpinner />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
          Chưa có tài khoản chủ nhà?{' '}
          <NavLink to="/auth/register" style={{ color: '#00594C', fontWeight: 600 }}>
            Đăng ký dùng thử 14 ngày miễn phí
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export const PlatformLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('admin@rentflow.vn');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, 'SUPERADMIN');
      toast.success('Xác thực Platform Admin thành công');
      navigate('/platform/dashboard');
    } catch {
      toast.error('Đăng nhập admin thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', padding: '24px' }}>
      <div
        className="rf-card rf-page-enter"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: '#1E293B',
          borderColor: '#334155',
          color: '#F8FAFC',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <RentFlowLogo size={38} textColor="#F8FAFC" />
          <div style={{ marginTop: '10px' }}>
            <span className="rf-badge rf-badge-danger">Khu vực kiểm soát bảo mật</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#F8FAFC', margin: '8px 0 4px 0' }}>
            Platform Admin Console
          </h2>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
            Chỉ dành cho quản trị viên vận hành hạ tầng RentFlow
          </p>
        </div>

        <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
              Tài khoản quản trị (Root Account)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                fontSize: '13px',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
              Mật khẩu xác thực 2 lớp
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                fontSize: '13px',
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rf-btn rf-btn-primary"
            style={{ width: '100%', padding: '10px', marginTop: '6px' }}
          >
            {isSubmitting ? <ButtonSpinner color="#fff" /> : <span>Vào Bảng Quản Trị Hệ Thống</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, updateUserBank } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('Techcombank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, 'LANDLORD');
      if (accountNumber.trim()) {
        updateUserBank({
          bankName,
          accountNumber: accountNumber.trim(),
          accountHolder: (accountHolder || name).trim().toUpperCase(),
          notificationEmail: email,
        });
      }
      toast.success('Đăng ký tài khoản thành công', 'Bắt đầu thiết lập không gian quản lý.');
      navigate('/onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFBF9', padding: '24px' }}>
      <div className="rf-card rf-page-enter" style={{ width: '100%', maxWidth: '520px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <RentFlowLogo size={36} />
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '12px 0 4px 0' }}>
            Tạo tài khoản Chủ nhà RentFlow
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Tích hợp tài khoản nhận tiền phòng và tự động gửi thông báo qua email
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Họ và tên chủ nhà *</label>
            <input type="text" className="rf-input" placeholder="Nguyễn Văn An" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Email nhận thông báo *</label>
              <input type="email" className="rf-input" placeholder="an.nguyen@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Hotline liên hệ *</label>
              <input type="tel" className="rf-input" placeholder="0901234567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          </div>

          {/* Bank Account Section */}
          <div
            style={{
              padding: '14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="#00594C" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                Tài khoản ngân hàng nhận tiền phòng (VietQR)
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
              Khi người thuê bấm thanh toán, hệ thống sẽ tự động tạo mã QR chuyển khoản vào tài khoản này và gửi email báo có cho bạn ngay khi giao dịch thành công.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>
                Ngân hàng thụ hưởng *
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                }}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>
                  Số tài khoản ngân hàng *
                </label>
                <input
                  type="text"
                  placeholder="VD: 190345678901"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>
                  Tên chủ tài khoản *
                </label>
                <input
                  type="text"
                  placeholder="VD: NGUYEN VAN AN"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="rf-btn rf-btn-primary" style={{ padding: '10px', marginTop: '6px' }}>
            {isSubmitting ? <ButtonSpinner /> : <span>Bắt đầu thiết lập tòa nhà →</span>}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
          Đã có tài khoản?{' '}
          <NavLink to="/auth/login" style={{ color: '#00594C', fontWeight: 600 }}>
            Đăng nhập ngay
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.info('Đã gửi yêu cầu khôi phục', `Vui lòng kiểm tra hộp thư ${email}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFBF9', padding: '24px' }}>
      <div className="rf-card rf-page-enter" style={{ width: '100%', maxWidth: '440px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <RentFlowLogo size={36} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '12px 0 4px 0' }}>
            Khôi phục mật khẩu
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Nhập email tài khoản để nhận liên kết đặt lại mật khẩu an toàn
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#E6F4EA', color: '#137333', fontSize: '13px' }}>
              ✓ Đường dẫn đặt lại mật khẩu đã được gửi đến <strong>{email}</strong>.
            </div>
            <button className="rf-btn rf-btn-primary" onClick={() => navigate('/login')}>
              Quay về trang đăng nhập
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                Email tài khoản đã đăng ký *
              </label>
              <input
                type="email"
                className="rf-input"
                placeholder="vidu@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="rf-btn rf-btn-primary" style={{ padding: '10px' }}>
              Gửi liên kết khôi phục
            </button>
            <div style={{ textAlign: 'center' }}>
              <NavLink to="/auth/login" style={{ fontSize: '12px', color: '#6B7280' }}>
                Nhớ mật khẩu? Đăng nhập
              </NavLink>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
