import React, { useState } from 'react';
import { Plus, CheckCircle2, Search } from 'lucide-react';
import { mockPayments, formatVND, PaymentItem } from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';

export const PaymentsPage: React.FC = () => {
  const { confirmAction } = useActionModal();
  const [payments, setPayments] = useState<PaymentItem[]>(mockPayments);
  const [selectedInvoiceKey, setSelectedInvoiceKey] = useState('inv-2');
  const [paymentAmount, setPaymentAmount] = useState('4,900,000');
  const [paymentMethod, setPaymentMethod] = useState<'Chuyển khoản' | 'Tiền mặt' | 'VNPay' | 'MoMo'>('Chuyển khoản');
  const [paymentNote, setPaymentNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(paymentAmount.replace(/\D/g, ''), 10) || 4900000;
    const roomCode = selectedInvoiceKey === 'inv-2' ? 'P.201' : selectedInvoiceKey === 'inv-3' ? 'P.301' : 'P.302';
    const tenantName = selectedInvoiceKey === 'inv-2' ? 'Nguyễn Văn Đạt' : selectedInvoiceKey === 'inv-3' ? 'Võ Thanh Tùng' : 'Bùi Lan Anh';

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
          invoiceCode: selectedInvoiceKey === 'inv-2' ? 'INV-2403-02' : selectedInvoiceKey === 'inv-3' ? 'INV-2403-03' : 'INV-2403-04',
          roomCode,
          tenantName,
          amount: cleanAmount,
          method: paymentMethod,
          date: new Date().toLocaleDateString('vi-VN'),
          recordedBy: 'Chủ nhà',
          note: paymentNote || 'Gạch nợ đối soát',
        };
        setPayments([newPayment, ...payments]);
        setPaymentNote('');
      },
    });
  };

  const filteredPayments = payments.filter((p) =>
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Thanh toán & Quản lý công nợ
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Theo dõi dòng tiền vào, lịch sử thanh toán hóa đơn và quản lý công nợ người thuê
          </p>
        </div>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => {
            const formElem = document.getElementById('payment-record-form');
            formElem?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Plus size={15} />
          <span>Ghi nhận thanh toán</span>
        </button>
      </div>

      {/* Debt Aging Analysis Bar (Screen 5.png) */}
      <div className="rf-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
              Phân tích tuổi nợ (Debt Aging)
            </h3>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>
              Tổng công nợ chưa thu: <strong style={{ color: '#C5221F' }}>{formatVND(14920000)}</strong>
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#00594C', fontWeight: 500 }}>3 phòng đang còn nợ</span>
        </div>

        {/* Visual aging bar */}
        <div style={{ display: 'flex', height: '14px', borderRadius: '6px', overflow: 'hidden', gap: '2px', backgroundColor: '#F3F4F6' }}>
          <div style={{ width: '40%', backgroundColor: '#FEF7E0' }} title="Quá hạn 1-7 ngày: 4.900.000đ" />
          <div style={{ width: '35%', backgroundColor: '#FCE8E6' }} title="Quá hạn 8-15 ngày: 4.520.000đ" />
          <div style={{ width: '25%', backgroundColor: '#FEE2E2' }} title="Quá hạn > 15 ngày: 5.500.000đ" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#FEF7E0' }} />
            1 - 7 ngày: 4.900.000đ (P.201)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#FCE8E6' }} />
            8 - 15 ngày: 4.520.000đ (P.301)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#FEE2E2' }} />
            &gt; 15 ngày: 5.500.000đ (P.302)
          </span>
        </div>
      </div>

      {/* 2-Column: Transaction list & Quick Record Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Transaction History Table */}
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Tìm mã thanh toán, tên khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '5px 10px 5px 30px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  width: '240px',
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Tổng thu tuần này: <strong style={{ color: '#137333' }}>{formatVND(13780000)}</strong>
            </div>
          </div>

          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Mã giao dịch</th>
                  <th>Phòng / Khách thanh toán</th>
                  <th>Hóa đơn gạch nợ</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Thời gian ghi nhận</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: '#00594C' }}>{p.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.roomCode}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{p.tenantName}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#4B5563' }}>{p.invoiceCode || 'INV-2403-02'}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#137333', fontSize: '14px' }}>
                      +{formatVND(p.amount)}
                    </td>
                    <td>
                      <span className="rf-badge rf-badge-neutral">{p.method}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{p.date}</div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Bởi {p.recordedBy || 'Chủ nhà'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ghi nhận thanh toán Form Card */}
        <form id="payment-record-form" onSubmit={handleRecordPayment} className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Ghi nhận thanh toán nhanh
            </h3>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0 0' }}>
              Xác nhận tiền về và tự động gạch nợ hóa đơn tương ứng
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                Chọn hóa đơn cần gạch nợ *
              </label>
              <select
                value={selectedInvoiceKey}
                onChange={(e) => setSelectedInvoiceKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="inv-2">INV-2403-02 - P.201 - Nguyễn Văn Đạt (Còn nợ: 4.900.000đ)</option>
                <option value="inv-3">INV-2403-03 - P.301 - Võ Thanh Tùng (Còn nợ: 4.520.000đ)</option>
                <option value="inv-4">INV-2403-04 - P.302 - Bùi Lan Anh (Còn nợ: 5.530.000đ)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                Số tiền thực nhận (VNĐ) *
              </label>
              <input
                type="text"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#137333',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                Phương thức thanh toán *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {(['Chuyển khoản', 'Tiền mặt', 'VNPay', 'MoMo'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      padding: '7px',
                      borderRadius: '5px',
                      border: paymentMethod === m ? '1px solid #00594C' : '1px solid #E5E7EB',
                      backgroundColor: paymentMethod === m ? '#E6F0EE' : '#FFFFFF',
                      color: paymentMethod === m ? '#00594C' : '#374151',
                      fontSize: '11px',
                      fontWeight: paymentMethod === m ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                Ghi chú nội dung chuyển tiền
              </label>
              <textarea
                rows={2}
                placeholder="VD: Khách ck qua Techcombank số đuôi ...98"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  resize: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
            <button type="submit" className="rf-btn rf-btn-primary" style={{ width: '100%' }}>
              <CheckCircle2 size={15} />
              Xác nhận & Gạch nợ hóa đơn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
