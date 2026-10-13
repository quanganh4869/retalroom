import React, { useState } from 'react';
import {
  Shield,
  Users,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformRolePermission, initialPlatformRolePermissions } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminAccessControlPage: React.FC = () => {
  const { rolePermissions } = usePlatformAdmin();
  const toast = useToast();

  const [selectedRole, setSelectedRole] = useState<PlatformRolePermission>(
    initialPlatformRolePermissions[0]!
  );
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

  const handleEditRole = (role: PlatformRolePermission) => {
    setSelectedRole(role);
    setPermissionModalOpen(true);
  };

  const handleSavePolicy = () => {
    setPermissionModalOpen(false);
    toast.success('Đã cập nhật chính sách', `Chính sách RBAC cho vai trò ${selectedRole.title} đã được lưu.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-danger">NGƯỜI DÙNG & TRUY CẬP</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Phân quyền theo vai trò (Role-Based Access Control)</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 2px 0' }}>
            Quản lý vai trò & Phân quyền hệ thống (Roles & Permissions)
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Kiểm soát quyền truy cập tài nguyên (Xem, Tạo, Sửa, Xóa) cho từng nhóm tài khoản: SuperAdmin, Support Ops, Billing, Landlord và Tenant.
          </p>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {rolePermissions.map((rp) => {
          const isSelected = selectedRole.role === rp.role;
          return (
            <div
              key={rp.role}
              className="rf-card"
              onClick={() => setSelectedRole(rp)}
              style={{
                cursor: 'pointer',
                padding: '16px',
                border: isSelected ? '2px solid #00594C' : '1px solid #E5E7EB',
                backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="rf-badge" style={{ fontSize: '11px', fontWeight: 700 }}>
                  {rp.role}
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={12} /> {rp.userCount.toLocaleString('vi-VN')} tài khoản
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginTop: '10px' }}>
                {rp.title}
              </div>

              <p style={{ fontSize: '12px', color: '#6B7280', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                {rp.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix Table */}
      <div className="rf-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Ma trận quyền hạn chi tiết cho: <span style={{ color: '#00594C' }}>{selectedRole.title}</span>
            </h3>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>
              Quy tắc thực thi ở cả Middleware API backend và UI Route Guard
            </span>
          </div>

          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => handleEditRole(selectedRole)}
          >
            <Lock size={13} /> Tùy chỉnh chính sách
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Module / Tài nguyên</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563', textAlign: 'center' }}>Xem (Read)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563', textAlign: 'center' }}>Tạo mới (Create)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563', textAlign: 'center' }}>Sửa (Update)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563', textAlign: 'center' }}>Xóa (Delete)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Hạn chế đặc biệt (Policy)</th>
              </tr>
            </thead>
            <tbody>
              {selectedRole.permissions.map((perm, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>
                    {perm.module}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {perm.view ? <Check size={16} color="#16A34A" style={{ margin: '0 auto' }} /> : <X size={16} color="#DC2626" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {perm.create ? <Check size={16} color="#16A34A" style={{ margin: '0 auto' }} /> : <X size={16} color="#DC2626" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {perm.edit ? <Check size={16} color="#16A34A" style={{ margin: '0 auto' }} /> : <X size={16} color="#DC2626" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {perm.delete ? <Check size={16} color="#16A34A" style={{ margin: '0 auto' }} /> : <X size={16} color="#DC2626" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {perm.restrictedActions.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {perm.restrictedActions.map((ra, rIdx) => (
                          <span key={rIdx} className="rf-badge rf-badge-warning" style={{ fontSize: '11px' }}>
                            {ra}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#16A34A' }}>Toàn quyền xử lý hợp lệ</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Policy Modal */}
      {permissionModalOpen && (
        <Modal
          isOpen={permissionModalOpen}
          onClose={() => setPermissionModalOpen(false)}
          title={`Tùy chỉnh chính sách vai trò: ${selectedRole.title}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '6px', color: '#1E40AF', fontSize: '12px' }}>
              <Shield size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Chính sách RBAC kiểm soát phạm vi truy cập dữ liệu của từng vai trò để đảm bảo an ninh đa khách hàng (Multi-tenant isolation).
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Mô tả vai trò:
              </label>
              <textarea
                defaultValue={selectedRole.description}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => setPermissionModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={handleSavePolicy}
              >
                Lưu chính sách
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
