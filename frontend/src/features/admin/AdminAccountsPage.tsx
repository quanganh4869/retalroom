import React, { useState } from 'react';
import {
  Search,
  Filter,
  KeyRound,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformAccount } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminAccountsPage: React.FC = () => {
  const { accounts, toggleAccountStatus, updateAccountRole } = usePlatformAdmin();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected account for detail view or status change
  const [selectedAccount, setSelectedAccount] = useState<PlatformAccount | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionReason, setActionReason] = useState('Yêu cầu kiểm tra an ninh từ Platform Admin');
  const [editingRoleAccount, setEditingRoleAccount] = useState<PlatformAccount | null>(null);
  const [selectedRole, setSelectedRole] = useState<PlatformAccount['role']>('LANDLORD');

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.phone.includes(searchTerm) ||
      (acc.organizationName && acc.organizationName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || acc.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = () => {
    if (!selectedAccount) return;
    toggleAccountStatus(selectedAccount.id, actionReason);
    setConfirmModalOpen(false);
    toast.success(
      'Cập nhật thành công',
      `Tài khoản ${selectedAccount.email} đã được chuyển sang trạng thái ${
        selectedAccount.status === 'ACTIVE' ? 'TẠM KHÓA' : 'HOẠT ĐỘNG'
      }`
    );
    setSelectedAccount(null);
  };

  const handleSaveRole = () => {
    if (!editingRoleAccount) return;
    updateAccountRole(editingRoleAccount.id, selectedRole);
    setEditingRoleAccount(null);
    toast.success('Phân quyền thành công', `Đã cập nhật vai trò cho ${editingRoleAccount.email}`);
  };

  const getRoleBadge = (role: PlatformAccount['role']) => {
    switch (role) {
      case 'SUPERADMIN':
        return <span className="rf-badge rf-badge-danger">SuperAdmin SaaS</span>;
      case 'SUPPORT_AGENT':
        return <span className="rf-badge rf-badge-vacant">Support Ops</span>;
      case 'BILLING_ADMIN':
        return <span className="rf-badge rf-badge-warning">Billing Admin</span>;
      case 'LANDLORD':
        return <span className="rf-badge rf-badge-active">Chủ nhà</span>;
      case 'TENANT':
        return <span className="rf-badge rf-badge-neutral">Khách thuê</span>;
      default:
        return <span className="rf-badge">{role}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-danger">Account Directory</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Cơ sở dữ liệu danh tính người dùng</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>
            Quản lý tài khoản toàn hệ thống RentFlow
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280', alignSelf: 'center' }}>
            Tổng số: <strong>{accounts.length}</strong> tài khoản
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rf-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại hoặc tổ chức..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="SUPERADMIN">SuperAdmin</option>
            <option value="SUPPORT_AGENT">Support Agent</option>
            <option value="LANDLORD">Chủ nhà</option>
            <option value="TENANT">Khách thuê</option>
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
            <option value="ACTIVE">Hoạt động (Active)</option>
            <option value="SUSPENDED">Đã khóa (Suspended)</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="rf-table">
          <thead>
            <tr>
              <th>Họ và tên / Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò nền tảng</th>
              <th>Tổ chức trực thuộc</th>
              <th>Bảo mật 2FA</th>
              <th>Lần đăng nhập cuối</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((acc) => (
              <tr key={acc.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{acc.name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{acc.email}</div>
                </td>
                <td style={{ fontSize: '13px' }}>{acc.phone}</td>
                <td>{getRoleBadge(acc.role)}</td>
                <td style={{ fontSize: '13px' }}>
                  {acc.organizationName ? (
                    <span style={{ fontWeight: 500, color: '#00594C' }}>{acc.organizationName}</span>
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>Hệ thống SaaS</span>
                  )}
                </td>
                <td>
                  {acc.twoFactorEnabled ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#16A34A', fontWeight: 500 }}>
                      <CheckCircle size={13} /> Bật 2FA
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9CA3AF' }}>
                      <XCircle size={13} /> Chưa bật
                    </span>
                  )}
                </td>
                <td style={{ fontSize: '12px', color: '#6B7280' }}>{acc.lastLoginAt}</td>
                <td>
                  {acc.status === 'ACTIVE' ? (
                    <span className="rf-badge rf-badge-active">Hoạt động</span>
                  ) : (
                    <span className="rf-badge rf-badge-danger">Đã tạm khóa</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="rf-btn rf-btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      title="Phân quyền vai trò"
                      onClick={() => {
                        setEditingRoleAccount(acc);
                        setSelectedRole(acc.role);
                      }}
                    >
                      <KeyRound size={12} /> Sửa quyền
                    </button>
                    <button
                      type="button"
                      className="rf-btn rf-btn-secondary"
                      style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        color: acc.status === 'ACTIVE' ? '#DC2626' : '#16A34A',
                      }}
                      onClick={() => {
                        setSelectedAccount(acc);
                        setConfirmModalOpen(true);
                      }}
                    >
                      {acc.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#6B7280' }}>
                  Không tìm thấy tài khoản phù hợp với điều kiện lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal for Suspend/Reactivate */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={selectedAccount?.status === 'ACTIVE' ? 'Xác nhận khóa tài khoản' : 'Xác nhận kích hoạt lại tài khoản'}
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              backgroundColor: selectedAccount?.status === 'ACTIVE' ? '#FEE2E2' : '#DCFCE7',
              padding: '12px',
              borderRadius: '6px',
              color: selectedAccount?.status === 'ACTIVE' ? '#991B1B' : '#166534',
            }}
          >
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              {selectedAccount?.status === 'ACTIVE' ? (
                <>
                  Bạn đang chuẩn bị <strong>khóa tài khoản</strong> của <strong>{selectedAccount?.name}</strong> ({selectedAccount?.email}).
                  Người dùng này sẽ bị hủy phiên đăng nhập ngay lập tức.
                </>
              ) : (
                <>
                  Bạn đang chuẩn bị <strong>mở khóa lại</strong> cho tài khoản <strong>{selectedAccount?.name}</strong>.
                </>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Lý do thực hiện ghi vào Audit Log *
            </label>
            <input
              type="text"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setConfirmModalOpen(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              style={{
                backgroundColor: selectedAccount?.status === 'ACTIVE' ? '#DC2626' : '#16A34A',
                borderColor: selectedAccount?.status === 'ACTIVE' ? '#DC2626' : '#16A34A',
              }}
              onClick={handleToggleStatus}
            >
              Xác nhận {selectedAccount?.status === 'ACTIVE' ? 'khóa tài khoản' : 'mở khóa'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={!!editingRoleAccount}
        onClose={() => setEditingRoleAccount(null)}
        title="Thay đổi vai trò người dùng"
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#111827' }}>{editingRoleAccount?.name}</div>
            <div style={{ color: '#6B7280', fontSize: '12px' }}>{editingRoleAccount?.email}</div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Vai trò mới trong hệ thống
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as PlatformAccount['role'])}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="LANDLORD">Chủ nhà (Landlord)</option>
              <option value="TENANT">Khách thuê (Tenant)</option>
              <option value="SUPPORT_AGENT">Hỗ trợ viên kỹ thuật (Support Ops)</option>
              <option value="SUPERADMIN">Platform Admin (Toàn quyền SaaS)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setEditingRoleAccount(null)}
            >
              Đóng
            </button>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={handleSaveRole}
            >
              Lưu phân quyền
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
