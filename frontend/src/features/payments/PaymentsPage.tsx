import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  CheckCircle2,
  Search,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { mockPayments, mockInvoices, formatVND, PaymentItem } from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';
import { Modal } from '@/components/ui/Modal';

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { confirmAction } = useActionModal();
  const [searchParams, setSearchParams] = useSearchParams();

  const periodParam = searchParams.get('period') || 'all';
  const methodParam = searchParams.get('method') || 'all';
  const searchParam = searchParams.get('q') || '';

  const [payments, setPayments] = useState<PaymentItem[]>(mockPayments);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoiceKey, setSelectedInvoiceKey] = useState('inv-2');
  const [paymentAmount, setPaymentAmount] = useState('4,900,000');
  const [paymentMethod, setPaymentMethod] = useState<'Chuyển khoản' | 'Tiền mặt' | 'VNPay' | 'MoMo'>('Chuyển khoản');
  const [paymentNote, setPaymentNote] = useState('');

  // Available unique periods
  const availablePeriods = useMemo(() => {
    const set = new Set<string>();
    mockPayments.forEach((p) => {
      if (p.period) set.add(p.period);
    });
    return Array.from(set);
  }, []);

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

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (periodParam !== 'all' && p.period && p.period !== periodParam) {
        return false;
      }
      if (methodParam !== 'all' && p.method !== methodParam) {
        return false;
      }
      if (searchParam) {
        const q = searchParam.toLowerCase();
        const matchCode = p.code.toLowerCase().includes(q);
        const matchRoom = p.roomCode.toLowerCase().includes(q);
        const matchTenant = p.tenantName.toLowerCase().includes(q);
        const matchInv = p.invoiceCode.toLowerCase().includes(q);
        if (!matchCode && !matchRoom && !matchTenant && !matchInv) return false;
      }
      return true;
    });
  }, [payments, periodParam, methodParam, searchParam]);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(paymentAmount.replace(/\D/g, ''), 10) || 4900000;
    const inv = mockInvoices.find((i) => i.id === selectedInvoiceKey) || mockInvoices[0];
    const roomCode = inv ? inv.roomCode : 'P.101';
    const tenantName = inv ? inv.tenantName : 'Lê Hoàng Nam';

    confirmAction({
      title: 'Xác nhận gạch nợ thanh toán',
      description: `Ghi nhận số tiền thanh toán ${formatVND(cleanAmount)} qua hình thức ${paymentMethod} cho phòng ${roomCode} (${tenantName}). Hệ thống sẽ khấu trừ công nợ ngay lập tức.`,
      confirmText: 'Xác nhận gạch nợ',
      successTitle: 'Gạch nợ thành công!',
      successMessage: `Đã thu ${formatVND(cleanAmount)} cho phòng ${roomCode}. Hóa đơn liên quan đã được cập nhật số tiền đã thanh toán.`,
      simulateDelayMs: 800,
      onSuccess: () => {
        const newPayment: PaymentItem = {
          id: `pay-${Date.now()}`,
          code: `PAY-2403-0${payments.length + 1}`,
          invoiceCode: inv ? inv.code : 'INV-2403-001',
          roomCode,
          propertyId: (inv && inv.propertyId) || '1',
          propertyName: (inv && inv.propertyName) || 'Nhà trọ Hưng Phát',
          tenantName,
          amount: cleanAmount,
          method: paymentMethod,
          date: new Date().toLocaleDateString('vi-VN') + ' 10:00',
          period: (inv && inv.period) || 'Tháng 03/2024',
          status: 'confirmed',
          recordedBy: 'Nguyễn An (Chủ nhà)',
          note: paymentNote || 'Gạch nợ đối soát',
        };
        setPayments([newPayment, ...payments]);
        setPaymentNote('');
        setShowAddModal(false);
      },
    });
  };

  const totalCollectedInView = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Lịch sử Giao dịch & Thanh toán
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Theo dõi dòng tiền thu, lịch sử gạch nợ theo từng kỳ tháng và tra cứu giao dịch chi tiết. Bấm vào từng hàng để mở trang chi tiết giao dịch.
          </p>
        </div>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={15} />
          <span>Ghi nhận thanh toán mới</span>
        </button>
      </div>

      {/* Filter Toolbar: Month, Method, Search */}
      <div
        className="rf-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
                cursor: 'pointer',
              }}
            >
              <option value="all">Tất cả các kỳ ({availablePeriods.length} kỳ)</option>
              {availablePeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={16} color="#6B7280" />
            <span style={{ fontSize: '13px', color: '#374151' }}>Phương thức:</span>
            <select
              value={methodParam}
              onChange={(e) => updateFilters({ method: e.target.value })}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="all">Tất cả phương thức</option>
              <option value="Chuyển khoản">Chuyển khoản VietQR</option>
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="VNPay">VNPay</option>
              <option value="MoMo">Ví MoMo</option>
            </select>
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '240px' }}>
          <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Tìm mã GD, mã HĐ, tên khách..."
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

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng thu trong bộ lọc</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#137333', marginTop: '6px' }}>
            {formatVND(totalCollectedInView)}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            {filteredPayments.length} giao dịch đã hoàn tất
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Kỳ giao dịch</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            {periodParam === 'all' ? 'Toàn bộ lịch sử' : periodParam}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Dữ liệu ghi sổ tiền vào tài khoản
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Hình thức chủ đạo</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E40AF', marginTop: '6px' }}>
            VietQR / Chuyển khoản (85%)
          </div>
          <div style={{ fontSize: '11px', color: '#1E40AF', marginTop: '4px' }}>
            Tự động gạch nợ thông minh
          </div>
        </div>
      </div>

      {/* Full Width Table of Payments */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="rf-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Hóa đơn / Kỳ</th>
              <th>Phòng & Khách</th>
              <th>Số tiền thu</th>
              <th>Phương thức</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/landlord/payments/${p.id}`)}
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                title={`Bấm để xem chi tiết phiếu thu ${p.code}`}
              >
                <td>
                  <strong style={{ color: '#00594C' }}>{p.code} →</strong>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#2563EB' }}>
                    {p.invoiceCode}
                  </span>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{p.period || 'Tháng 03/2024'}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.roomCode}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{p.tenantName}</div>
                </td>
                <td>
                  <strong style={{ color: '#137333' }}>{formatVND(p.amount)}</strong>
                </td>
                <td>
                  <span className="rf-badge rf-badge-active">{p.method}</span>
                </td>
                <td style={{ fontSize: '12px', color: '#6B7280' }}>{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Record Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ghi nhận phiếu thu tiền mặt / ngoài hệ thống"
      >
        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '420px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Hóa đơn cần gạch nợ:
            </label>
            <select
              value={selectedInvoiceKey}
              onChange={(e) => setSelectedInvoiceKey(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
            >
              {mockInvoices.filter((i) => i.status !== 'paid').map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.code} — {inv.roomCode} ({inv.tenantName}) — Nợ {formatVND(inv.debtAmount)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Số tiền thực thu (VNĐ):
            </label>
            <input
              type="text"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', fontWeight: 600 }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Phương thức nhận tiền:
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
            >
              <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
              <option value="Tiền mặt">Tiền mặt tại nhà</option>
              <option value="VNPay">VNPay QR</option>
              <option value="MoMo">Ví MoMo</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Ghi chú đối soát:
            </label>
            <input
              type="text"
              placeholder="VD: Thu tiền mặt tại quầy lễ tân"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
            />
          </div>

          <button type="submit" className="rf-btn rf-btn-primary" style={{ marginTop: '8px' }}>
            <CheckCircle2 size={14} />
            <span>Xác nhận gạch nợ & Hoàn tất</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
