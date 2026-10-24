import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Check,
  Bell,
  Send,
  Sliders,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminSubscriptionPlansPage: React.FC = () => {
  const { plans, subscriptions } = usePlatformAdmin();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') === 'subscriptions' ? 'subscriptions' : 'plans';
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'subscriptions' || tabFromUrl === 'plans') {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'plans' | 'subscriptions') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isAllSelected = filteredSubscriptions.length > 0 && filteredSubscriptions.every((s) => selectedIds.includes(s.id));
  const isSomeSelected = filteredSubscriptions.some((s) => selectedIds.includes(s.id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubscriptions.map((s) => s.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRemindAll = () => {
    if (filteredSubscriptions.length === 0) {
      toast.warning('Danh sách trống', 'Không có tổ chức nào trong danh sách để gửi nhắc phí.');
      return;
    }
    toast.success(
      'Đã gửi nhắc phí hàng loạt',
      `Đã gửi thông báo nhắc gia hạn thuê bao tới tất cả ${filteredSubscriptions.length} tổ chức.`
    );
  };

  const handleRemindSelected = () => {
    if (selectedIds.length === 0) {
      toast.warning('Chưa chọn mục nào', 'Vui lòng đánh dấu tích ít nhất một tổ chức để nhắc phí.');
      return;
    }
    const selectedOrgs = subscriptions.filter((s) => selectedIds.includes(s.id));
    const orgNames = selectedOrgs.slice(0, 2).map((s) => s.organizationName).join(', ');
    const extraCount = selectedOrgs.length > 2 ? ` và ${selectedOrgs.length - 2} tổ chức khác` : '';
    toast.success(
      'Đã gửi nhắc phí đã chọn',
      `Đã gửi thông báo gia hạn tới ${selectedIds.length} tổ chức (${orgNames}${extraCount}).`
    );
  };

  const handleRemindSingle = (sub: typeof subscriptions[0]) => {
    toast.success(
      'Đã gửi nhắc phí',
      `Đã gửi thông báo nhắc gia hạn thuê bao tới ${sub.organizationName}`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Gói dịch vụ phần mềm & Quản lý thuê bao
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Thiết lập biểu phí SaaS toàn hệ thống và theo dõi các hợp đồng thuê bao của chủ trọ.
          </p>
        </div>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '8px 16px' }}
          onClick={() => navigate('/platform/subscription-plans/configure')}
        >
          <Sliders size={15} />
          <span>Tùy chỉnh thông số 3 gói SaaS</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', gap: '24px', fontSize: '13px' }}>
        <button
          type="button"
          onClick={() => handleTabChange('plans')}
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'none',
            fontWeight: activeTab === 'plans' ? 600 : 400,
            color: activeTab === 'plans' ? '#00594C' : '#6B7280',
            borderBottom: activeTab === 'plans' ? '2px solid #00594C' : 'none',
            cursor: 'pointer',
          }}
        >
          Cấu hình gói dịch vụ SaaS ({plans.length})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('subscriptions')}
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'none',
            fontWeight: activeTab === 'subscriptions' ? 600 : 400,
            color: activeTab === 'subscriptions' ? '#00594C' : '#6B7280',
            borderBottom: activeTab === 'subscriptions' ? '2px solid #00594C' : 'none',
            cursor: 'pointer',
          }}
        >
          Danh sách hợp đồng thuê bao ({subscriptions.length})
        </button>
      </div>

      {/* TAB 1: Subscription Plans Matrix */}
      {activeTab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {plans.map((p) => (
              <div
                key={p.id}
                className="rf-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {p.isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#E6F4EA',
                      color: '#00594C',
                      border: '1px solid #A7F3D0',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    GỢI Ý TĂNG TRƯỞNG
                  </div>
                )}

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>{p.name}</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>{p.tagline}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>
                    {p.monthlyPrice.toLocaleString('vi-VN')} đ
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>/tháng</span>
                </div>

                <div style={{ fontSize: '12px', color: '#4B5563', padding: '10px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px' }}>
                  Hạn mức: <strong>Tối đa {p.maxRooms} phòng</strong> • <strong>{p.maxProperties} cơ sở</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Tính năng bao gồm:</span>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <Check size={14} color="#00594C" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#6B7280' }}>Khách hàng đăng ký:</span>
                  <strong style={{ color: '#00594C' }}>{p.activeSubscribersCount} tổ chức</strong>
                </div>

                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => navigate(`/platform/subscription-plans/configure/${p.id.toLowerCase()}`)}
                >
                  <Sliders size={14} />
                  <span>Cấu hình tham số gói {p.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Subscriptions Table */}
      {activeTab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action & Filter bar */}
          <div className="rf-card" style={{ padding: '14px 20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Tìm hợp đồng thuê bao theo tên tổ chức hoặc tên gói..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hiệu lực (Active)</option>
              <option value="PAST_DUE">Quá hạn thanh toán</option>
            </select>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  onClick={handleRemindSelected}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <Send size={14} />
                  <span>Nhắc đã chọn ({selectedIds.length})</span>
                </button>
              )}
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={handleRemindAll}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                title="Gửi thông báo nhắc phí tới toàn bộ tổ chức trong danh sách"
              >
                <Bell size={14} />
                <span>Nhắc tất cả</span>
              </button>
            </div>
          </div>

          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th style={{ width: '42px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      title="Chọn tất cả"
                    />
                  </th>
                  <th>Tổ chức khách hàng</th>
                  <th>Gói dịch vụ</th>
                  <th>Chu kỳ & Giá trị</th>
                  <th>Cổng thanh toán</th>
                  <th>Hạn thanh toán kế tiếp</th>
                  <th>Tự động gia hạn</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => {
                  const isChecked = selectedIds.includes(sub.id);
                  return (
                    <tr
                      key={sub.id}
                      style={{ backgroundColor: isChecked ? '#F0FDF4' : undefined }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(sub.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{sub.organizationName}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>Mã HĐ: {sub.id}</div>
                      </td>
                      <td>
                        <span className="rf-badge rf-badge-active">{sub.planName}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.amountVnd.toLocaleString('vi-VN')} đ</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                          {sub.billingCycle === 'ANNUAL' ? '12 Tháng' : 'Hàng tháng'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#4B5563' }}>{sub.paymentMethod}</span>
                      </td>
                      <td style={{ fontSize: '12px' }}>{sub.currentPeriodEnd}</td>
                      <td>
                        {sub.autoRenew ? (
                          <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 500 }}>Bật Auto-debit</span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Tắt</span>
                        )}
                      </td>
                      <td>
                        {sub.status === 'ACTIVE' ? (
                          <span className="rf-badge rf-badge-active">Hiệu lực</span>
                        ) : (
                          <span className="rf-badge rf-badge-danger">Quá hạn (Past Due)</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="rf-btn rf-btn-secondary"
                          style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleRemindSingle(sub)}
                        >
                          <Bell size={12} />
                          Nhắc phí
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
