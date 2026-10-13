import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  FileCheck,
} from 'lucide-react';
import {
  mockContracts,
  mockRooms,
  mockProperties,
  formatVND,
  ContractItem,
} from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';

export const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirmAction } = useActionModal();

  const foundContract = mockContracts.find((c) => c.id === id);
  const initialContract: ContractItem = foundContract || mockContracts[0]!;
  const [contract, setContract] = useState<ContractItem>(initialContract);
  const room = mockRooms.find((r) => r.code === contract.roomCode);
  const property = room ? mockProperties.find((p) => p.id === room.propertyId) : mockProperties[0];

  const handleRenew = () => {
    // Extend end date by 1 year
    const endDateStr = contract.endDate || '2025-12-31';
    const parts = endDateStr.split('-');
    const newYear = parseInt(parts[0] || '2025', 10) + 1;
    const newEnd = `${newYear}-${parts[1] || '12'}-${parts[2] || '31'}`;

    confirmAction({
      title: `Gia hạn hợp đồng ${contract.id}`,
      description: `Gia hạn thời hạn thuê phòng ${contract.roomCode} cho khách thuê ${contract.tenantName} thêm 01 năm (đến ngày ${newEnd}) với mức giá ${formatVND(contract.monthlyRent)}/tháng.`,
      confirmText: 'Xác nhận gia hạn',
      successTitle: 'Gia hạn hợp đồng thành công!',
      successMessage: `Hợp đồng ${contract.id} đã được kéo dài đến ngày ${newEnd}. Phụ lục hợp đồng đã được lưu vào hệ thống.`,
      simulateDelayMs: 850,
      onSuccess: () => {
        setContract({
          ...contract,
          endDate: newEnd,
          status: 'active',
        });
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="rf-badge rf-badge-active">HIỆU LỰC</span>;
      case 'expiring':
        return <span className="rf-badge rf-badge-warning">SẮP HẾT HẠN</span>;
      case 'expired':
        return <span className="rf-badge rf-badge-overdue">ĐÃ HẾT HẠN</span>;
      case 'terminated':
        return <span className="rf-badge">ĐÃ CHẤM DỨT</span>;
      default:
        return <span className="rf-badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Navigation Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => navigate('/contracts')}
          style={{ padding: '6px 12px' }}
        >
          <ArrowLeft size={14} /> Quay lại danh sách hợp đồng
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={handlePrint}
          >
            <Printer size={14} /> In hợp đồng thuê nhà
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={handleRenew}
          >
            <FileCheck size={14} /> Gia hạn thêm 1 năm
          </button>
        </div>
      </div>

      {/* Main Printable Legal Contract Document */}
      <div
        className="rf-card"
        style={{
          padding: '48px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          color: '#1F2937',
          lineHeight: 1.6,
        }}
      >
        {/* National Emblem & Title Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px' }}>
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </div>
          <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#4B5563' }}>
            Độc lập – Tự do – Hạnh phúc
          </div>
          <div style={{ margin: '8px auto', width: '120px', height: '1px', backgroundColor: '#111827' }}></div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '16px 0 4px 0' }}>
            HỢP ĐỒNG THUÊ PHÒNG TRỌ / NHÀ Ở
          </h1>
          <div style={{ fontSize: '13px', color: '#00594C', fontWeight: 700 }}>
            Số hợp đồng: {contract.id}
          </div>
          <div style={{ marginTop: '8px' }}>{getStatusBadge(contract.status)}</div>
        </div>

        {/* Legal Clauses */}
        <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <em>Hôm nay, ngày ký hợp đồng, các bên gồm có:</em>
          </div>

          {/* Party A */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
            }}
          >
            <strong style={{ color: '#00594C' }}>BÊN CHO THUÊ (BÊN A):</strong>
            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              <div>Họ và tên: <strong>{property?.manager || 'Nguyễn An'}</strong></div>
              <div>Số điện thoại: <strong>0909.123.456</strong></div>
              <div>CCCD số: <strong>079085001234</strong></div>
              <div>Đại diện cơ sở: <strong>{property?.name || 'Nhà trọ Hưng Phát'}</strong></div>
              <div style={{ gridColumn: 'span 2' }}>
                Địa chỉ: {property?.address || '123/4 Lê Văn Sỹ, P.13, Q.3, TP.HCM'}
              </div>
            </div>
          </div>

          {/* Party B */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
            }}
          >
            <strong style={{ color: '#00594C' }}>BÊN THUÊ (BÊN B):</strong>
            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              <div>Họ và tên: <strong>{contract.tenantName}</strong></div>
              <div>Số điện thoại: <strong>{contract.tenantPhone}</strong></div>
              <div>Số lượng người ở cùng: <strong>{room?.occupants?.length || 1} người</strong></div>
              <div>
                Phòng thuê:{' '}
                <strong style={{ color: '#00594C' }}>
                  {contract.roomCode}
                  {room && (
                    <Link
                      to={`/rooms/${room.id}`}
                      style={{ fontSize: '11px', marginLeft: '6px', color: '#2563EB', textDecoration: 'none' }}
                    >
                      (Chi tiết phòng)
                    </Link>
                  )}
                </strong>
              </div>
            </div>
          </div>

          {/* Article 1 */}
          <div>
            <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
              Điều 1: Đối tượng hợp đồng và thời hạn thuê
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
              Bên A đồng ý cho Bên B thuê phòng số <strong>{contract.roomCode}</strong> tại cơ sở{' '}
              <strong>{property?.name}</strong>. Thời hạn thuê tính từ ngày{' '}
              <strong>{contract.startDate}</strong> đến hết ngày <strong>{contract.endDate}</strong>.
            </p>
          </div>

          {/* Article 2 */}
          <div>
            <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
              Điều 2: Giá thuê, tiền cọc và phương thức thanh toán
            </h4>
            <div style={{ fontSize: '13px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                • Giá thuê phòng: <strong>{formatVND(contract.monthlyRent)}/tháng</strong> (Bằng chữ:{' '}
                <em>{formatVND(contract.monthlyRent)} đồng mỗi tháng</em>).
              </div>
              <div>
                • Tiền đặt cọc giữ chỗ & đảm bảo tài sản:{' '}
                <strong style={{ color: '#137333' }}>{formatVND(contract.depositAmount)}</strong>. Tiền cọc sẽ
                được hoàn trả khi Bên B chấm dứt hợp đồng đúng thời hạn và thanh toán xong mọi công nợ.
              </div>
              <div>
                • Tiền điện: <strong>{(room?.electricUnitPrice ?? 3800).toLocaleString('vi-VN')} đ/kWh</strong> theo
                công tơ điện riêng.
              </div>
              <div>
                • Tiền nước: <strong>{(room?.waterUnitPrice ?? 20000).toLocaleString('vi-VN')} đ/m³</strong> theo đồng
                hồ nước riêng của phòng.
              </div>
              <div>
                • Kỳ hạn thanh toán: <strong>{contract.paymentCycle}</strong> (từ ngày 01 đến ngày 05 của mỗi chu kỳ
                thanh toán qua chuyển khoản ngân hàng hoặc tiền mặt).
              </div>
            </div>
          </div>

          {/* Article 3 */}
          <div>
            <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
              Điều 3: Trách nhiệm và quyền hạn của các bên
            </h4>
            <div style={{ fontSize: '13px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>• Bên B có trách nhiệm bảo quản tài sản, thiết bị có sẵn trong phòng; giữ gìn vệ sinh chung và trật tự an ninh.</div>
              <div>• Đăng ký đầy đủ CCCD của tất cả thành viên lưu trú trong phòng theo đúng quy định tạm trú của Nhà nước.</div>
              <div>• Nếu chấm dứt hợp đồng trước hạn, Bên B phải thông báo trước cho Bên A ít nhất 30 ngày.</div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            textAlign: 'center',
            paddingTop: '40px',
            borderTop: '1px solid #E5E7EB',
            marginTop: '20px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>ĐẠI DIỆN BÊN B (BÊN THUÊ)</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ height: '70px' }}></div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{contract.tenantName}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>ĐẠI DIỆN BÊN A (BÊN CHO THUÊ)</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ height: '70px' }}></div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{property?.manager || 'Nguyễn An'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
