import React, { useState } from 'react';
import { Check, Plus, Save, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/feedback/ToastSystem';

export const SettingsPage: React.FC = () => {
  const { user, updateUserBank } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<'org' | 'team' | 'plans'>('org');

  // Bank Account Settings
  const [bankName, setBankName] = useState(user?.bankAccount?.bankName || 'Techcombank');
  const [accountNumber, setAccountNumber] = useState(user?.bankAccount?.accountNumber || '190345678901');
  const [accountHolder, setAccountHolder] = useState(user?.bankAccount?.accountHolder || 'NGUYEN AN');
  const [notificationEmail, setNotificationEmail] = useState(user?.bankAccount?.notificationEmail || user?.email || 'nguyenan.property@gmail.com');

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserBank({
      bankName,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim().toUpperCase(),
      notificationEmail: notificationEmail.trim(),
    });
    toast.success(
      'Đã lưu thông tin tài khoản ngân hàng!',
      `Tài khoản ${bankName} - ${accountNumber} sẽ tự động tạo mã VietQR và gửi thông báo khi cư dân thanh toán.`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Cài đặt hệ thống & Đội ngũ
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
          Quản lý thông tin tổ chức, thành viên quản lý phân quyền và gói thuê bao dịch vụ
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', gap: '24px', fontSize: '13px' }}>
        <button
          onClick={() => setTab('org')}
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'none',
            fontWeight: tab === 'org' ? 600 : 400,
            color: tab === 'org' ? '#00594C' : '#6B7280',
            borderBottom: tab === 'org' ? '2px solid #00594C' : 'none',
            cursor: 'pointer',
          }}
        >
          Thông tin tổ chức
        </button>
        <button
          onClick={() => setTab('team')}
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'none',
            fontWeight: tab === 'team' ? 600 : 400,
            color: tab === 'team' ? '#00594C' : '#6B7280',
            borderBottom: tab === 'team' ? '2px solid #00594C' : 'none',
            cursor: 'pointer',
          }}
        >
          Đội ngũ & Phân quyền
        </button>
        <button
          onClick={() => setTab('plans')}
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'none',
            fontWeight: tab === 'plans' ? 600 : 400,
            color: tab === 'plans' ? '#00594C' : '#6B7280',
            borderBottom: tab === 'plans' ? '2px solid #00594C' : 'none',
            cursor: 'pointer',
          }}
        >
          Gói cước dịch vụ
        </button>
      </div>

      {/* TAB 1: Organization Settings */}
      {tab === 'org' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
              Hồ sơ tổ chức / Chủ nhà
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Tên thương hiệu / Tổ chức
                </label>
                <input
                  type="text"
                  defaultValue="Nguyễn An Property"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Số điện thoại hotline
                </label>
                <input
                  type="text"
                  defaultValue="0988 123 456"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Email liên hệ chính
                </label>
                <input
                  type="email"
                  defaultValue="nguyenan.property@gmail.com"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Địa chỉ văn phòng quản lý
                </label>
                <input
                  type="text"
                  defaultValue="123/4 Lê Văn Sỹ, P.13, Q.3, TP.HCM"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                className="rf-btn rf-btn-primary"
                onClick={() => toast.success('Đã lưu thông tin tổ chức')}
              >
                <Save size={14} />
                Lưu hồ sơ tổ chức
              </button>
            </div>
          </div>

          {/* Dedicated Bank Account & Payment Gateway Settings */}
          <form onSubmit={handleSaveBank} className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#00594C" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Tài khoản ngân hàng nhận tiền phòng (VietQR) & Email thông báo
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Khi khách thuê thanh toán trên cổng cư dân hoặc quét hóa đơn, hệ thống sẽ tự động tạo mã QR có sẵn số tiền và nội dung chuyển khoản vào tài khoản này. Sau khi thanh toán hoàn tất, email báo có sẽ gửi tự động đến hộp thư của bạn.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Ngân hàng thụ hưởng *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', backgroundColor: '#fff' }}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Số tài khoản nhận tiền *
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="190345678901"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', fontWeight: 600 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Tên chủ tài khoản (in hoa) *
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  placeholder="NGUYEN AN"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Email nhận thông báo tiền về khi cư dân trả tiền thành công *
              </label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="nguyenan.property@gmail.com"
                style={{ width: '100%', maxWidth: '450px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                required
              />
            </div>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: '6px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: '#166534',
              }}
            >
              <ShieldCheck size={18} />
              <span>
                Cổng VietQR tự động đồng bộ tài khoản này với tất cả hóa đơn của các cơ sở cho thuê của bạn.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="submit" className="rf-btn rf-btn-primary">
                <Save size={14} />
                Lưu cấu hình tài khoản nhận tiền
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Team & Permissions */}
      {tab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Danh sách thành viên quản lý
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
                Phân bổ quyền ghi số điện nước, quản lý hợp đồng hoặc xem doanh thu
              </p>
            </div>
            <button className="rf-btn rf-btn-primary">
              <Plus size={14} />
              Mời thành viên mới
            </button>
          </div>

          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th>Vai trò</th>
                  <th>Phạm vi cơ sở</th>
                  <th>Ghi điện nước</th>
                  <th>Thu tiền phòng</th>
                  <th>Xem báo cáo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ fontWeight: 600 }}>Nguyễn An</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>nguyenan@rentflow.vn</div>
                  </td>
                  <td>
                    <span className="rf-badge rf-badge-active">Chủ sở hữu</span>
                  </td>
                  <td>Tất cả cơ sở</td>
                  <td><Check size={16} color="#137333" /></td>
                  <td><Check size={16} color="#137333" /></td>
                  <td><Check size={16} color="#137333" /></td>
                </tr>
                <tr>
                  <td>
                    <div style={{ fontWeight: 600 }}>Trần Văn Bình</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>binh.tran@gmail.com</div>
                  </td>
                  <td>
                    <span className="rf-badge rf-badge-active">Đồng chủ sở hữu</span>
                  </td>
                  <td>Tất cả cơ sở</td>
                  <td><Check size={16} color="#137333" /></td>
                  <td><Check size={16} color="#137333" /></td>
                  <td><Check size={16} color="#137333" /></td>
                </tr>
                <tr>
                  <td>
                    <div style={{ fontWeight: 600 }}>Lê Thị Mai (Kế toán nội bộ)</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>mai.le@rentflow.vn</div>
                  </td>
                  <td>
                    <span className="rf-badge rf-badge-neutral">Trợ lý tài chính</span>
                  </td>
                  <td>Tất cả cơ sở</td>
                  <td><Check size={16} color="#137333" /></td>
                  <td><Check size={16} color="#137333" /></td>
                  <td><Check size={16} color="#137333" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Service Packages & Subscriptions */}
      {tab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Gói dịch vụ RentFlow
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
              Bạn đang sử dụng gói <strong>Chuyên Nghiệp (Growth)</strong>, hết hạn vào ngày 31/12/2026
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {/* Starter */}
            <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span className="rf-badge rf-badge-neutral">Cơ bản</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '6px 0 0 0' }}>Starter</h4>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
                  Miễn phí
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                  Dưới 10 phòng cho thuê cá nhân
                </p>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>✓ Quản lý tối đa 10 phòng</li>
                <li>✓ Ghi chỉ số điện nước</li>
                <li>✓ Xuất hóa đơn PDF cơ bản</li>
              </ul>
              <button className="rf-btn rf-btn-secondary" style={{ marginTop: 'auto', width: '100%' }}>
                Gói mặc định
              </button>
            </div>

            {/* Growth */}
            <div className="rf-card" style={{ borderColor: '#00594C', borderWidth: '2px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '16px', backgroundColor: '#00594C', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                ĐANG DÙNG
              </div>
              <div>
                <span className="rf-badge rf-badge-active">Phổ biến nhất</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#00594C', margin: '6px 0 0 0' }}>Growth (Chuyên nghiệp)</h4>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
                  199.000 đ<span style={{ fontSize: '12px', fontWeight: 400, color: '#6B7280' }}>/tháng</span>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                  Tối đa 100 phòng, gửi tin nhắn tự động
                </p>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>✓ Quản lý tới 100 phòng</li>
                <li>✓ Tích hợp gửi Zalo / SMS tự động</li>
                <li>✓ Quản lý công nợ & phiếu cọc</li>
                <li>✓ Báo cáo tài chính chuyên sâu</li>
              </ul>
              <button className="rf-btn rf-btn-primary" style={{ marginTop: 'auto', width: '100%' }}>
                Gia hạn gói
              </button>
            </div>

            {/* Business */}
            <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span className="rf-badge rf-badge-neutral">Doanh nghiệp</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '6px 0 0 0' }}>Business</h4>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
                  499.000 đ<span style={{ fontSize: '12px', fontWeight: 400, color: '#6B7280' }}>/tháng</span>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                  Không giới hạn phòng & phân quyền chuỗi
                </p>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>✓ Không giới hạn số phòng</li>
                <li>✓ Phân quyền đa cấp nhiều chi nhánh</li>
                <li>✓ API tích hợp phần mềm kế toán</li>
                <li>✓ Hỗ trợ kỹ thuật ưu tiên 24/7</li>
              </ul>
              <button className="rf-btn rf-btn-secondary" style={{ marginTop: 'auto', width: '100%' }}>
                Nâng cấp Business
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
