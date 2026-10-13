import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Download,
  ChevronRight,
  Send,
  Printer,
  FileText,
  Search,
  Calendar,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { mockInvoices, mockProperties, formatVND, InvoiceItem } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { useActionModal } from '@/components/ui/ActionModal';

export const InvoicesPage: React.FC = () => {
  const toast = useToast();
  const { confirmAction } = useActionModal();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query Parameters
  const periodParam = searchParams.get('period') || 'all';
  const propertyParam = searchParams.get('propertyId') || 'all';
  const statusParam = searchParams.get('status') || 'all';
  const searchParam = searchParams.get('q') || '';

  const [invoices] = useState<InvoiceItem[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  // Available unique periods sorted descending
  const availablePeriods = useMemo(() => {
    const map = new Map<string, string>();
    mockInvoices.forEach((inv) => {
      const key = inv.periodKey || '2024-03';
      if (!map.has(key)) {
        map.set(key, inv.period);
      }
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, []);

  // Update query params helper
  const updateFilters = (updates: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const next = { ...current, ...updates };
    Object.keys(next).forEach((k) => {
      if (next[k] === 'all' || next[k] === '') {
        delete next[k];
      }
    });
    setSearchParams(next);
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Period filter
      if (periodParam !== 'all') {
        const invPeriodKey = inv.periodKey || (inv.period.includes('03/2024') ? '2024-03' : inv.period.includes('02/2024') ? '2024-02' : inv.period.includes('01/2024') ? '2024-01' : '2023-12');
        if (invPeriodKey !== periodParam) return false;
      }
      // Property filter
      if (propertyParam !== 'all' && inv.propertyId && inv.propertyId !== propertyParam) {
        return false;
      }
      // Status filter
      if (statusParam !== 'all' && inv.status !== statusParam) {
        return false;
      }
      // Search term
      if (searchParam) {
        const q = searchParam.toLowerCase();
        const matchCode = inv.code.toLowerCase().includes(q);
        const matchRoom = inv.roomCode.toLowerCase().includes(q);
        const matchTenant = inv.tenantName.toLowerCase().includes(q);
        if (!matchCode && !matchRoom && !matchTenant) return false;
      }
      return true;
    });
  }, [invoices, periodParam, propertyParam, statusParam, searchParam]);

  // Set default selected preview invoice
  useEffect(() => {
    if (filteredInvoices.length > 0) {
      if (!selectedInvoice || !filteredInvoices.find((i) => i.id === selectedInvoice.id)) {
        setSelectedInvoice(filteredInvoices[0] || null);
      }
    } else {
      setSelectedInvoice(null);
    }
  }, [filteredInvoices, selectedInvoice]);

  // Period metrics
  const totalBilled = filteredInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalDebt = filteredInvoices.reduce((sum, i) => sum + i.debtAmount, 0);

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
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Đầy đủ các kỳ lịch sử</div>
            </div>
          </div>
          <ChevronRight size={16} color="#D1D5DB" />

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#00594C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
              2
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#00594C' }}>2. Lịch sử hóa đơn hàng tháng</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                {periodParam === 'all' ? 'Tất cả các kỳ' : availablePeriods.find((p) => p.key === periodParam)?.label || periodParam}
              </div>
            </div>
          </div>
          <ChevronRight size={16} color="#D1D5DB" />

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
              3
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#9CA3AF' }}>3. Thu tiền & Quyết toán</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Gạch nợ VietQR tự động</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => navigate('/meter-readings')}
        >
          <Calendar size={14} />
          <span>Ghi chỉ số & Tạo kỳ mới</span>
        </button>
      </div>

      {/* Filter Toolbar: Month/Year Period, Property, Search, Status */}
      <div
        className="rf-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Left: Period & Property Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="#00594C" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Kỳ thu:</span>
              <select
                value={periodParam}
                onChange={(e) => updateFilters({ period: e.target.value })}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#111827',
                  backgroundColor: '#F9FAFB',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Tất cả các tháng (Lịch sử đầy đủ)</option>
                {availablePeriods.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="#6B7280" />
              <span style={{ fontSize: '13px', color: '#374151' }}>Nhà trọ:</span>
              <select
                value={propertyParam}
                onChange={(e) => updateFilters({ propertyId: e.target.value })}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  color: '#111827',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Tất cả tòa nhà ({mockProperties.length})</option>
                {mockProperties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '260px' }}>
            <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
            <input
              type="text"
              placeholder="Tìm mã hóa đơn, phòng, tên khách..."
              value={searchParam}
              onChange={(e) => updateFilters({ q: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['all', 'paid', 'partial', 'pending', 'overdue'] as const).map((tab) => {
              const labelMap = {
                all: 'Tất cả hóa đơn',
                paid: 'Đã thanh toán',
                partial: 'Thanh toán 1 phần',
                pending: 'Chờ thanh toán',
                overdue: 'Quá hạn nợ',
              };
              const active = statusParam === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => updateFilters({ status: tab })}
                  style={{
                    padding: '5px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 500,
                    backgroundColor: active ? '#00594C' : '#F3F4F6',
                    color: active ? '#FFFFFF' : '#4B5563',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {labelMap[tab]}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              style={{ padding: '5px 10px', fontSize: '12px' }}
              onClick={() => {
                confirmAction({
                  title: 'Xuất tệp PDF hóa đơn hàng loạt',
                  description: `Hệ thống sẽ kết xuất tệp PDF cho ${filteredInvoices.length} hóa đơn đang được lọc.`,
                  confirmText: 'Bắt đầu xuất',
                  successTitle: 'Xuất tệp PDF thành công!',
                  successMessage: `Đã kết xuất ${filteredInvoices.length} phiếu thu PDF.`,
                  simulateDelayMs: 800,
                });
              }}
            >
              <Download size={13} />
              <span>Xuất PDF ({filteredInvoices.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards for Filtered Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng số tiền lập</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {formatVND(totalBilled)}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            {filteredInvoices.length} phiếu thu
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đã thu thực tế</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#137333', marginTop: '6px' }}>
            {formatVND(totalCollected)}
          </div>
          <div style={{ fontSize: '11px', color: '#137333', marginTop: '4px' }}>
            {filteredInvoices.filter((i) => i.status === 'paid').length} hóa đơn đã xong
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Công nợ chưa thu</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: totalDebt > 0 ? '#C5221F' : '#6B7280', marginTop: '6px' }}>
            {formatVND(totalDebt)}
          </div>
          <div style={{ fontSize: '11px', color: totalDebt > 0 ? '#C5221F' : '#6B7280', marginTop: '4px' }}>
            {filteredInvoices.filter((i) => i.debtAmount > 0).length} hóa đơn còn nợ
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Kỳ hiển thị</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            {periodParam === 'all' ? 'Tất cả lịch sử' : availablePeriods.find((p) => p.key === periodParam)?.label || periodParam}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            {periodParam === 'all' ? `${availablePeriods.length} kỳ chốt` : 'Đang lọc theo kỳ'}
          </div>
        </div>
      </div>

      {/* Main Grid: Invoice List & Preview Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px' }}>
        {/* Invoice List Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredInvoices.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
                <FileText size={36} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 }}>
                  Không tìm thấy hóa đơn nào
                </h4>
                <p style={{ fontSize: '13px', margin: '6px 0 16px 0' }}>
                  Không có hóa đơn nào phù hợp với bộ lọc kỳ hoặc tìm kiếm hiện tại.
                </p>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  onClick={() => setSearchParams({})}
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
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
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const isSelected = selectedInvoice?.id === inv.id;
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#F0FDF4' : undefined,
                        }}
                      >
                        <td style={{ fontWeight: 600, color: '#00594C' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {inv.code}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{inv.roomCode}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>{inv.tenantName}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>
                            {inv.period}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{formatVND(inv.totalAmount)}</td>
                        <td style={{ color: '#137333', fontWeight: 500 }}>{formatVND(inv.paidAmount)}</td>
                        <td style={{ color: inv.debtAmount > 0 ? '#C5221F' : '#6B7280', fontWeight: 600 }}>
                          {formatVND(inv.debtAmount)}
                        </td>
                        <td>{getStatusBadge(inv.status)}</td>
                        <td>
                          <button
                            type="button"
                            className="rf-btn rf-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/invoices/${inv.id}`);
                            }}
                            title="Xem trang chi tiết hóa đơn"
                          >
                            Chi tiết <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Invoice Detail Preview Drawer */}
        {selectedInvoice ? (
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
                <span style={{ color: '#6B7280' }}>Kỳ hóa đơn:</span>
                <div style={{ fontWeight: 600, color: '#00594C' }}>{selectedInvoice.period}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Hạn thanh toán:</span>
                <div style={{ fontWeight: 600 }}>{selectedInvoice.dueDate}</div>
              </div>
            </div>

            {/* Line items summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Tiền thuê phòng:</span>
                <span>{formatVND(selectedInvoice.roomFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Tiền điện sinh hoạt:</span>
                <span>{formatVND(selectedInvoice.electricFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Tiền nước sinh hoạt:</span>
                <span>{formatVND(selectedInvoice.waterFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Phí dịch vụ & wifi:</span>
                <span>{formatVND(selectedInvoice.serviceFee)}</span>
              </div>

              <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '8px', marginTop: '4px' }}>
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
                onClick={() => navigate(`/invoices/${selectedInvoice.id}`)}
              >
                <FileText size={14} />
                <span>Mở trang chi tiết hóa đơn (Dedicated Page)</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  style={{ flex: 1, fontSize: '12px' }}
                  onClick={() => {
                    confirmAction({
                      title: `Gửi phiếu thu ${selectedInvoice.code}`,
                      description: `Gửi thông báo hóa đơn kỳ ${selectedInvoice.period} tới ${selectedInvoice.tenantName} qua Zalo & SMS.`,
                      confirmText: 'Gửi ngay',
                      successTitle: 'Đã gửi hóa đơn!',
                      successMessage: `Khách thuê ${selectedInvoice.tenantName} đã nhận được liên kết thanh toán.`,
                      simulateDelayMs: 600,
                    });
                  }}
                >
                  <Send size={13} /> Gửi Zalo/SMS
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
        ) : (
          <div className="rf-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#9CA3AF', fontSize: '13px' }}>
            Chọn một hóa đơn từ danh sách để xem nhanh
          </div>
        )}
      </div>
    </div>
  );
};
