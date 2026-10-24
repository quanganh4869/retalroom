import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
} from 'lucide-react';
import { RentFlowLogo } from '@/components/ui/RentFlowLogo';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/feedback/ToastSystem';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeAudience, setActiveAudience] = useState<'landlord' | 'tenant'>('landlord');
  const [showcaseTab, setShowcaseTab] = useState<'overview' | 'roomGrid' | 'meterReading' | 'invoice' | 'tenantPortal'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@rentflow.vn');
  const [adminPassword, setAdminPassword] = useState('••••••••••••');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleAdminModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSubmitting(true);
    setAdminError(null);
    try {
      await login(adminEmail, 'SUPERADMIN');
      toast.success('Xác thực Platform Admin thành công');
      setAdminModalOpen(false);
      navigate('/platform/dashboard');
    } catch {
      setAdminError('Đăng nhập quản trị viên thất bại. Vui lòng kiểm tra lại thông tin.');
      toast.error('Đăng nhập quản trị viên thất bại');
    } finally {
      setAdminSubmitting(false);
    }
  };

  // Monitor scroll for header elevation
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for scroll-based reveals
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      const revealElements = document.querySelectorAll('.rf-reveal, .rf-reveal-mask');
      revealElements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    const revealElements = document.querySelectorAll('.rf-reveal, .rf-reveal-mask');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeAudience]);

  const realEstatePhotos = {
    heroApartment: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    studioRoom: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    corridor: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    buildingExterior: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    colivingSpace: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    balconyRoom: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    compactStudio: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
    propertyManager: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    tenantLiving: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=800&q=80',
    maintenanceTech: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    utilityMeter: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    handoverKeys: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
  };

  const productScreens = {
    heroOverview: '/images/rentflow/hero-overview.png',
    roomGrid: '/images/rentflow/room-grid.png',
    meterReading: '/images/rentflow/meter-reading.png',
    invoicePreview: '/images/rentflow/invoice-preview.png',
    paymentReceipt: '/images/rentflow/payment-receipt.png',
    contractDetail: '/images/rentflow/contract-detail.png',
    depositSettlement: '/images/rentflow/deposit-settlement.png',
    maintenanceDesk: '/images/rentflow/maintenance-desk.png',
    tenantPortal: '/images/rentflow/tenant-portal.png',
    financialReport: '/images/rentflow/financial-report.png',
  };

  const faqs = [
    {
      q: 'RentFlow phù hợp với mô hình nhà trọ hay căn hộ nào?',
      a: 'RentFlow tối ưu cho mọi quy mô: từ chủ nhà cho thuê từ 5–15 phòng đơn lẻ đến các chuỗi căn hộ dịch vụ (serviced apartments), ký túc xá sinh viên, tòa nhà co-living với hàng trăm phòng trên nhiều địa bàn.',
    },
    {
      q: 'Chỉ số điện nước và hóa đơn được tính toán như thế nào?',
      a: 'Bạn chỉ cần nhập số công tơ điện và đồng hồ nước thực tế trên bảng tính tập trung hoặc điện thoại. Hệ thống tự động so sánh số cũ, phát hiện chênh lệch bất thường, tính tiền theo biểu giá và phát hành hóa đơn PDF.',
    },
    {
      q: 'Khách thuê có cần tải ứng dụng phức tạp không?',
      a: 'Không bắt buộc. Khách thuê có thể nhận hóa đơn qua Zalo/SMS hoặc đăng nhập vào Cổng Cư Dân trực tuyến bằng trình duyệt điện thoại để tra cứu số điện nước, gửi báo hỏng và kiểm tra biên lai thanh toán.',
    },
    {
      q: 'Tôi có thể dùng thử trước khi đăng ký gói chính thức không?',
      a: 'Có! RentFlow cung cấp 14 ngày trải nghiệm miễn phí không giới hạn số phòng để bạn nhập thử dữ liệu cơ sở, phòng, hợp đồng và trải nghiệm toàn bộ quy trình ghi điện nước.',
    },
    {
      q: 'Tiền cọc và quyết toán khi khách trả phòng được kiểm soát ra sao?',
      a: 'Mỗi hợp đồng có sổ theo dõi tiền cọc riêng. Khi khách trả phòng, hệ thống tự động lập phiếu quyết toán cấn trừ tiền điện nước còn thiếu và chi phí hư hao thiết bị trước khi đề xuất số tiền hoàn lại.',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FBFBF9',
        color: '#111827',
        fontFamily: "'Nunito', var(--font-landing), sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. STICKY HEADER */}
      <header
        className={isScrolled ? 'rf-header-scrolled' : ''}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: isScrolled ? 'rgba(0, 53, 45, 0.96)' : '#004D40',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.08)',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              navigate('/');
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Về đầu trang chủ RentFlow"
          >
            <RentFlowLogo size={34} textColor="#FFFFFF" />
          </button>

          <nav style={{ display: 'none', alignItems: 'center', gap: '26px' }} className="rf-desktop-nav">
            <a href="#overview" className="rf-nav-link">Giải pháp</a>
            <a href="#features" className="rf-nav-link">Tính năng</a>
            <a href="#showcase" className="rf-nav-link">Giao diện thực tế</a>
            <a href="#gallery" className="rf-nav-link">Không gian phòng</a>
            <a href="#faq" className="rf-nav-link">Hỏi đáp</a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="rf-btn"
            onClick={() => navigate('/auth/roles')}
            style={{
              fontSize: '14px',
              fontWeight: 600,
              padding: '8px 18px',
              backgroundColor: '#FFFFFF',
              color: '#00594C',
              border: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rf-mobile-toggle"
            aria-label="Toggle mobile menu"
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '6px' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-label="Menu điều hướng RentFlow"
          style={{
            position: 'fixed',
            top: '68px',
            left: 0,
            right: 0,
            backgroundColor: '#004338',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '24px 28px',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          }}
        >
          <a href="#overview" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>Giải pháp</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>Tính năng</a>
          <a href="#showcase" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>Giao diện thực tế</a>
          <a href="#gallery" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>Không gian phòng</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>Hỏi đáp</a>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/auth/register');
              }}
            >
              Bắt đầu dùng thử miễn phí
            </button>
            <button
              type="button"
              className="rf-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.25)' }}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/auth/roles');
              }}
            >
              Cổng đăng nhập
            </button>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION — CLEAN EDITORIAL COMPOSITION */}
      <section
        id="overview"
        style={{
          padding: '60px 24px 70px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <h1
          className="rf-hero-item-2"
          style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.16,
            letterSpacing: '-0.03em',
            color: '#111827',
            maxWidth: '900px',
            margin: '0 0 20px 0',
          }}
        >
          Quản lý nhà cho thuê gọn gàng hơn,{' '}
          <span className="rf-gradient-text">từ phòng trống đến từng hóa đơn.</span>
        </h1>

        <p
          className="rf-hero-item-3"
          style={{
            fontSize: 'clamp(15px, 2vw, 17px)',
            color: '#4B5563',
            maxWidth: '700px',
            lineHeight: 1.65,
            margin: '0 0 34px 0',
          }}
        >
          RentFlow hợp nhất quản lý danh mục phòng, khách thuê, hợp đồng, chốt số điện nước, phát hành hóa đơn tự động và xử lý báo hỏng trong một không gian vận hành chuyên nghiệp.
        </p>

        {/* HERO IMAGE */}
        <div
          className="rf-hero-stage"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
            marginTop: '10px',
          }}
        >
          <div
            className="rf-img-container rf-img-zoom rf-reveal-mask is-revealed"
            style={{
              height: 'clamp(300px, 45vw, 480px)',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.14)',
            }}
          >
            <img
              src={realEstatePhotos.heroApartment}
              alt="Căn hộ cho thuê hiện đại đầy đủ tiện nghi"
              className="rf-img-cover"
              loading="eager"
            />
          </div>
        </div>
      </section>



      {/* 6. IMMERSIVE ALTERNATING FEATURE SHOWCASE (IMAGE + REAL PRODUCT PREVIEW) */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="rf-reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
            Công cụ chuyên sâu cho từng khâu vận hành
          </h2>
          <p style={{ fontSize: '15px', color: '#4B5563', maxWidth: '620px', margin: '10px auto 0 auto', lineHeight: 1.6 }}>
            Trang bị giải pháp chuẩn hóa dữ liệu tài sản, hạn chế tối đa tranh chấp và tăng năng suất quản lý.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {/* Feature 1: Room & Property Grid */}
          <div className="rf-feature-grid rf-reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: 'clamp(22px, 3vw, 26px)', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                Kiểm soát toàn bộ trạng thái phòng chỉ trong một màn hình
              </h3>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                Phân loại màu sắc rõ ràng: phòng đang có khách ở (xanh lá), phòng trống sẵn sàng đón khách (xanh dương), phòng bảo trì (cam) và phòng sắp hết hạn hợp đồng. Không còn lo tình trạng phòng trống mà quên đăng tin.
              </p>
              <ul style={{ fontSize: '13px', color: '#374151', paddingLeft: '18px', margin: 0, lineHeight: 1.8 }}>
                <li>Lọc nhanh theo tòa nhà, số tầng hoặc loại phòng (Studio, 1PN, Duplex).</li>
                <li>Xem ngay tên khách thuê, số điện thoại và thời hạn hợp đồng đang hiệu lực.</li>
              </ul>
            </div>
            <div className="rf-img-container rf-img-zoom" style={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.08)' }}>
              <img src={productScreens.roomGrid} alt="Sơ đồ danh sách phòng RentFlow" className="rf-img-cover" loading="lazy" />
            </div>
          </div>

          {/* Feature 2: Utility & Meter Readings (Reversed layout) */}
          <div className="rf-feature-grid rf-reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div className="rf-img-container rf-img-zoom" style={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.08)' }}>
              <img src={productScreens.meterReading} alt="Bảng ghi số điện nước RentFlow" className="rf-img-cover" loading="lazy" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: 'clamp(22px, 3vw, 26px)', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                Ghi điện nước siêu tốc, phát hiện chỉ số bất thường
              </h3>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                Nhập số điện nước hàng loạt trực tiếp trên một bảng tính tiện lợi. Hệ thống tự động so sánh với kỳ trước và cảnh báo ngay lập tức nếu chỉ số thấp hơn kỳ trước hoặc tăng vọt đột biến do rò rỉ nước.
              </p>
              <ul style={{ fontSize: '13px', color: '#374151', paddingLeft: '18px', margin: 0, lineHeight: 1.8 }}>
                <li>Hỗ trợ tính đơn giá cố định hoặc giá lũy tiến theo quy định.</li>
                <li>Chốt một lần, tự động sinh hóa đơn cho toàn bộ các phòng đã ghi.</li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Invoices & Payment Verification */}
          <div className="rf-feature-grid rf-reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: 'clamp(22px, 3vw, 26px)', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                Hóa đơn minh bạch, gạch nợ tức thì không lo thất thoát
              </h3>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                Hóa đơn PDF đẹp mắt bóc tách rõ từng khoản: tiền phòng, số kWh điện, số m³ nước và các phí dịch vụ rác, wifi, thang máy. Cho phép ghi nhận thanh toán từng phần và nhắc nợ quá hạn tự động.
              </p>
              <ul style={{ fontSize: '13px', color: '#374151', paddingLeft: '18px', margin: 0, lineHeight: 1.8 }}>
                <li>Xuất file PDF hoặc gửi trực tiếp qua Zalo cho từng người thuê.</li>
                <li>Theo dõi danh sách nợ quá hạn 1-7 ngày, 8-15 ngày và trên 30 ngày.</li>
              </ul>
            </div>
            <div className="rf-img-container rf-img-zoom" style={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.08)' }}>
              <img src={productScreens.invoicePreview} alt="Xem trước hóa đơn tiền phòng RentFlow" className="rf-img-cover" loading="lazy" />
            </div>
          </div>

          {/* Feature 4: Maintenance & Incident Tracking (Reversed) */}
          <div className="rf-feature-grid rf-reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div className="rf-img-container rf-img-zoom" style={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.08)' }}>
              <img src={productScreens.maintenanceDesk} alt="Trung tâm điều phối bảo trì sự cố" className="rf-img-cover" loading="lazy" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: 'clamp(22px, 3vw, 26px)', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                Tiếp nhận báo hỏng từ cư dân, điều phối thợ nhanh chóng
              </h3>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                Khách thuê chỉ cần vài thao tác để gửi báo hỏng bóng đèn, vòi nước hay điều hòa kèm ảnh chụp. Chủ nhà phân công thợ sửa, theo dõi thời gian hoàn thành và lưu lại chi phí thực tế vào sổ quỹ.
              </p>
              <ul style={{ fontSize: '13px', color: '#374151', paddingLeft: '18px', margin: 0, lineHeight: 1.8 }}>
                <li>Phân loại mức độ khẩn cấp (Khẩn cấp, Cao, Trung bình).</li>
                <li>Ghi nhận chi phí linh kiện và thợ vào báo cáo chi phí vận hành.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SHOW THE PRODUCT ITSELF — FULL PRODUCT DEMO PREVIEW */}
      <section id="showcase" style={{ padding: '80px 24px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div className="rf-reveal">
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
              Giao diện thực tế được thiết kế chuẩn mực cho quản trị viên
            </h2>
            <p style={{ fontSize: '15px', color: '#4B5563', maxWidth: '640px', margin: '10px auto 36px auto', lineHeight: 1.6 }}>
              Hình ảnh thật từ hệ thống RentFlow đang chạy. Gọn gàng, chính xác, tốc độ cao và tối ưu cho thao tác hằng ngày.
            </p>
          </div>

          {/* Interactive Screen Selector Tabs */}
          <div
            className="rf-reveal"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '28px',
            }}
          >
            {[
              { id: 'overview', label: 'Tổng quan danh mục', path: 'https://app.rentflow.vn/landlord/dashboard', img: productScreens.heroOverview },
              { id: 'roomGrid', label: 'Sơ đồ phòng', path: 'https://app.rentflow.vn/rooms', img: productScreens.roomGrid },
              { id: 'meterReading', label: 'Chốt số điện nước', path: 'https://app.rentflow.vn/meter-readings', img: productScreens.meterReading },
              { id: 'invoice', label: 'Hóa đơn & Tiền phòng', path: 'https://app.rentflow.vn/invoices', img: productScreens.invoicePreview },
              { id: 'tenantPortal', label: 'Cổng cư dân', path: 'https://app.rentflow.vn/tenant/dashboard', img: productScreens.tenantPortal },
            ].map((tab) => {
              const isSelected = showcaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseTab(tab.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #00594C' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? '#00594C' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#4B5563',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(0, 89, 76, 0.15)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Browser Chrome with Dynamic URL and Real Screenshot */}
          <div
            className="rf-reveal rf-reveal-delay-1"
            style={{
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
              backgroundColor: '#FBFBF9',
            }}
          >
            {/* Browser top chrome */}
            <div
              style={{
                backgroundColor: '#F3F4F6',
                padding: '12px 18px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <div
                style={{
                  margin: '0 auto',
                  backgroundColor: '#FFFFFF',
                  padding: '4px 20px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                  maxWidth: '420px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {showcaseTab === 'overview' && 'https://app.rentflow.vn/landlord/dashboard'}
                {showcaseTab === 'roomGrid' && 'https://app.rentflow.vn/rooms'}
                {showcaseTab === 'meterReading' && 'https://app.rentflow.vn/meter-readings'}
                {showcaseTab === 'invoice' && 'https://app.rentflow.vn/invoices'}
                {showcaseTab === 'tenantPortal' && 'https://app.rentflow.vn/tenant/dashboard'}
              </div>
            </div>

            <img
              src={
                showcaseTab === 'overview'
                  ? productScreens.heroOverview
                  : showcaseTab === 'roomGrid'
                  ? productScreens.roomGrid
                  : showcaseTab === 'meterReading'
                  ? productScreens.meterReading
                  : showcaseTab === 'invoice'
                  ? productScreens.invoicePreview
                  : productScreens.tenantPortal
              }
              alt="Màn hình ứng dụng RentFlow"
              style={{ width: '100%', display: 'block' }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 8. RESIDENTIAL PHOTO GALLERY — REAL LIVING SPACES */}
      <section id="gallery" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="rf-reveal" style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
            Phục vụ đa dạng không gian sống và mô hình cho thuê
          </h2>
          <p style={{ fontSize: '15px', color: '#4B5563', maxWidth: '600px', margin: '10px auto 0 auto', lineHeight: 1.6 }}>
            Từ những phòng trọ khép kín, căn hộ dịch vụ cao cấp đến ký túc xá sinh viên hiện đại.
          </p>
        </div>

        {/* Asymmetrical Photo Collage */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '16px',
            height: '520px',
          }}
          className="rf-gallery-grid rf-reveal rf-reveal-delay-1"
        >
          {/* Main big landscape */}
          <div
            className="rf-img-container rf-img-zoom"
            style={{
              gridColumn: 'span 7',
              height: '100%',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <img src={realEstatePhotos.colivingSpace} alt="Không gian sinh hoạt phòng trọ cao cấp" className="rf-img-cover" loading="lazy" />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', padding: '6px 14px', borderRadius: '6px', backgroundColor: 'rgba(17, 24, 39, 0.75)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: '12px', fontWeight: 500 }}>
              Căn hộ dịch vụ & Co-living
            </div>
          </div>

          {/* Right column: 2 stacked images */}
          <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div
              className="rf-img-container rf-img-zoom"
              style={{
                flex: 1,
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
              }}
            >
              <img src={realEstatePhotos.compactStudio} alt="Phòng trọ studio có gác lửng" className="rf-img-cover" loading="lazy" />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '12px' }}>
                Phòng trọ Studio khép kín
              </div>
            </div>
            <div
              className="rf-img-container rf-img-zoom"
              style={{
                flex: 1,
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
              }}
            >
              <img src={realEstatePhotos.corridor} alt="Hành lang và cổng ra vào an ninh" className="rf-img-cover" loading="lazy" />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '12px' }}>
                Hành lang & Tiện ích chung
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TAILORED WORKFLOWS (LANDLORD VS TENANT EXPERIENCE) */}
      <section style={{ padding: '80px 24px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="rf-reveal" style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
              Thiết kế chuyên biệt cho từng nhóm người dùng
            </h2>
            <p style={{ fontSize: '15px', color: '#4B5563', maxWidth: '600px', margin: '10px auto 0 auto', lineHeight: 1.6 }}>
              Không chỉ là một phần mềm cho chủ nhà, mà còn là cổng thông tin minh bạch cho người thuê.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="rf-reveal rf-reveal-delay-1" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
            <button
              type="button"
              onClick={() => setActiveAudience('landlord')}
              style={{
                padding: '11px 26px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeAudience === 'landlord' ? '#00594C' : '#F3F4F6',
                color: activeAudience === 'landlord' ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.2s ease',
                boxShadow: activeAudience === 'landlord' ? '0 4px 12px rgba(0, 89, 76, 0.2)' : 'none',
              }}
            >
              Dành cho Chủ nhà & Quản lý
            </button>
            <button
              type="button"
              onClick={() => setActiveAudience('tenant')}
              style={{
                padding: '11px 26px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeAudience === 'tenant' ? '#00594C' : '#F3F4F6',
                color: activeAudience === 'tenant' ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.2s ease',
                boxShadow: activeAudience === 'tenant' ? '0 4px 12px rgba(0, 89, 76, 0.2)' : 'none',
              }}
            >
              Dành cho Người thuê (Cư dân)
            </button>
          </div>

          {activeAudience === 'landlord' ? (
            <div className="rf-feature-grid rf-reveal rf-reveal-delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '44px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                  Không gian điều hành tập trung cho chủ sở hữu
                </h3>
                <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  Chủ nhà nắm bắt chính xác dòng tiền thực thu, công nợ lũy kế, tiền cọc đang nắm giữ và lịch bàn giao phòng mà không phải mở hàng chục file Excel độc lập.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={17} color="#137333" style={{ flexShrink: 0 }} /> Quản lý danh mục nhiều cơ sở trên cùng tài khoản.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={17} color="#137333" style={{ flexShrink: 0 }} /> Tự động tính chênh lệch công tơ điện nước và xuất hóa đơn.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={17} color="#137333" style={{ flexShrink: 0 }} /> Phân quyền rõ ràng cho đồng sở hữu và trợ lý kế toán.
                  </div>
                </div>
              </div>
              <div className="rf-img-container rf-img-zoom" style={{ borderRadius: '12px', border: '1px solid #E5E7EB', height: '320px', boxShadow: '0 16px 36px rgba(0,0,0,0.06)' }}>
                <img src={realEstatePhotos.propertyManager} alt="Chủ nhà làm việc trên phần mềm" className="rf-img-cover" loading="lazy" />
              </div>
            </div>
          ) : (
            <div className="rf-feature-grid rf-reveal rf-reveal-delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '44px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                  Cổng thông tin cư dân minh bạch và thuận tiện
                </h3>
                <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  Người thuê dễ dàng xem hóa đơn chi tiết mỗi tháng, biết chính xác số điện nước mình đã dùng, gửi báo hỏng thiết bị và nhận phản hồi nhanh chóng.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={17} color="#137333" style={{ flexShrink: 0 }} /> Tra cứu hóa đơn và tải biên lai PDF bất kỳ lúc nào.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={17} color="#137333" style={{ flexShrink: 0 }} /> Báo hỏng thiết bị chỉ trong 30 giây kèm hình ảnh.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={17} color="#137333" style={{ flexShrink: 0 }} /> Xem hợp đồng thuê và tiền cọc được bảo chứng an toàn.
                  </div>
                </div>
              </div>
              <div className="rf-img-container rf-img-zoom" style={{ borderRadius: '12px', border: '1px solid #E5E7EB', height: '320px', boxShadow: '0 16px 36px rgba(0,0,0,0.06)' }}>
                <img src={realEstatePhotos.tenantLiving} alt="Người thuê sinh sống thoải mái" className="rf-img-cover" loading="lazy" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 10. FAQ ACCORDION SECTION */}
      <section id="faq" style={{ padding: '80px 24px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
        <div className="rf-reveal" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
            Câu hỏi thường gặp về RentFlow
          </h2>
        </div>

        <div className="rf-reveal rf-reveal-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
                >
                  <span style={{ paddingRight: '16px' }}>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    color="#6B7280"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 22px 18px 22px',
                      fontSize: '13px',
                      color: '#4B5563',
                      lineHeight: 1.65,
                      animation: 'rfFadeIn 0.2s ease-out forwards',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          backgroundColor: '#002B24',
          color: '#E2E8F0',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '64px',
          paddingBottom: '36px',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
          {/* Top Footer Banner: Brand Mission, Contact & Quick Action */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '32px',
              paddingBottom: '48px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ maxWidth: '460px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <RentFlowLogo size={32} textColor="#FFFFFF" />
                <span
                  style={{
                    backgroundColor: 'rgba(52, 211, 153, 0.15)',
                    color: '#34D399',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                  }}
                >
                  ENTERPRISE PLATFORM
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.65, margin: '0 0 20px 0' }}>
                Nền tảng quản lý và vận hành thông minh dành cho chủ nhà trọ, căn hộ mini, serviced apartment và hệ thống bất động sản cho thuê. Tự động hóa hóa đơn, chốt điện nước, quản lý hợp đồng và theo dõi doanh thu minh bạch.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={15} color="#34D399" />
                  <span>Hotline hỗ trợ: <strong style={{ color: '#FFFFFF' }}>1900 8866</strong> (8:00 – 21:00)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={15} color="#34D399" />
                  <span>Email: <strong style={{ color: '#FFFFFF' }}>hotro@rentflow.vn</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={15} color="#34D399" />
                  <span>Văn phòng: Tòa nhà TechHub, Cầu Giấy, Hà Nội</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links Grid (4 Columns) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '36px',
              padding: '48px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Col 1: Giải pháp & Tính năng */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Giải pháp & Tính năng
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                <li><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Sơ đồ trạng thái phòng</a></li>
                <li><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Ghi số điện nước & Cảnh báo lệch</a></li>
                <li><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Phát hành hóa đơn & Mã QR</a></li>
                <li><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Hợp đồng & Sổ quỹ tiền cọc</a></li>
                <li><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Tiếp nhận báo hỏng & Sửa chữa</a></li>
                <li><a href="#showcase" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Khám phá giao diện thực tế</a></li>
              </ul>
            </div>

            {/* Col 2: Phân quyền & Mô hình */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Đối tượng phục vụ
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                <li><a href="#overview" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Nhà trọ & Dãy phòng cho thuê</a></li>
                <li><a href="#gallery" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Căn hộ mini & Serviced Apartments</a></li>
                <li><a href="#gallery" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Ký túc xá & Mô hình Co-living</a></li>
                <li><button type="button" onClick={() => navigate('/tenant/dashboard')} style={{ background: 'none', border: 'none', padding: 0, color: '#94A3B8', cursor: 'pointer', textAlign: 'left', font: 'inherit', fontSize: '13.5px' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Cổng cư dân (Tenant Portal)</button></li>
              </ul>
            </div>

            {/* Col 3: Hướng dẫn & Hỗ trợ */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Hỗ trợ & Hướng dẫn
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                <li><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Tính năng quản trị vận hành</a></li>
                <li><a href="#faq" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}>Câu hỏi thường gặp (FAQ)</a></li>
                <li><span style={{ color: '#64748B' }}>Biểu mẫu bàn giao phòng chuẩn</span></li>
                <li><span style={{ color: '#64748B' }}>Chính sách tính tiền điện lũy tiến</span></li>
                <li><span style={{ color: '#64748B' }}>Tích hợp Zalo Notification Service</span></li>
              </ul>
            </div>

            {/* Col 4: Cam kết & Bảo mật */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Bảo mật & Pháp lý
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                <li><span style={{ color: '#94A3B8' }}>Điều khoản sử dụng dịch vụ</span></li>
                <li><span style={{ color: '#94A3B8' }}>Chính sách bảo mật thông tin</span></li>
                <li><span style={{ color: '#94A3B8' }}>Mã hóa dữ liệu SSL 256-bit</span></li>
                <li><span style={{ color: '#94A3B8' }}>Sao lưu tự động nhiều vùng</span></li>
                <li>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34D399', fontSize: '12.5px', marginTop: '4px' }}>
                    <ShieldCheck size={16} />
                    <span>Cam kết bảo mật dữ liệu khách thuê</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar (Sub-footer) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '28px',
              fontSize: '12.5px',
              color: '#64748B',
            }}
          >
            <div>
              © 2026 RentFlow SaaS Platform. Nền tảng quản lý vận hành phòng trọ & căn hộ thế hệ mới.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                <span>Hệ thống hoạt động ổn định (99.9% uptime)</span>
              </div>
              <button
                type="button"
                onClick={() => setAdminModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                title="Về đầu trang"
                aria-label="Về đầu trang"
              >
                <span>Về đầu trang</span>
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* SECRET ADMIN LOGIN MODAL */}
      {adminModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Platform Admin Console"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'rfFadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAdminModalOpen(false);
            }
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '32px 28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              color: '#F8FAFC',
            }}
          >
            <button
              type="button"
              onClick={() => setAdminModalOpen(false)}
              aria-label="Đóng"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <RentFlowLogo size={36} textColor="#F8FAFC" />
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#F8FAFC', margin: '14px 0 4px 0' }}>
                Platform Admin Console
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                Cổng xác thực quản trị viên vận hành RentFlow
              </p>
            </div>

            {adminError && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', fontSize: '12px', marginBottom: '16px' }}>
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Tài khoản quản trị (Root Account)
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={adminSubmitting}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Mật khẩu quản trị
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={adminSubmitting}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 36px 9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #475569',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminSubmitting}
                className="rf-btn"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#00594C',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                {adminSubmitting ? (
                  <span>Đang xác thực...</span>
                ) : (
                  <>
                    <span>Đăng nhập Quản trị viên</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
