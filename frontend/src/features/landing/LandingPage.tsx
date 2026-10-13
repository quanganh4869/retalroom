import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Zap,
  ChevronDown,
  CheckCircle2,
  Wrench,
  Users,
  ShieldCheck,
  Receipt,
  CreditCard,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { RentFlowLogo } from '@/components/ui/RentFlowLogo';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeAudience, setActiveAudience] = useState<'landlord' | 'tenant'>('landlord');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    <div style={{ minHeight: '100vh', backgroundColor: '#FBFBF9', color: '#111827', display: 'flex', flexDirection: 'column' }}>
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
            <a href="#workflow" className="rf-nav-link">Quy trình 4 bước</a>
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
            style={{ display: 'none', background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '6px' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
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
          <a href="#workflow" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>Quy trình 4 bước</a>
          <a href="#showcase" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>Giao diện thực tế</a>
          <a href="#gallery" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>Không gian phòng</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>Hỏi đáp</a>
        </div>
      )}

      {/* 2. HERO SECTION — IMAGE-RICH EDITORIAL COMPOSITION */}
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
        <div className="rf-pill-tag rf-hero-item-1" style={{ marginBottom: '20px' }}>
          <Sparkles size={13} color="#00594C" />
          <span>Nền tảng quản lý vận hành phòng trọ & căn hộ cho thuê</span>
        </div>

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

        <div className="rf-hero-item-4" style={{ display: 'flex', gap: '14px', marginBottom: '52px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            style={{ padding: '12px 26px', fontSize: '15px' }}
            onClick={() => navigate('/onboarding')}
          >
            <span>Bắt đầu quản lý (Miễn phí 14 ngày)</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="#features"
            className="rf-btn rf-btn-secondary"
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            Khám phá tính năng
          </a>
        </div>

        {/* LAYERED HERO IMAGE COMPOSITION (1 DOMINANT PHOTO + 2 SECONDARY PHOTOS + 2 FLOATING REAL UI CARDS) */}
        <div
          className="rf-hero-stage"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
            marginTop: '10px',
          }}
        >
          {/* Main Dominant Image */}
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
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.48) 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '28px',
                textAlign: 'left',
                color: '#FFFFFF',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Hệ sinh thái nhà trọ & căn hộ
              </div>
              <div style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 700, marginTop: '2px' }}>
                Quản lý liền mạch 10 đến 500+ phòng
              </div>
            </div>
          </div>

          {/* Secondary Overlapping Photo Top-Right (Balcony Studio) */}
          <div
            className="rf-img-container rf-img-zoom"
            style={{
              position: 'absolute',
              top: '-24px',
              right: '-24px',
              width: '260px',
              height: '190px',
              borderRadius: '12px',
              border: '4px solid #FFFFFF',
              boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
              display: 'none',
            }}
            id="hero-subphoto-1"
          >
            <img
              src={realEstatePhotos.studioRoom}
              alt="Phòng studio trọ gọn gàng sạch đẹp"
              className="rf-img-cover"
              loading="lazy"
            />
          </div>

          {/* Floating UI Card 1: Real Occupancy & Revenue Metric */}
          <div
            className="rf-glass-card"
            style={{
              position: 'absolute',
              bottom: '-24px',
              left: 'clamp(12px, 3vw, 36px)',
              borderRadius: '12px',
              padding: '14px 18px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              minWidth: '260px',
              boxShadow: '0 14px 30px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#E6F0EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00594C',
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                Tỷ lệ lấp đầy tháng này
              </div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                79.2% <span style={{ fontSize: '12px', fontWeight: 600, color: '#137333' }}>+4.2%</span>
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>52/66 phòng có khách ở</div>
            </div>
          </div>

          {/* Floating UI Card 2: Invoice & Instant Billing Alert */}
          <div
            className="rf-glass-card"
            style={{
              position: 'absolute',
              bottom: '-24px',
              right: 'clamp(12px, 3vw, 36px)',
              borderRadius: '12px',
              padding: '14px 18px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              minWidth: '280px',
              boxShadow: '0 14px 30px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#E6F4EA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#137333',
              }}
            >
              <Receipt size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                Hóa đơn tháng & Thu tiền
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#137333', marginTop: '2px' }}>
                86.400.000 đ
              </div>
              <div style={{ fontSize: '11px', color: '#4B5563' }}>Tự động xuất PDF kèm mã QR Zalo</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST & OPERATIONAL CAPABILITIES BAR */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E5E7EB',
          borderBottom: '1px solid #E5E7EB',
          padding: '44px 24px',
          marginTop: '36px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              6 trụ cột vận hành được tích hợp đồng bộ trong RentFlow
            </span>
          </div>

          <div
            className="rf-reveal"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              textAlign: 'center',
            }}
          >
            {[
              { icon: Building2, color: '#00594C', title: 'Quản lý phòng', sub: 'Sơ đồ & trạng thái' },
              { icon: Users, color: '#00594C', title: 'Khách & Hợp đồng', sub: 'Theo dõi hạn thuê' },
              { icon: Zap, color: '#D97706', title: 'Điện & Nước', sub: 'Chốt số tự động' },
              { icon: CreditCard, color: '#137333', title: 'Thu tiền & Nợ', sub: 'Gạch nợ chuẩn xác' },
              { icon: ShieldCheck, color: '#00594C', title: 'Tiền đặt cọc', sub: 'Quyết toán minh bạch' },
              { icon: Wrench, color: '#C5221F', title: 'Bảo trì sự cố', sub: 'Điều phối thợ sửa' },
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  style={{
                    padding: '16px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #F3F4F6',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Icon size={20} color={pillar.color} style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{pillar.title}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{pillar.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. REAL PAIN POINTS SECTION — EDITORIAL STAGGERED LAYOUT */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="rf-reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="rf-badge rf-badge-warning" style={{ marginBottom: '10px' }}>Thực trạng quản lý truyền thống</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
            Những bất cập khiến chủ nhà tiêu tốn hàng chục giờ mỗi tháng
          </h2>
          <p style={{ fontSize: '15px', color: '#4B5563', maxWidth: '640px', margin: '10px auto 0 auto', lineHeight: 1.6 }}>
            Ghi chép sổ tay và chat Zalo rời rạc dễ dẫn đến sai sót chỉ số điện, quên thu nợ cũ và thất lạc yêu cầu sửa chữa.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Card 1: Ghi số điện nước & Sai lệch */}
          <div
            className="rf-card rf-reveal rf-reveal-delay-1"
            style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div className="rf-img-container rf-img-zoom" style={{ height: '210px' }}>
              <img
                src={realEstatePhotos.utilityMeter}
                alt="Kiểm tra công tơ điện nước phòng trọ"
                className="rf-img-cover"
                loading="lazy"
              />
            </div>
            <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="rf-badge rf-badge-danger" style={{ alignSelf: 'flex-start' }}>Sai sót phổ biến</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>Chốt số điện nước thủ công, nhầm lẫn bậc giá</h3>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.55 }}>
                Phải đi từng tầng ghi sổ tay, về nhà nhập Excel thủ công gây nhầm số cũ và số mới, dễ dẫn đến tranh cãi khi khách thanh toán.
              </p>
            </div>
          </div>

          {/* Card 2: Quên hạn hợp đồng & Thất thoát cọc */}
          <div
            className="rf-card rf-reveal rf-reveal-delay-2"
            style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div className="rf-img-container rf-img-zoom" style={{ height: '210px' }}>
              <img
                src={realEstatePhotos.handoverKeys}
                alt="Bàn giao chìa khóa và kiểm tra hợp đồng"
                className="rf-img-cover"
                loading="lazy"
              />
            </div>
            <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="rf-badge rf-badge-warning" style={{ alignSelf: 'flex-start' }}>Rủi ro pháp lý</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>Quên thời hạn hợp đồng, tranh cãi tiền cọc</h3>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.55 }}>
                Không nhớ khách nào sắp hết hạn để tìm khách mới. Khi trả phòng không có bảng cấn trừ hư hỏng minh bạch khiến mất lòng đôi bên.
              </p>
            </div>
          </div>

          {/* Card 3: Thất lạc báo hỏng & Chậm trễ */}
          <div
            className="rf-card rf-reveal rf-reveal-delay-3"
            style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div className="rf-img-container rf-img-zoom" style={{ height: '210px' }}>
              <img
                src={realEstatePhotos.maintenanceTech}
                alt="Thợ kỹ thuật sửa chữa thiết bị"
                className="rf-img-cover"
                loading="lazy"
              />
            </div>
            <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="rf-badge rf-badge-neutral" style={{ alignSelf: 'flex-start' }}>Trải nghiệm cư dân</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>Tin nhắn báo hỏng bị trôi, thợ không rõ chi phí</h3>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.55 }}>
                Khách báo nghẹt nước hay cháy bóng đèn qua Zalo dễ bị quên. Không theo dõi được chi phí đã chi trả cho thợ sửa hàng tháng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS — 4 CONNECTED STEPS WITH ACTUAL INTERFACES */}
      <section id="workflow" style={{ padding: '80px 24px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="rf-reveal" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="rf-badge rf-badge-active" style={{ marginBottom: '10px' }}>Quy trình vận hành chuẩn</span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
              Chu trình khép kín trong 4 bước đơn giản
            </h2>
            <p style={{ fontSize: '15px', color: '#4B5563', maxWidth: '600px', margin: '10px auto 0 auto', lineHeight: 1.6 }}>
              Từ ngày khách dọn vào đến ngày chốt sổ cuối tháng, mọi nghiệp vụ đều có quy chuẩn rõ ràng.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Step 1 */}
            <div className="rf-card rf-reveal rf-reveal-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#00594C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                1
              </div>
              <div className="rf-img-container rf-img-zoom" style={{ height: '140px', borderRadius: '8px' }}>
                <img src={realEstatePhotos.buildingExterior} alt="Tòa nhà cho thuê" className="rf-img-cover" loading="lazy" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>Khởi tạo cơ sở & Phòng</h4>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.55 }}>
                Nhập số tầng, mã phòng, đơn giá thuê và định mức điện nước. Thiết lập sơ đồ trực quan chỉ trong 5 phút.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rf-card rf-reveal rf-reveal-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#00594C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                2
              </div>
              <div className="rf-img-container rf-img-zoom" style={{ height: '140px', borderRadius: '8px' }}>
                <img src={productScreens.contractDetail} alt="Hợp đồng điện tử" className="rf-img-cover" loading="lazy" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>Ký hợp đồng & Nhận cọc</h4>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.55 }}>
                Khai báo thông tin khách thuê, số tiền cọc bảo chứng và lập biên bản bàn giao phòng kèm đồng hồ ban đầu.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rf-card rf-reveal rf-reveal-delay-3" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#00594C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                3
              </div>
              <div className="rf-img-container rf-img-zoom" style={{ height: '140px', borderRadius: '8px' }}>
                <img src={productScreens.meterReading} alt="Bảng ghi số điện nước" className="rf-img-cover" loading="lazy" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>Chốt số & Xuất hóa đơn</h4>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.55 }}>
                Ghi số công tơ trên bảng tính hàng loạt, hệ thống tự động cộng tiền phòng, điện, nước và xuất phiếu thu PDF.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rf-card rf-reveal rf-reveal-delay-3" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#00594C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                4
              </div>
              <div className="rf-img-container rf-img-zoom" style={{ height: '140px', borderRadius: '8px' }}>
                <img src={productScreens.paymentReceipt} alt="Gạch nợ và theo dõi tiền về" className="rf-img-cover" loading="lazy" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>Gạch nợ & Quyết toán</h4>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.55 }}>
                Xác nhận chuyển khoản ngân hàng, gạch nợ từng hóa đơn và lập phiếu hoàn cọc khi khách kết thúc hợp đồng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. IMMERSIVE ALTERNATING FEATURE SHOWCASE (IMAGE + REAL PRODUCT PREVIEW) */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="rf-reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="rf-badge rf-badge-active" style={{ marginBottom: '10px' }}>Chi tiết tính năng</span>
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
              <span className="rf-badge rf-badge-active" style={{ alignSelf: 'flex-start' }}>Sơ đồ tầng trực quan</span>
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
              <span className="rf-badge rf-badge-warning" style={{ alignSelf: 'flex-start' }}>Tự động hóa tính toán</span>
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
              <span className="rf-badge rf-badge-active" style={{ alignSelf: 'flex-start' }}>Hóa đơn & Dòng tiền</span>
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
              <span className="rf-badge rf-badge-danger" style={{ alignSelf: 'flex-start' }}>Xử lý sự cố</span>
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
            <span className="rf-badge rf-badge-active" style={{ marginBottom: '10px' }}>Trải nghiệm giao diện</span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
              Giao diện thực tế được thiết kế chuẩn mực cho quản trị viên
            </h2>
            <p style={{ fontSize: '15px', color: '#4B5563', maxWidth: '640px', margin: '10px auto 36px auto', lineHeight: 1.6 }}>
              Hình ảnh thật từ hệ thống RentFlow đang chạy. Gọn gàng, chính xác, tốc độ cao và tối ưu cho thao tác hằng ngày.
            </p>
          </div>

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
                }}
              >
                https://app.rentflow.vn/landlord/dashboard
              </div>
            </div>

            <img
              src={productScreens.heroOverview}
              alt="Màn hình bảng điều khiển chủ nhà RentFlow"
              style={{ width: '100%', display: 'block' }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 8. RESIDENTIAL PHOTO GALLERY — REAL LIVING SPACES */}
      <section id="gallery" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="rf-reveal" style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span className="rf-badge rf-badge-active" style={{ marginBottom: '10px' }}>Không gian thực tế</span>
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
            <span className="rf-badge rf-badge-active" style={{ marginBottom: '10px' }}>Trải nghiệm phân vai</span>
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
          <span className="rf-badge rf-badge-active" style={{ marginBottom: '10px' }}>Giải đáp thắc mắc</span>
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

      {/* 11. FINAL CTA SECTION — IMAGE-BACKED & COMPELLING */}
      <section style={{ padding: '80px 24px 90px 24px', backgroundColor: '#00594C', color: '#FFFFFF', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="rf-reveal" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Sẵn sàng chuyển đổi việc quản lý nhà trọ ngay hôm nay?
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 34px 0', lineHeight: 1.65, maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
            Bắt đầu dùng thử miễn phí 14 ngày. Không cần thẻ tín dụng, sẵn sàng tạo cơ sở đầu tiên chỉ sau 2 phút đăng ký.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="rf-btn"
              style={{ backgroundColor: '#FFFFFF', color: '#00594C', fontWeight: 700, padding: '13px 30px', fontSize: '15px' }}
              onClick={() => navigate('/onboarding')}
            >
              <span>Đăng ký tài khoản chủ nhà</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="rf-btn"
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#FFFFFF', fontWeight: 600, padding: '13px 24px', fontSize: '15px' }}
              onClick={() => navigate('/auth/roles')}
            >
              Cổng đăng nhập các vai trò
            </button>
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer style={{ padding: '36px 32px 28px 32px', borderTop: '1px solid #E5E7EB', backgroundColor: '#FBFBF9', fontSize: '12px', color: '#6B7280' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <RentFlowLogo size={24} textColor="#4B5563" />
            <span>© 2026 RentFlow Platform. Nền tảng quản lý vận hành nhà trọ & căn hộ thế hệ mới.</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#overview" style={{ color: '#6B7280', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#00594C')} onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>Tổng quan</a>
            <a href="#features" style={{ color: '#6B7280', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#00594C')} onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>Tính năng</a>
            <a href="#faq" style={{ color: '#6B7280', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#00594C')} onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>Hỏi đáp</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
