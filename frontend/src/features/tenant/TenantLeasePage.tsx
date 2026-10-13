import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileCheck,
  Send,
  User,
  Phone,
  Download,
  Eye,
  CheckCircle2,
  Building2,
  Home,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockContracts, mockProperties, mockRooms, ContractItem, RoomItem, PropertyItem } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { Modal } from '@/components/ui/Modal';

export const TenantLeasePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'details' | 'deposit' | 'documents' | 'rules'>('details');

  // Renewal Modal
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalPeriod, setRenewalPeriod] = useState('12');
  const [renewalNote, setRenewalNote] = useState('');
  const [renewalSubmitted, setRenewalSubmitted] = useState(false);

  // Early Termination Modal
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [moveOutDate, setMoveOutDate] = useState('2024-04-30');
  const [terminationReason, setTerminationReason] = useState('Chuyển công tác');
  const [terminationNote, setTerminationNote] = useState('');
  const [terminationSubmitted, setTerminationSubmitted] = useState(false);

  // Find contract
  const userRoomCode = user?.roomCode || 'P.101';
  const tenantContract: ContractItem = mockContracts.find((c) => c.roomCode === userRoomCode) || mockContracts[0]!;
  const room: RoomItem = mockRooms.find((r) => r.code === userRoomCode) || mockRooms[0]!;
  const property: PropertyItem = mockProperties.find((p) => p.id === room.propertyId) || mockProperties[0]!;

  const formatVND = (n: number) => n.toLocaleString('vi-VN') + ' đ';

  const handleRenewalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRenewalSubmitted(true);
    toast.success(
      'Đã gửi đề nghị gia hạn hợp đồng',
      `Đề nghị gia hạn thêm ${renewalPeriod} tháng đã được chuyển tới chủ nhà Nguyễn An.`
    );
    setTimeout(() => {
      setShowRenewalModal(false);
      setRenewalSubmitted(false);
    }, 1800);
  };

  const handleTerminationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTerminationSubmitted(true);
    toast.info(
      'Đã gửi thông báo trả phòng',
      `Thông báo dự kiến trả phòng vào ngày ${moveOutDate} đã được gửi tới chủ nhà để lên lịch bàn giao & quyết toán cọc.`
    );
    setTimeout(() => {
      setShowTerminationModal(false);
      setTerminationSubmitted(false);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner / Hero */}
      <div
        className="rf-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
          border: '1px solid #BBF7D0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#00594C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Hợp đồng thuê phòng & Tiền cọc
              </h2>
              <span className="rf-badge rf-badge-active">
                {tenantContract.status === 'active' ? 'Đang hiệu lực' : 'Đã ký kết'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#4B5563', margin: '4px 0 0 0' }}>
              Mã hợp đồng: <strong>{tenantContract.id}</strong> • Phòng{' '}
              <strong>{room.code || user?.roomCode || 'P.101'}</strong> ({property.name})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => {
              toast.info('Tải hợp đồng điện tử', 'Đang tạo bản PDF hợp đồng có chữ ký số điện tử...');
            }}
          >
            <Download size={15} />
            Tải hợp đồng PDF
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => setShowRenewalModal(true)}
          >
            <Calendar size={15} />
            Đề nghị gia hạn
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Giá thuê cố định</span>
            <Home size={16} color="#00594C" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
            {formatVND(tenantContract.monthlyRent || 4200000)}
          </div>
          <span style={{ fontSize: '11px', color: '#4B5563' }}>Kỳ thanh toán: Ngày 01-05 hàng tháng</span>
        </div>

        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Tiền cọc bảo chứng</span>
            <ShieldCheck size={16} color="#16A34A" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803D' }}>
            {formatVND(tenantContract.depositAmount || 4200000)}
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 500 }}>
            ● Được bảo lưu & hoàn trả khi thanh lý
          </span>
        </div>

        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Thời hạn hợp đồng</span>
            <Calendar size={16} color="#2563EB" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {tenantContract.startDate} → {tenantContract.endDate}
          </div>
          <span style={{ fontSize: '11px', color: '#2563EB' }}>Thời gian thuê: 12 tháng</span>
        </div>

        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Tình trạng hợp đồng</span>
            <FileCheck size={16} color="#059669" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#059669' }}>
            Đang còn hiệu lực
          </div>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Hạn báo trả phòng trước 30 ngày</span>
        </div>
      </div>

      {/* Internal Subtabs for Organising Contract Subviews (Complies with section 5: Sub-tabs within an object) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab('details')}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'details' ? 600 : 500,
            color: activeSubTab === 'details' ? '#00594C' : '#6B7280',
            borderBottom: activeSubTab === 'details' ? '2px solid #00594C' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Chi tiết điều khoản
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('deposit')}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'deposit' ? 600 : 500,
            color: activeSubTab === 'deposit' ? '#00594C' : '#6B7280',
            borderBottom: activeSubTab === 'deposit' ? '2px solid #00594C' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Tiền cọc & Quyết toán
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('documents')}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'documents' ? 600 : 500,
            color: activeSubTab === 'documents' ? '#00594C' : '#6B7280',
            borderBottom: activeSubTab === 'documents' ? '2px solid #00594C' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Hồ sơ & Tài liệu đính kèm
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('rules')}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'rules' ? 600 : 500,
            color: activeSubTab === 'rules' ? '#00594C' : '#6B7280',
            borderBottom: activeSubTab === 'rules' ? '2px solid #00594C' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Quy chế & Trách nhiệm tòa nhà
        </button>
      </div>

      {/* SUBTAB 1: DETAILS */}
      {activeSubTab === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
              Thông tin điều khoản hợp đồng thuê
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>MÃ HỢP ĐỒNG</span>
                <strong style={{ color: '#111827', fontSize: '14px' }}>{tenantContract.id}</strong>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>PHÒNG THUÊ</span>
                <strong style={{ color: '#111827', fontSize: '14px' }}>
                  {room.code || 'Phòng 101'} - Tầng 1
                </strong>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>NGÀY BẮT ĐẦU</span>
                <strong style={{ color: '#111827', fontSize: '14px' }}>{tenantContract.startDate}</strong>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>NGÀY KẾT THÚC</span>
                <strong style={{ color: '#111827', fontSize: '14px' }}>{tenantContract.endDate}</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#4B5563' }}>Giá thuê hàng tháng:</span>
                <strong style={{ color: '#111827' }}>{formatVND(tenantContract.monthlyRent || 4200000)} / tháng</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#4B5563' }}>Tiền cọc bảo chứng:</span>
                <strong style={{ color: '#16A34A' }}>{formatVND(tenantContract.depositAmount || 4200000)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#4B5563' }}>Đơn giá điện ký hợp đồng:</span>
                <span>3.800 đ / kWh (Công tơ riêng)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#4B5563' }}>Đơn giá nước ký hợp đồng:</span>
                <span>20.000 đ / m³ (Đồng hồ riêng)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#4B5563' }}>Phí dịch vụ & internet:</span>
                <span>150.000 đ / tháng (Wifi tốc độ cao, vệ sinh, rác)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#4B5563' }}>Hạn thanh toán hóa đơn:</span>
                <span>Ngày 01 đến 05 hàng tháng</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ flex: 1 }}
                onClick={() => setShowRenewalModal(true)}
              >
                <Calendar size={15} />
                Đề nghị gia hạn hợp đồng
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ flex: 1, color: '#DC2626' }}
                onClick={() => setShowTerminationModal(true)}
              >
                <AlertCircle size={15} />
                Đề nghị trả phòng trước hạn
              </button>
            </div>
          </div>

          {/* Right Panel: Parties Involved */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Bên cho thuê (Bên A)
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#00594C',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                  }}
                >
                  NA
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                    {property.manager || 'Nguyễn An'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Chủ sở hữu tòa nhà</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} color="#6B7280" />
                  <span>0988 123 456</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={13} color="#6B7280" />
                  <span>{property.address}</span>
                </div>
              </div>
            </div>

            <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Bên thuê (Bên B)
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#1E40AF',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                  }}
                >
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                    {user?.name || 'Lê Hoàng Nam'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Khách thuê đại diện</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <div>• CCCD/CMND: 001201029384</div>
                <div>• SĐT: {user?.phone || '0912 345 678'}</div>
                <div>• Email: {user?.email || 'tenant@rentflow.vn'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DEPOSIT */}
      {activeSubTab === 'deposit' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Quy chế tiền cọc & Trạng thái bảo lưu
              </h3>
              <span className="rf-badge rf-badge-active">ĐÃ NỘP & BẢO LƯU</span>
            </div>

            <div
              style={{
                padding: '16px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: '#166534' }}>Số tiền cọc thực tế đã nộp:</span>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#14532D' }}>
                  {formatVND(tenantContract.depositAmount || 4200000)}
                </div>
                <span style={{ fontSize: '11px', color: '#166534' }}>
                  Biên lai thu cọc số: DEP-2023-018 (Ngày nộp: {tenantContract.startDate})
                </span>
              </div>
              <ShieldCheck size={36} color="#16A34A" />
            </div>

            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Nguyên tắc hoàn trả tiền cọc theo hợp đồng:
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Hết hạn hợp đồng:</strong> Hoàn trả 100% tiền cọc sau khi kiểm tra phòng, đối chiếu chỉ số điện nước cuối cùng và bàn giao chìa khóa.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Thông báo trước 30 ngày:</strong> Trường hợp muốn chuyển đi trước hạn nhưng thông báo trước tối thiểu 30 ngày, tiền cọc được khấu trừ nghĩa vụ và hoàn trả theo thỏa thuận phụ lục.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Khấu trừ hư hỏng (nếu có):</strong> Nếu thiết bị hoặc tài sản bàn giao bị hư hại do lỗi người sử dụng, chi phí sửa chữa thay thế sẽ được khấu trừ trực tiếp vào tiền cọc kèm hóa đơn minh bạch.
                </span>
              </div>
            </div>
          </div>

          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
              Tiến trình quyết toán cọc dự kiến
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A', marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>1. Khởi tạo & nộp cọc ban đầu</div>
                  <div style={{ color: '#6B7280' }}>Đã hoàn tất ngày {tenantContract.startDate}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00594C', marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>2. Đang bảo lưu an toàn</div>
                  <div style={{ color: '#6B7280' }}>Hiệu lực suốt thời gian thuê phòng</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9CA3AF', marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#6B7280' }}>3. Nghiệm thu bàn giao hoàn phòng</div>
                  <div style={{ color: '#9CA3AF' }}>Dự kiến khi kết thúc hợp đồng</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9CA3AF', marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#6B7280' }}>4. Chuyển khoản hoàn trả cọc</div>
                  <div style={{ color: '#9CA3AF' }}>Trong vòng 24h sau khi ký biên bản bàn giao</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DOCUMENTS */}
      {activeSubTab === 'documents' && (
        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
            Hồ sơ & Tài liệu đính kèm
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={24} color="#00594C" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>HopDongThuePhong_CT-2023.pdf</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>2.4 MB • Đã ký số 2 bên</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ padding: '6px 8px' }}
                  onClick={() => toast.info('Xem văn bản', 'Đang mở trình duyệt tài liệu...')}
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ padding: '6px 8px' }}
                  onClick={() => toast.success('Tải xuống', 'Đã lưu tệp vào thư mục Downloads.')}
                >
                  <Download size={14} />
                </button>
              </div>
            </div>

            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} color="#16A34A" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>BienLaiTienCoc_DEP2023.pdf</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>850 KB • Đã xác nhận nộp tiền</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ padding: '6px 8px' }}
                  onClick={() => toast.info('Xem biên lai', 'Đang mở hóa đơn thu tiền cọc...')}
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ padding: '6px 8px' }}
                  onClick={() => toast.success('Tải xuống', 'Đã lưu biên lai cọc.')}
                >
                  <Download size={14} />
                </button>
              </div>
            </div>

            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck size={24} color="#2563EB" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>BienBanBanGiaoNoiThat.pdf</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>1.8 MB • Danh mục 12 thiết bị</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ padding: '6px 8px' }}
                  onClick={() => toast.info('Xem biên bản bàn giao', 'Chi tiết trang thiết bị kèm phòng...')}
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ padding: '6px 8px' }}
                  onClick={() => toast.success('Tải xuống', 'Đã lưu danh mục nội thất.')}
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: RULES */}
      {activeSubTab === 'rules' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
              Nội quy phòng trọ & Trách nhiệm cư dân
            </h3>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#00594C' }}>1.</span>
                <span>
                  <strong>Thời gian yên tĩnh:</strong> Không gây tiếng ồn lớn, mở nhạc loa lớn hoặc tụ tập đông người sau 22h30 đêm nhằm đảm bảo giấc ngủ cho cả tòa nhà.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#00594C' }}>2.</span>
                <span>
                  <strong>An ninh & Khóa cổng:</strong> Luôn đóng khóa cổng vân tay/thẻ từ khi ra vào. Không đưa người lạ ngủ lại qua đêm mà chưa thông báo đăng ký tạm trú với ban quản lý.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#00594C' }}>3.</span>
                <span>
                  <strong>Phòng cháy chữa cháy (PCCC):</strong> Tuyệt đối không nấu nướng bằng bếp than củi, tắt các thiết bị nhiệt (bàn là, bếp điện) khi ra khỏi phòng. Giữ thông thoáng lối thoát hiểm.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#00594C' }}>4.</span>
                <span>
                  <strong>Vệ sinh môi trường:</strong> Bỏ rác đúng nơi quy định, phân loại rác thải sinh hoạt trước 19h00 hàng ngày.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#00594C' }}>5.</span>
                <span>
                  <strong>Thông báo trả phòng:</strong> Phải báo trước ít nhất 30 ngày qua cổng cư dân hoặc bằng văn bản để chủ nhà kịp bố trí thời gian kiểm kê và hoàn tiền cọc.
                </span>
              </div>
            </div>
          </div>

          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
              Đường dây nóng hỗ trợ khẩn cấp
            </h4>
            <div style={{ fontSize: '12px', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FECACA' }}>
                <div style={{ fontWeight: 600, color: '#DC2626' }}>Cứu hỏa / Khẩn cấp: 114</div>
                <div style={{ color: '#991B1B', marginTop: '2px' }}>Công an khu vực: 024 3825 4321</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                <div style={{ fontWeight: 600, color: '#1D4ED8' }}>Quản lý tòa nhà: 0988 123 456</div>
                <div style={{ color: '#1E40AF', marginTop: '2px' }}>Hỗ trợ kỹ thuật điện nước 24/7</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RENEWAL REQUEST WORKFLOW */}
      <Modal
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        title="Gửi đề nghị gia hạn hợp đồng thuê"
      >
        <form onSubmit={handleRenewalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '420px' }}>
          {renewalSubmitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={40} color="#16A34A" />
              <div style={{ fontWeight: 600, fontSize: '16px' }}>Đã gửi đề nghị thành công!</div>
              <div style={{ fontSize: '13px', color: '#4B5563' }}>Chủ nhà sẽ nhận thông báo và liên hệ để hoàn tất phụ lục hợp đồng.</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5 }}>
                Hợp đồng hiện tại mã <strong>{tenantContract.id}</strong> sẽ hết hạn vào ngày <strong>{tenantContract.endDate}</strong>. Bạn muốn đề nghị gia hạn thêm:
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Thời hạn gia hạn đề xuất:
                </label>
                <select
                  value={renewalPeriod}
                  onChange={(e) => setRenewalPeriod(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                >
                  <option value="6">Gia hạn thêm 06 tháng</option>
                  <option value="12">Gia hạn thêm 12 tháng (1 năm - Được ưu đãi giữ giá thuê)</option>
                  <option value="24">Gia hạn thêm 24 tháng (2 năm)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Ghi chú hoặc mong muốn bổ sung (tùy chọn):
                </label>
                <textarea
                  rows={3}
                  value={renewalNote}
                  onChange={(e) => setRenewalNote(e.target.value)}
                  placeholder="Ví dụ: Đề xuất sơn mới phòng hoặc thay đệm..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  onClick={() => setShowRenewalModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rf-btn rf-btn-primary"
                >
                  <Send size={14} />
                  Gửi đề nghị tới chủ nhà
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* MODAL 2: EARLY MOVE-OUT REQUEST WORKFLOW */}
      <Modal
        isOpen={showTerminationModal}
        onClose={() => setShowTerminationModal(false)}
        title="Đề nghị thông báo trả phòng trước hạn"
      >
        <form onSubmit={handleTerminationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '420px' }}>
          {terminationSubmitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={40} color="#16A34A" />
              <div style={{ fontWeight: 600, fontSize: '16px' }}>Đã gửi thông báo trả phòng!</div>
              <div style={{ fontSize: '13px', color: '#4B5563' }}>Chủ nhà sẽ liên hệ để xếp lịch bàn giao phòng và thủ tục hoàn cọc.</div>
            </div>
          ) : (
            <>
              <div style={{ padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FCA5A5', fontSize: '12px', color: '#991B1B' }}>
                <strong>Lưu ý quan trọng:</strong> Theo hợp đồng, quý khách vui lòng báo trước ít nhất 30 ngày để đảm bảo quyền lợi bảo toàn tiền cọc {formatVND(tenantContract.depositAmount || 4200000)}.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Ngày dự kiến trả phòng & bàn giao:
                </label>
                <input
                  type="date"
                  value={moveOutDate}
                  onChange={(e) => setMoveOutDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Lý do trả phòng:
                </label>
                <select
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                >
                  <option value="Chuyển công tác">Chuyển công tác / trường học</option>
                  <option value="Mua nhà riêng">Mua nhà riêng</option>
                  <option value="Thay đổi kế hoạch cá nhân">Thay đổi kế hoạch cá nhân</option>
                  <option value="Khác">Lý do khác</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Ghi chú bàn giao:
                </label>
                <textarea
                  rows={2}
                  value={terminationNote}
                  onChange={(e) => setTerminationNote(e.target.value)}
                  placeholder="Ghi chú thời gian thuận tiện để kiểm kê bàn giao..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  onClick={() => setShowTerminationModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rf-btn rf-btn-primary"
                  style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                >
                  Xác nhận gửi thông báo trả phòng
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};
