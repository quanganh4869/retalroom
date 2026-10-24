import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { SubscriptionPlan, initialSubscriptionPlans } from './types/platformAdmin';
import { useToast } from '@/components/feedback/ToastSystem';

const DEFAULT_FALLBACK_PLAN: SubscriptionPlan = {
  id: 'GROWTH',
  name: 'Gói Growth PRO',
  tagline: 'Dành cho chủ nhà trọ chuyên nghiệp quy mô vừa',
  monthlyPrice: 399000,
  annualPrice: 3830000,
  maxRooms: 50,
  maxProperties: 5,
  isPopular: true,
  features: [
    'Quản lý tối đa 5 cơ sở & 50 phòng',
    'Tính tiền điện nước theo công tơ',
    'Tự động gửi hóa đơn Zalo/Email',
    'Cổng thanh toán tự động VietQR Pro',
  ],
  activeSubscribersCount: 88,
  isActive: true,
};

export const AdminConfigurePlansPage: React.FC = () => {
  const { planId: urlPlanId } = useParams<{ planId?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { plans, updatePlan } = usePlatformAdmin();

  // Find target plan or fallback to 'GROWTH' / first plan
  const defaultPlanId = (urlPlanId?.toUpperCase() as SubscriptionPlan['id']) || 'GROWTH';
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan['id']>(defaultPlanId);

  // Form state
  const currentPlan: SubscriptionPlan =
    plans.find((p) => p.id === selectedPlanId) || plans[0] || initialSubscriptionPlans[1] || DEFAULT_FALLBACK_PLAN;
  const [name, setName] = useState(currentPlan.name);
  const [tagline, setTagline] = useState(currentPlan.tagline);
  const [monthlyPrice, setMonthlyPrice] = useState(currentPlan.monthlyPrice);
  const [annualPrice, setAnnualPrice] = useState(currentPlan.annualPrice);
  const [maxRooms, setMaxRooms] = useState(currentPlan.maxRooms);
  const [maxProperties, setMaxProperties] = useState(currentPlan.maxProperties);
  const [isPopular, setIsPopular] = useState(Boolean(currentPlan.isPopular));
  const [isActive, setIsActive] = useState(currentPlan.isActive !== false);
  const [features, setFeatures] = useState<string[]>([...currentPlan.features]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state when selectedPlanId changes
  useEffect(() => {
    const p = plans.find((item) => item.id === selectedPlanId) || plans[0];
    if (p) {
      setName(p.name);
      setTagline(p.tagline);
      setMonthlyPrice(p.monthlyPrice);
      setAnnualPrice(p.annualPrice);
      setMaxRooms(p.maxRooms);
      setMaxProperties(p.maxProperties);
      setIsPopular(Boolean(p.isPopular));
      setIsActive(p.isActive !== false);
      setFeatures([...p.features]);
      setHasChanges(false);
    }
  }, [selectedPlanId, plans]);

  // Handle plan switch
  const handleSelectPlan = (id: SubscriptionPlan['id']) => {
    setSelectedPlanId(id);
    navigate(`/platform/subscription-plans/configure/${id.toLowerCase()}`, { replace: true });
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
    setHasChanges(true);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePlan(selectedPlanId, {
      name: name.trim(),
      tagline: tagline.trim(),
      monthlyPrice: Number(monthlyPrice),
      annualPrice: Number(annualPrice),
      maxRooms: Number(maxRooms),
      maxProperties: Number(maxProperties),
      isPopular,
      isActive,
      features: features.filter((f) => f.trim().length > 0),
    });

    setHasChanges(false);
    toast.success(
      'Cập nhật thành công',
      `Đã lưu cấu hình tham số mới cho gói ${name.trim()} trên toàn hệ thống.`
    );
  };

  const handleResetToDefault = () => {
    const def = initialSubscriptionPlans.find((p) => p.id === selectedPlanId);
    if (!def) return;
    setName(def.name);
    setTagline(def.tagline);
    setMonthlyPrice(def.monthlyPrice);
    setAnnualPrice(def.annualPrice);
    setMaxRooms(def.maxRooms);
    setMaxProperties(def.maxProperties);
    setIsPopular(Boolean(def.isPopular));
    setIsActive(def.isActive !== false);
    setFeatures([...def.features]);
    setHasChanges(true);
    toast.info('Khôi phục mẫu', `Đã tải lại thông số gốc cho gói ${def.name}. Hãy bấm "Lưu thay đổi" để áp dụng.`);
  };

  const calculateDiscount = () => {
    if (monthlyPrice === 0 || annualPrice === 0) return 0;
    const standardAnnual = monthlyPrice * 12;
    if (standardAnnual <= annualPrice) return 0;
    return Math.round(((standardAnnual - annualPrice) / standardAnnual) * 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Breadcrumb & Header */}
      <div>
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#6B7280',
            marginBottom: '4px',
          }}
        >
          <Link to="/platform/dashboard" style={{ color: '#6B7280', textDecoration: 'none' }}>
            Tổng quan
          </Link>
          <ChevronRight size={13} color="#9CA3AF" />
          <Link to="/platform/subscription-plans" style={{ color: '#00594C', textDecoration: 'none', fontWeight: 500 }}>
            Gói dịch vụ SaaS & Thuê bao
          </Link>
          <ChevronRight size={13} color="#9CA3AF" />
          <span style={{ color: '#111827', fontWeight: 600 }}>Cấu hình tham số gói</span>
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginTop: '6px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Cấu hình tham số & Tính năng 3 gói SaaS
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>
              Tùy biến biểu phí, hạn mức phòng, cơ sở và tính năng mở rộng cho các gói Starter, Growth PRO và Enterprise.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {hasChanges && (
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  border: '1px solid #FCD34D',
                }}
              >
                ● Chưa lưu thay đổi
              </span>
            )}

            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => navigate('/platform/subscription-plans')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <ArrowLeft size={14} />
              <span>Quay lại danh sách gói</span>
            </button>

            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={handleSave}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Save size={14} />
              <span>Lưu cấu hình gói</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Switcher Tabs for 3 Plans */}
      <div
        className="rf-card"
        style={{
          padding: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
        }}
      >
        {plans.map((p) => {
          const isSelected = p.id === selectedPlanId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPlan(p.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '10px 14px',
                borderRadius: '6px',
                border: isSelected ? '1px solid #00594C' : '1px solid transparent',
                backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#00594C' : '#374151' }}>
                  {p.name}
                </span>
                {p.isPopular && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      backgroundColor: '#E6F0EE',
                      color: '#00594C',
                      padding: '1px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    PHỔ BIẾN
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                {p.monthlyPrice.toLocaleString('vi-VN')} đ/tháng • {p.activeSubscribersCount} tổ chức
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Form Grid: Editor on Left, Live Card Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left Form Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card A: Identity & Marketing */}
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #E5E7EB' }}>
              1. Thông tin định danh & Tiếp thị
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '12px', marginBottom: '4px' }}>
                  Mã gói (ID)
                </label>
                <input
                  type="text"
                  value={selectedPlanId}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#F3F4F6',
                    color: '#6B7280',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '12px', marginBottom: '4px' }}>
                  Tên hiển thị gói <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setHasChanges(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '12px', marginBottom: '4px' }}>
                Khẩu hiệu / Tagline mô tả gói
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  setHasChanges(true);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => {
                    setIsPopular(e.target.checked);
                    setHasChanges(true);
                  }}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>Gắn huy hiệu "Phổ biến nhất"</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => {
                    setIsActive(e.target.checked);
                    setHasChanges(true);
                  }}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>Đang mở bán công khai</span>
              </label>
            </div>
          </div>

          {/* Card B: Pricing Policy */}
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #E5E7EB' }}>
              2. Chính sách giá cước (VND)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '12px', marginBottom: '4px' }}>
                  Giá chu kỳ tháng (đ/tháng)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={monthlyPrice}
                  onChange={(e) => {
                    setMonthlyPrice(Number(e.target.value));
                    setHasChanges(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', display: 'block' }}>
                  {monthlyPrice > 0 ? `${monthlyPrice.toLocaleString('vi-VN')} VNĐ / tháng` : 'Miễn phí'}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '12px', marginBottom: '4px' }}>
                  Giá chu kỳ năm (đ/năm)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={annualPrice}
                  onChange={(e) => {
                    setAnnualPrice(Number(e.target.value));
                    setHasChanges(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#00594C', marginTop: '2px', display: 'block', fontWeight: 600 }}>
                  {calculateDiscount() > 0 ? `Tiết kiệm ${calculateDiscount()}% so với trả theo tháng` : 'Không có chiết khấu'}
                </span>
              </div>
            </div>
          </div>

          {/* Card C: Quotas & Resource Limits */}
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #E5E7EB' }}>
              3. Hạn mức tài nguyên (Quotas)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '12px', marginBottom: '4px' }}>
                  Số phòng quản lý tối đa
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxRooms}
                  onChange={(e) => {
                    setMaxRooms(Number(e.target.value));
                    setHasChanges(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '12px', marginBottom: '4px' }}>
                  Số cơ sở / tòa nhà tối đa
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxProperties}
                  onChange={(e) => {
                    setMaxProperties(Number(e.target.value));
                    setHasChanges(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card D: Feature List Management */}
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #E5E7EB' }}>
              4. Danh mục tính năng bao gồm ({features.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', width: '20px' }}>#{idx + 1}</span>
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#DC2626',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Xóa tính năng này"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Feature Form */}
            <form onSubmit={handleAddFeature} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                placeholder="Nhập tính năng mới..."
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="rf-btn rf-btn-secondary"
                disabled={!newFeatureText.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              >
                <Plus size={14} /> Thêm tính năng
              </button>
            </form>
          </div>

          {/* Form Actions Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={handleResetToDefault}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <RotateCcw size={13} /> Khôi phục thông số gốc
            </button>

            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={handleSave}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Save size={14} /> Lưu cấu hình gói này
            </button>
          </div>
        </div>

        {/* Right Live Card Preview */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
            <Eye size={14} /> Xem trước hiển thị trực quan:
          </div>

          <div
            className="rf-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              backgroundColor: '#FFFFFF',
              border: isPopular ? '2px solid #00594C' : '1px solid #E5E7EB',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            }}
          >
            {isPopular && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#00594C',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                PHỔ BIẾN NHẤT
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {name || 'Tên gói'}
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                {tagline || 'Khẩu hiệu tóm tắt gói dịch vụ'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>
                {monthlyPrice > 0 ? `${Number(monthlyPrice).toLocaleString('vi-VN')} đ` : '0 đ'}
              </span>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>/tháng</span>
            </div>

            <div style={{ fontSize: '12px', color: '#4B5563', padding: '10px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px' }}>
              Hạn mức: <strong>Tối đa {maxRooms} phòng</strong> • <strong>{maxProperties} cơ sở</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Tính năng bao gồm:</span>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                  <Check size={14} color="#00594C" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: '#6B7280' }}>Khách hàng đăng ký:</span>
              <strong style={{ color: '#00594C' }}>{currentPlan.activeSubscribersCount} tổ chức</strong>
            </div>

            <button
              type="button"
              className="rf-btn rf-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSave}
            >
              Lưu thay đổi gói {name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
