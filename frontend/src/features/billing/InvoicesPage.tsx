import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Download,
  AlertTriangle,
  ChevronRight,
  Send,
  Printer,
  FileText,
} from 'lucide-react';
import { mockInvoices, formatVND, InvoiceItem } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { useActionModal } from '@/components/ui/ActionModal';

export const InvoicesPage: React.FC = () => {
  const toast = useToast();
  const { confirmAction } = useActionModal();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [invoices] = useState<InvoiceItem[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(mockInvoices[1] ?? null);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams]);

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    if (newStatus === 'all') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), status: newStatus });
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  const getStatusBadge = (status: InvoiceItem['status']) => {
    switch (status) {
      case 'paid':
        return <span className="rf-badge rf-badge-active">Đã thanh toán</span>;
      case 'partial':
        return <span className="rf-badge rf-badge-warning">Thanh toán 1 phần</span>;
      case 'pending':
        return <span className="rf-badge rf-badge-neutral">Chờ thanh toán</span>;
      case 'overdue':
        return <span className="rf-badge rf-badge-danger">Quá hạn</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 4-Step Wizard Progress Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#E6F4EA', color: '#137333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>1. Chốt chỉ số điện nước</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>24/24 phòng đã ghi</div>
            </div>
          </div>
          <ChevronRight size={16} color="#D1D5DB" />

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#00594C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
              2
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#00594C' }}>2. Tính toán & phát hành</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Đang duyệt kỳ Tháng 03/2024</div>
            </div>
          </div>
          <ChevronRight size={16} color="#D1D5DB" />

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
              3
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>3. Gửi thông báo khách</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>SMS / Zalo / Email</div>
            </div>
          </div>
          <ChevronRight size={16} color="#D1D5DB" />

          {/* Step 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
              4
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>4. Thu tiền & gạch nợ</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Đối soát thanh toán</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="rf-btn rf-btn-primary"
          style={{ fontSize: '12px' }}
          onClick={() => {
            confirmAction({
              title: 'Gửi hóa đơn hàng loạt',
              description: 'Hệ thống sẽ gửi thông báo tiền phòng qua Zalo ZNS và SMS cho toàn bộ 24 phòng đã chốt sổ kỳ này.',
              confirmText: 'Bắt đầu gửi',
              successTitle: 'Gửi thông báo thành công!',
              successMessage: 'Đã gửi thành công 24 thông báo hóa đơn đến người thuê qua Zalo và SMS.',
              simulateDelayMs: 900,
            });
          }}
        >
          <span>Gửi thông báo hàng loạt (24)</span>
        </button>
      </div>

      {/* Warning Alert Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#FCE8E6',
          border: '1px solid #F5C6CB',
          borderRadius: '8px',
          padding: '12px 18px',
        }}
      >
        <AlertTriangle size={18} color="#C5221F" />
        <div style={{ fontSize: '13px', color: '#C5221F', flex: 1 }}>
          <strong>Cảnh báo nợ quá hạn:</strong> Có <strong>1 hóa đơn</strong> quá hạn 6 ngày (P.201 - Nguyễn Văn Đạt: 4.900.000đ). Cần gửi thông báo nhắc nợ đợt 2.
        </div>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          style={{ backgroundColor: '#FFFFFF', fontSize: '11px', borderColor: '#C5221F', color: '#C5221F' }}
          onClick={() => {
            confirmAction({
              title: 'Gửi nhắc nợ khẩn cấp đợt 2',
              description: 'Gửi SMS và Zalo yêu cầu người thuê Nguyễn Văn Đạt (P.201) thanh toán số tiền quá hạn 4.900.000đ trước 17:00 ngày mai.',
              confirmText: 'Gửi ngay',
              confirmVariant: 'danger',
              successTitle: 'Đã gửi SMS nhắc nợ!',
              successMessage: 'Thông điệp nhắc nợ đợt 2 đã được chuyển đến số 0933445566 thành công.',
              simulateDelayMs: 800,
            });
          }}
        >
          Gửi SMS nhắc nợ ngay
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng số tiền lập kỳ này</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {formatVND(23750000)}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>4 hóa đơn mẫu</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đã thu hoàn tất</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#137333', marginTop: '6px' }}>
            {formatVND(8830000)}
          </div>
          <div style={{ fontSize: '11px', color: '#137333', marginTop: '4px' }}>1 hóa đơn đủ, 1 phần</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Chưa thanh toán / Nợ</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#C5221F', marginTop: '6px' }}>
            {formatVND(14920000)}
          </div>
          <div style={{ fontSize: '11px', color: '#C5221F', marginTop: '4px' }}>2 hóa đơn chờ / quá hạn</div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Kỳ thu hóa đơn</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            Tháng 03/2024
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Hạn đóng: 05/03/2024</div>
        </div>
      </div>

      {/* Main Grid: Invoice List & Preview Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px' }}>
        {/* Invoice List Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['all', 'paid', 'partial', 'pending', 'overdue'] as const).map((tab) => {
                const labelMap = {
                  all: 'Tất cả',
                  paid: 'Đã thanh toán',
                  partial: 'Thanh toán 1 phần',
                  pending: 'Chờ thanh toán',
                  overdue: 'Quá hạn',
                };
                return (
                  <button
                    key={tab}
                    onClick={() => handleStatusFilterChange(tab)}
                    style={{
                      padding: '5px 10px',
                      fontSize: '12px',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: statusFilter === tab ? 600 : 400,
                      backgroundColor: statusFilter === tab ? '#00594C' : 'transparent',
                      color: statusFilter === tab ? '#FFFFFF' : '#4B5563',
                    }}
                  >
                    {labelMap[tab]}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              style={{ padding: '5px 10px', fontSize: '11px' }}
              onClick={() => {
                confirmAction({
                  title: 'Xuất tệp PDF hóa đơn hàng loạt',
                  description: 'Hệ thống sẽ kết xuất file ZIP chứa toàn bộ hóa đơn tiền phòng kỳ này dưới dạng tệp PDF khổ in A4.',
                  confirmText: 'Bắt đầu xuất',
                  successTitle: 'Xuất tệp PDF thành công!',
                  successMessage: 'Tệp nén "HoaDon_Ky03_2024.zip" (gồm 24 phiếu thu PDF) đã sẵn sàng lưu về máy.',
                  simulateDelayMs: 1000,
                });
              }}
            >
              <Download size={13} />
              Xuất PDF hàng loạt
            </button>
          </div>

          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Phòng / Khách thuê</th>
                  <th>Kỳ thu</th>
                  <th>Tổng tiền</th>
                  <th>Đã trả</th>
                  <th>Còn nợ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedInvoice?.id === inv.id ? '#F0FDF4' : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 600, color: '#00594C' }}>{inv.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.roomCode}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{inv.tenantName}</div>
                    </td>
                    <td>{inv.period}</td>
                    <td style={{ fontWeight: 700 }}>{formatVND(inv.totalAmount)}</td>
                    <td style={{ color: '#137333', fontWeight: 500 }}>{formatVND(inv.paidAmount)}</td>
                    <td style={{ color: inv.debtAmount > 0 ? '#C5221F' : '#6B7280', fontWeight: 600 }}>
                      {formatVND(inv.debtAmount)}
                    </td>
                    <td>{getStatusBadge(inv.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Detail Preview */}
        {selectedInvoice && (
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>CHI TIẾT HÓA ĐƠN</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>
                  {selectedInvoice.code}
                </h3>
              </div>
              {getStatusBadge(selectedInvoice.status)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '6px' }}>
              <div>
                <span style={{ color: '#6B7280' }}>Phòng:</span>
                <div style={{ fontWeight: 600 }}>{selectedInvoice.roomCode}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Khách thuê:</span>
                <div style={{ fontWeight: 600 }}>{selectedInvoice.tenantName}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Kỳ thu:</span>
                <div style={{ fontWeight: 500 }}>{selectedInvoice.period}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Hạn thanh toán:</span>
                <div style={{ fontWeight: 500, color: '#C5221F' }}>{selectedInvoice.dueDate}</div>
              </div>
            </div>

            {/* Breakdown table */}
            <div style={{ fontSize: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: '#111827' }}>Các khoản tính tiền:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#4B5563' }}>Tiền thuê phòng:</span>
                  <span style={{ fontWeight: 500 }}>{formatVND(selectedInvoice.roomFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#4B5563' }}>Tiền điện (chỉ số thực tế):</span>
                  <span style={{ fontWeight: 500 }}>{formatVND(selectedInvoice.electricFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#4B5563' }}>Tiền nước:</span>
                  <span style={{ fontWeight: 500 }}>{formatVND(selectedInvoice.waterFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#4B5563' }}>Phí quản lý & rác:</span>
                  <span style={{ fontWeight: 500 }}>{formatVND(selectedInvoice.serviceFee)}</span>
                </div>
              </div>

              {/* Total & Remaining */}
              <div style={{ borderTop: '2px solid #E5E7EB', marginTop: '12px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                  <span>Tổng cộng:</span>
                  <span style={{ color: '#111827' }}>{formatVND(selectedInvoice.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px', color: '#137333' }}>
                  <span>Đã thanh toán:</span>
                  <span>{formatVND(selectedInvoice.paidAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginTop: '4px', color: '#C5221F' }}>
                  <span>Còn nợ:</span>
                  <span>{formatVND(selectedInvoice.debtAmount)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={() => {
                  confirmAction({
                    title: `Gửi phiếu thu ${selectedInvoice.code}`,
                    description: `Gửi thông báo hóa đơn tiền phòng kỳ ${selectedInvoice.period} đến khách thuê ${selectedInvoice.tenantName} qua Zalo ZNS và SMS.`,
                    confirmText: 'Gửi ngay',
                    successTitle: 'Đã gửi hóa đơn ZNS thành công!',
                    successMessage: `Khách thuê ${selectedInvoice.tenantName} đã nhận được liên kết thanh toán và chi tiết hóa đơn.`,
                    simulateDelayMs: 700,
                  });
                }}
              >
                <Send size={14} />
                Gửi hóa đơn qua Zalo / SMS
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ flex: 1, fontSize: '12px' }}
                  onClick={() => navigate(`/invoices/${selectedInvoice.id}`)}
                >
                  <FileText size={13} color="#00594C" /> Xem trang chi tiết
                </button>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ flex: 1, fontSize: '12px' }}
                  onClick={() => {
                    toast.info('Đang chuẩn bị bản in', `Mở hộp thoại in phiếu thu ${selectedInvoice.code}`);
                    window.print();
                  }}
                >
                  <Printer size={13} /> In phiếu thu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
