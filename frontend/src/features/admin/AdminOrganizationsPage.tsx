import React, { useState } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  Layers,
  MapPin,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformOrganization, SubscriptionPlan } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminOrganizationsPage: React.FC = () => {
  const { organizations, plans, toggleOrganizationStatus, updateOrganizationPlan } = usePlatformAdmin();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');

  // Detail / Action state
  const [selectedOrg, setSelectedOrg] = useState<PlatformOrganization | null>(null);
  const [changePlanOrg, setChangePlanOrg] = useState<PlatformOrganization | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan['id']>('GROWTH');
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('Vi phạm điều khoản thanh toán SaaS');

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.ownerPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || org.status === statusFilter;
    const matchesPlan = planFilter === 'ALL' || org.planId === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleToggleStatus = () => {
    if (!selectedOrg) return;
    toggleOrganizationStatus(selectedOrg.id, suspensionReason);
    setSuspendModalOpen(false);
    toast.success(
      'Cập nhật thành công',
      `Tổ chức ${selectedOrg.name} đã được cập nhật sang trạng thái ${
        selectedOrg.status === 'ACTIVE' ? 'TẠM NGƯNG' : 'HOẠT ĐỘNG'
      }`
    );
    setSelectedOrg(null);
  };

  const handleSavePlanChange = () => {
    if (!changePlanOrg) return;
    updateOrganizationPlan(changePlanOrg.id, selectedPlanId);
    setChangePlanOrg(null);
    toast.success('Nâng cấp gói thành công', `Đã chuyển tổ chức ${changePlanOrg.name} sang gói dịch vụ mới.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-danger">Organization Management</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Không gian khách hàng B2B / SaaS Tenants</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>
            Tổ chức & Tài khoản chủ nhà
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280', alignSelf: 'center' }}>
            Tổng số: <strong>{organizations.length}</strong> tổ chức trên hệ thống
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rf-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo tên tổ chức, tên chủ nhà, số điện thoại hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#F9FAFB',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="#6B7280" />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Tất cả gói SaaS</option>
            <option value="STARTER">Starter</option>
            <option value="GROWTH">Growth PRO</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="SUSPENDED">Tạm ngưng</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="rf-table">
          <thead>
            <tr>
              <th>Tên tổ chức / Thương hiệu</th>
              <th>Chủ sở hữu & Liên hệ</th>
              <th>Quy mô phòng / Hạn mức</th>
              <th>Gói thuê bao SaaS</th>
              <th>Chu kỳ & Doanh thu MRR</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.map((org) => {
              const quotaUsagePct = Math.min(100, Math.round((org.roomsCount / org.maxRoomsQuota) * 100));

              return (
                <tr key={org.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{org.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={12} /> {org.address}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{org.ownerName}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {org.ownerPhone} • {org.ownerEmail}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong>{org.roomsCount}</strong> / {org.maxRoomsQuota} phòng ({org.propertiesCount} tòa)
                    </div>
                    {/* Usage progress bar */}
                    <div style={{ width: '120px', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${quotaUsagePct}%`,
                          height: '100%',
                          backgroundColor: quotaUsagePct > 90 ? '#DC2626' : quotaUsagePct > 70 ? '#D97706' : '#00594C',
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <span
                      className={`rf-badge ${
                        org.planId === 'ENTERPRISE'
                          ? 'rf-badge-vacant'
                          : org.planId === 'GROWTH'
                          ? 'rf-badge-active'
                          : 'rf-badge-neutral'
                      }`}
                    >
                      {org.planName}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {org.mrrVnd.toLocaleString('vi-VN')} đ/tháng
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>
                      {org.billingCycle === 'ANNUAL' ? 'Trả cả năm' : 'Trả hàng tháng'} • Kế tiếp: {org.nextBillingDate}
                    </div>
                  </td>
                  <td>
                    {org.status === 'ACTIVE' ? (
                      <span className="rf-badge rf-badge-active">Hoạt động</span>
                    ) : (
                      <span className="rf-badge rf-badge-danger">Tạm ngưng</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="rf-btn rf-btn-secondary"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        title="Đổi gói dịch vụ"
                        onClick={() => {
                          setChangePlanOrg(org);
                          setSelectedPlanId(org.planId);
                        }}
                      >
                        <Layers size={12} /> Đổi gói
                      </button>
                      <button
                        type="button"
                        className="rf-btn rf-btn-secondary"
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          color: org.status === 'ACTIVE' ? '#DC2626' : '#16A34A',
                        }}
                        onClick={() => {
                          setSelectedOrg(org);
                          setSuspendModalOpen(true);
                        }}
                      >
                        {org.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt lại'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Change SaaS Plan Modal */}
      <Modal
        isOpen={!!changePlanOrg}
        onClose={() => setChangePlanOrg(null)}
        title="Điều chỉnh gói thuê bao SaaS cho tổ chức"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#111827' }}>{changePlanOrg?.name}</div>
            <div style={{ color: '#6B7280', fontSize: '12px' }}>
              Quy mô hiện tại: {changePlanOrg?.roomsCount} phòng đang thuê
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Chọn gói SaaS mục tiêu
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value as SubscriptionPlan['id'])}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
              }}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.monthlyPrice.toLocaleString('vi-VN')} đ/tháng (Tối đa {p.maxRooms} phòng)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setChangePlanOrg(null)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={handleSavePlanChange}
            >
              Áp dụng gói mới
            </button>
          </div>
        </div>
      </Modal>

      {/* Suspend / Reactivate Confirmation Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={selectedOrg?.status === 'ACTIVE' ? 'Xác nhận tạm ngưng tổ chức' : 'Kích hoạt lại tổ chức'}
        maxWidth="520px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              backgroundColor: selectedOrg?.status === 'ACTIVE' ? '#FEE2E2' : '#DCFCE7',
              padding: '12px',
              borderRadius: '6px',
              color: selectedOrg?.status === 'ACTIVE' ? '#991B1B' : '#166534',
            }}
          >
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              {selectedOrg?.status === 'ACTIVE' ? (
                <>
                  Bạn đang chuẩn bị <strong>tạm ngưng quyền truy cập</strong> của toàn bộ tổ chức{' '}
                  <strong>{selectedOrg?.name}</strong>. Chủ nhà và khách thuê của tổ chức này sẽ tạm thời không thể
                  đăng nhập hoặc lập phiếu thu mới.
                </>
              ) : (
                <>
                  Bạn đang chuẩn bị <strong>mở lại quyền truy cập</strong> cho tổ chức{' '}
                  <strong>{selectedOrg?.name}</strong>.
                </>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Lý do thay đổi trạng thái *
            </label>
            <select
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option>Vi phạm điều khoản thanh toán SaaS</option>
              <option>Yêu cầu tạm ngưng từ chính chủ nhà</option>
              <option>Nghi ngờ gian lận hoặc vi phạm bảo mật</option>
              <option>Đã hoàn tất thanh toán & kích hoạt lại</option>
              <option>Khác</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setSuspendModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              style={{
                backgroundColor: selectedOrg?.status === 'ACTIVE' ? '#DC2626' : '#16A34A',
                borderColor: selectedOrg?.status === 'ACTIVE' ? '#DC2626' : '#16A34A',
              }}
              onClick={handleToggleStatus}
            >
              Xác nhận {selectedOrg?.status === 'ACTIVE' ? 'tạm ngưng' : 'kích hoạt'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
