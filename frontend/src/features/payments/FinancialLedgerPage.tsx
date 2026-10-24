import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  Wallet,
  PiggyBank,
  Plus,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import {
  mockPayments,
  mockInvoices,
  mockProperties,
  mockExpenses,
  mockDeposits,
  formatVND,
  PaymentItem,
  ExpenseItem,
  DepositItem,
} from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export type FinanceTab = 'payments' | 'expenses' | 'deposits';

interface FinancialLedgerPageProps {
  defaultTab?: FinanceTab;
}

export const FinancialLedgerPage: React.FC<FinancialLedgerPageProps> = ({ defaultTab = 'payments' }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { confirmAction } = useActionModal();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State (sync with URL param ?tab=...)
  const activeTab = (searchParams.get('tab') as FinanceTab) || defaultTab;

  const handleTabChange = (tab: FinanceTab) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, tab });
  };

  // -------------------------------------------------------------
  // TAB 1: THU TIỀN & CÔNG NỢ (PAYMENTS)
  // -------------------------------------------------------------
  const paymentPeriodParam = searchParams.get('period') || 'all';
  const paymentMethodParam = searchParams.get('method') || 'all';
  const paymentSearchParam = searchParams.get('q') || '';

  const [payments, setPayments] = useState<PaymentItem[]>(mockPayments);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedInvoiceKey, setSelectedInvoiceKey] = useState('inv-2');
  const [paymentAmount, setPaymentAmount] = useState('4,900,000');
  const [paymentMethod, setPaymentMethod] = useState<'Chuyển khoản' | 'Tiền mặt' | 'VNPay' | 'MoMo'>('Chuyển khoản');
  const [paymentNote, setPaymentNote] = useState('');

  const availablePaymentPeriods = useMemo(() => {
    const set = new Set<string>();
    mockPayments.forEach((p) => {
      if (p.period) set.add(p.period);
    });
    return Array.from(set);
  }, []);

  const updatePaymentFilters = (updates: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const next = { ...current, ...updates };
    Object.keys(next).forEach((k) => {
      if (next[k] === 'all' || next[k] === '') delete next[k];
    });
    setSearchParams(next);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (paymentPeriodParam !== 'all' && p.period && p.period !== paymentPeriodParam) return false;
      if (paymentMethodParam !== 'all' && p.method !== paymentMethodParam) return false;
      if (paymentSearchParam) {
        const q = paymentSearchParam.toLowerCase();
        const matchCode = p.code.toLowerCase().includes(q);
        const matchRoom = p.roomCode.toLowerCase().includes(q);
        const matchTenant = p.tenantName.toLowerCase().includes(q);
        const matchInv = p.invoiceCode.toLowerCase().includes(q);
        if (!matchCode && !matchRoom && !matchTenant && !matchInv) return false;
      }
      return true;
    });
  }, [payments, paymentPeriodParam, paymentMethodParam, paymentSearchParam]);

  const totalCollectedInView = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

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
        setShowAddPaymentModal(false);
      },
    });
  };

  // -------------------------------------------------------------
  // TAB 2: CHI PHÍ VẬN HÀNH (EXPENSES)
  // -------------------------------------------------------------
  const expensePeriodParam = searchParams.get('period') || 'all';
  const expenseCategoryParam = searchParams.get('category') || 'all';
  const expenseSearchParam = searchParams.get('q') || '';

  const [expenses, setExpenses] = useState<ExpenseItem[]>(mockExpenses);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('1');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseItem['category']>('Sửa chữa điện nước');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmountInput, setExpenseAmountInput] = useState('');

  const availableExpensePeriods = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      const parts = e.date.split('/');
      if (parts.length >= 3) {
        set.add(`Tháng ${parts[1]}/${parts[2]}`);
      }
    });
    return Array.from(set);
  }, [expenses]);

  const updateExpenseFilters = (updates: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const next = { ...current, ...updates };
    Object.keys(next).forEach((k) => {
      if (next[k] === 'all' || next[k] === '') delete next[k];
    });
    setSearchParams(next);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (expensePeriodParam !== 'all') {
        const parts = e.date.split('/');
        const pLabel = `Tháng ${parts[1]}/${parts[2]}`;
        if (pLabel !== expensePeriodParam) return false;
      }
      if (expenseCategoryParam !== 'all' && e.category !== expenseCategoryParam) return false;
      if (expenseSearchParam) {
        const q = expenseSearchParam.toLowerCase();
        const matchDesc = e.description.toLowerCase().includes(q);
        const matchCode = e.code.toLowerCase().includes(q);
        if (!matchDesc && !matchCode) return false;
      }
      return true;
    });
  }, [expenses, expensePeriodParam, expenseCategoryParam, expenseSearchParam]);

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(expenseAmountInput.replace(/\D/g, ''), 10) || 0;
    if (cleanAmount <= 0) {
      toast.error('Số tiền không hợp lệ', 'Vui lòng nhập số tiền chi lớn hơn 0.');
      return;
    }

    const prop = mockProperties.find((p) => p.id === selectedPropertyId) || mockProperties[0];
    const pId = prop ? prop.id : '1';
    const pName = prop ? prop.name : 'Nhà trọ Hưng Phát';
    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      code: `EXP-2403-0${expenses.length + 1}`,
      date: new Date().toLocaleDateString('vi-VN'),
      propertyId: pId,
      propertyName: pName,
      category: expenseCategory,
      description: expenseDescription.trim() || 'Chi phí vận hành',
      amount: cleanAmount,
      status: 'paid',
      payer: 'Nguyễn An (Chủ nhà)',
    };

    setExpenses([newExp, ...expenses]);
    setShowAddExpenseModal(false);
    setExpenseDescription('');
    setExpenseAmountInput('');
    toast.success('Đã ghi nhận chi phí!', `Đã lưu phiếu chi ${formatVND(cleanAmount)} vào sổ chi phí.`);
  };

  // -------------------------------------------------------------
  // TAB 3: TIỀN CỌC & QUYẾT TOÁN (DEPOSITS)
  // -------------------------------------------------------------
  const [deposits, setDeposits] = useState<DepositItem[]>(mockDeposits);
  const [depositStatusFilter, setDepositStatusFilter] = useState<string>('all');
  const [depositSearchTerm, setDepositSearchTerm] = useState<string>('');
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);
  const [newDepositRoom, setNewDepositRoom] = useState('P.102');
  const [newDepositTenant, setNewDepositTenant] = useState('Trần Văn Bình');
  const [newDepositAmount, setNewDepositAmount] = useState('4,500,000');
  const [newDepositContract, setNewDepositContract] = useState('HD-2024-002');

  const getDepositStatusBadge = (status: DepositItem['refundStatus']) => {
    switch (status) {
      case 'holding':
        return <span className="rf-badge rf-badge-active">Đang giữ cọc</span>;
      case 'settlement_pending':
        return <span className="rf-badge rf-badge-warning">Chờ quyết toán</span>;
      case 'refunded':
        return <span className="rf-badge rf-badge-neutral">Đã hoàn trả</span>;
      case 'deducted':
        return <span className="rf-badge rf-badge-danger">Đã cấn trừ</span>;
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    if (depositStatusFilter !== 'all' && d.refundStatus !== depositStatusFilter) return false;
    if (depositSearchTerm) {
      const q = depositSearchTerm.toLowerCase();
      const matchRoom = d.roomCode.toLowerCase().includes(q);
      const matchTenant = d.tenantName.toLowerCase().includes(q);
      const matchContract = d.contractCode.toLowerCase().includes(q);
      if (!matchRoom && !matchTenant && !matchContract) return false;
    }
    return true;
  });

  const totalHolding = deposits
    .filter((d) => d.refundStatus === 'holding')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPending = deposits
    .filter((d) => d.refundStatus === 'settlement_pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalRefunded = deposits
    .filter((d) => d.refundStatus === 'refunded')
    .reduce((sum, d) => sum + (d.refundAmount || d.amount), 0);

  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(newDepositAmount.replace(/\D/g, ''), 10) || 4500000;
    const newDep: DepositItem = {
      id: `dep-${Date.now()}`,
      roomCode: newDepositRoom,
      tenantName: newDepositTenant,
      contractCode: newDepositContract,
      amount: cleanAmount,
      depositDate: new Date().toLocaleDateString('vi-VN'),
      refundStatus: 'holding',
    };
    setDeposits([newDep, ...deposits]);
    setShowAddDepositModal(false);
    toast.success('Thu tiền cọc thành công', `Đã lưu phiếu giữ cọc ${formatVND(cleanAmount)} cho phòng ${newDepositRoom}.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Unified Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Sổ thu chi & Quản lý quỹ
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Theo dõi dòng tiền thu phòng, chi phí vận hành sửa chữa và các khoản ký quỹ cọc tập trung trong một giao diện.
          </p>
        </div>

        {/* Primary Action Button corresponding to active tab */}
        {activeTab === 'payments' && (
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => setShowAddPaymentModal(true)}
          >
            <Plus size={15} />
            <span>Ghi nhận thanh toán mới</span>
          </button>
        )}

        {activeTab === 'expenses' && (
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => setShowAddExpenseModal(true)}
          >
            <Plus size={15} />
            <span>Ghi nhận chi phí mới</span>
          </button>
        )}

        {activeTab === 'deposits' && (
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => setShowAddDepositModal(true)}
          >
            <Plus size={15} />
            <span>Thu tiền cọc mới</span>
          </button>
        )}
      </div>

      {/* Segmented Category Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('payments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '8px',
            border: activeTab === 'payments' ? '1px solid #00594C' : '1px solid transparent',
            backgroundColor: activeTab === 'payments' ? '#00594C' : '#F3F4F6',
            color: activeTab === 'payments' ? '#FFFFFF' : '#374151',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <CreditCard size={16} />
          <span>Thu tiền & Công nợ</span>
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '11px',
              backgroundColor: activeTab === 'payments' ? '#0A362C' : '#E5E7EB',
              color: activeTab === 'payments' ? '#34D399' : '#4B5563',
            }}
          >
            {payments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('expenses')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '8px',
            border: activeTab === 'expenses' ? '1px solid #00594C' : '1px solid transparent',
            backgroundColor: activeTab === 'expenses' ? '#00594C' : '#F3F4F6',
            color: activeTab === 'expenses' ? '#FFFFFF' : '#374151',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Wallet size={16} />
          <span>Chi phí vận hành</span>
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '11px',
              backgroundColor: activeTab === 'expenses' ? '#0A362C' : '#E5E7EB',
              color: activeTab === 'expenses' ? '#34D399' : '#4B5563',
            }}
          >
            {expenses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('deposits')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '8px',
            border: activeTab === 'deposits' ? '1px solid #00594C' : '1px solid transparent',
            backgroundColor: activeTab === 'deposits' ? '#00594C' : '#F3F4F6',
            color: activeTab === 'deposits' ? '#FFFFFF' : '#374151',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <PiggyBank size={16} />
          <span>Tiền cọc & Quyết toán</span>
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '11px',
              backgroundColor: activeTab === 'deposits' ? '#0A362C' : '#E5E7EB',
              color: activeTab === 'deposits' ? '#34D399' : '#4B5563',
            }}
          >
            {deposits.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB CONTENT: PAYMENTS                                     */}
      {/* ========================================================= */}
      {activeTab === 'payments' && (
        <>
          {/* Filter Toolbar */}
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
                  value={paymentPeriodParam}
                  onChange={(e) => updatePaymentFilters({ period: e.target.value })}
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
                  <option value="all">Tất cả các kỳ ({availablePaymentPeriods.length} kỳ)</option>
                  {availablePaymentPeriods.map((p) => (
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
                  value={paymentMethodParam}
                  onChange={(e) => updatePaymentFilters({ method: e.target.value })}
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
                value={paymentSearchParam}
                onChange={(e) => updatePaymentFilters({ q: e.target.value })}
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
                {paymentPeriodParam === 'all' ? 'Toàn bộ lịch sử' : paymentPeriodParam}
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

          {/* Table */}
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
                      <span style={{ fontWeight: 600, color: '#2563EB' }}>{p.invoiceCode}</span>
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
        </>
      )}

      {/* ========================================================= */}
      {/* TAB CONTENT: EXPENSES                                     */}
      {/* ========================================================= */}
      {activeTab === 'expenses' && (
        <>
          {/* Filter Bar */}
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
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Kỳ chi tiêu:</span>
                <select
                  value={expensePeriodParam}
                  onChange={(e) => updateExpenseFilters({ period: e.target.value })}
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
                  <option value="all">Tất cả các tháng ({expenses.length} khoản chi)</option>
                  {availableExpensePeriods.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} color="#6B7280" />
                <span style={{ fontSize: '13px', color: '#374151' }}>Danh mục:</span>
                <select
                  value={expenseCategoryParam}
                  onChange={(e) => updateExpenseFilters({ category: e.target.value })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">Tất cả danh mục chi</option>
                  <option value="Sửa chữa điện nước">Sửa chữa điện nước</option>
                  <option value="Vệ sinh môi trường">Vệ sinh môi trường</option>
                  <option value="Bảo trì thang máy">Bảo trì thang máy</option>
                  <option value="Internet & Truyền hình">Internet & Truyền hình</option>
                </select>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '240px' }}>
              <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Tìm theo nội dung, mã chi..."
                value={expenseSearchParam}
                onChange={(e) => updateExpenseFilters({ q: e.target.value })}
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
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng chi trong kỳ lọc</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626', marginTop: '6px' }}>
                -{formatVND(totalExpense)}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                {filteredExpenses.length} khoản chi hợp lệ
              </div>
            </div>

            <div className="rf-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Kỳ hiển thị</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
                {expensePeriodParam === 'all' ? 'Toàn bộ thời gian' : expensePeriodParam}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                Lịch sử bảo lưu chính xác
              </div>
            </div>

            <div className="rf-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Trạng thái thanh toán</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#16A34A', marginTop: '6px' }}>
                100% Đã thanh toán
              </div>
              <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '4px' }}>
                Có chứng từ / hóa đơn kèm theo
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Mã phiếu chi</th>
                  <th>Ngày chi</th>
                  <th>Cơ sở tòa nhà</th>
                  <th>Danh mục chi</th>
                  <th>Mô tả chi tiết</th>
                  <th>Số tiền</th>
                  <th>Người chi</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    onClick={() => setSelectedExpense(exp)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    title={`Bấm để xem chi tiết phiếu chi ${exp.code}`}
                  >
                    <td>
                      <strong style={{ color: '#00594C' }}>{exp.code} →</strong>
                    </td>
                    <td>{exp.date}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{exp.propertyName}</span>
                    </td>
                    <td>
                      <span className="rf-badge rf-badge-neutral">{exp.category}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#111827' }}>{exp.description}</div>
                      {exp.relatedMaintenanceId && (
                        <span style={{ fontSize: '11px', color: '#2563EB' }}>
                          (Kèm yêu cầu sửa chữa #{exp.relatedMaintenanceId})
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#DC2626' }}>-{formatVND(exp.amount)}</strong>
                    </td>
                    <td style={{ fontSize: '12px', color: '#4B5563' }}>{exp.payer}</td>
                    <td>
                      <span className="rf-badge rf-badge-active">Đã thanh toán</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* TAB CONTENT: DEPOSITS                                     */}
      {/* ========================================================= */}
      {activeTab === 'deposits' && (
        <>
          {/* Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="rf-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng tiền cọc đang nắm giữ</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
                {formatVND(totalHolding)}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                {deposits.filter((d) => d.refundStatus === 'holding').length} hợp đồng đang hiệu lực
              </div>
            </div>

            <div className="rf-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Tiền cọc đang chờ quyết toán</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#B06000', marginTop: '6px' }}>
                {formatVND(totalPending)}
              </div>
              <div style={{ fontSize: '11px', color: '#B06000', marginTop: '4px' }}>
                {deposits.filter((d) => d.refundStatus === 'settlement_pending').length} phòng vừa trả phòng
              </div>
            </div>

            <div className="rf-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Đã hoàn trả trong năm</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
                {formatVND(totalRefunded)}
              </div>
              <div style={{ fontSize: '11px', color: '#137333', marginTop: '4px' }}>
                {deposits.filter((d) => d.refundStatus === 'refunded').length} phiếu hoàn tất không khiếu nại
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            className="rf-card"
            style={{
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'Tất cả trạng thái' },
                { key: 'holding', label: 'Đang giữ cọc' },
                { key: 'settlement_pending', label: 'Chờ quyết toán' },
                { key: 'refunded', label: 'Đã hoàn trả' },
                { key: 'deducted', label: 'Đã cấn trừ' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDepositStatusFilter(item.key)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: depositStatusFilter === item.key ? 600 : 500,
                    backgroundColor: depositStatusFilter === item.key ? '#00594C' : '#F3F4F6',
                    color: depositStatusFilter === item.key ? '#FFFFFF' : '#4B5563',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '280px' }}>
              <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Tìm theo phòng, tên khách, mã HĐ..."
                value={depositSearchTerm}
                onChange={(e) => setDepositSearchTerm(e.target.value)}
                style={{
                  padding: '6px 12px 6px 32px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  width: '100%',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredDeposits.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
                <PiggyBank size={36} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 }}>
                  Không tìm thấy khoản tiền cọc nào
                </h4>
                <p style={{ fontSize: '13px', margin: '6px 0 16px 0' }}>
                  Không có dữ liệu phù hợp với bộ lọc hiện tại.
                </p>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  onClick={() => {
                    setDepositStatusFilter('all');
                    setDepositSearchTerm('');
                  }}
                >
                  Xem tất cả tiền cọc
                </button>
              </div>
            ) : (
              <table className="rf-table">
                <thead>
                  <tr>
                    <th>Mã phiếu / Phòng</th>
                    <th>Mã HĐ liên quan</th>
                    <th>Khách thuê</th>
                    <th>Ngày thu cọc</th>
                    <th>Số tiền cọc</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeposits.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => navigate(`/deposits/${d.id}`)}
                      style={{
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      title={`Bấm để xem chi tiết quyết toán cọc phòng ${d.roomCode}`}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: '#00594C' }}>
                          Phòng {d.roomCode} →
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>Mã cọc #{d.id}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#2563EB' }}>
                          {d.contractCode}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.tenantName}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#6B7280' }}>{d.depositDate}</td>
                      <td style={{ fontWeight: 700, color: '#111827' }}>{formatVND(d.amount)}</td>
                      <td>{getDepositStatusBadge(d.refundStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* 1. Quick Record Payment Modal */}
      <Modal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
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

      {/* 2. Add Expense Modal */}
      <Modal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        title="Ghi nhận khoản chi phí vận hành mới"
      >
        <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '420px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Thuộc cơ sở tòa nhà:
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
            >
              {mockProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Danh mục chi phí:
            </label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value as any)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
            >
              <option value="Sửa chữa điện nước">Sửa chữa điện nước</option>
              <option value="Vệ sinh môi trường">Vệ sinh môi trường</option>
              <option value="Bảo trì thang máy">Bảo trì thang máy</option>
              <option value="Internet & Truyền hình">Internet & Truyền hình</option>
              <option value="An ninh & PCCC">An ninh & PCCC</option>
              <option value="Khác">Khoản chi khác</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Số tiền chi (VNĐ):
            </label>
            <input
              type="text"
              placeholder="VD: 350000"
              value={expenseAmountInput}
              onChange={(e) => setExpenseAmountInput(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Nội dung chi tiết:
            </label>
            <textarea
              rows={3}
              placeholder="Ghi rõ nội dung và người nhận..."
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowAddExpenseModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Lưu phiếu chi
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Expense Detail Modal */}
      <Modal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        title={`Chi tiết phiếu chi ${selectedExpense?.code || ''}`}
      >
        {selectedExpense && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '400px' }}>
            <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#991B1B' }}>Tổng số tiền chi ra</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626', marginTop: '4px' }}>
                -{formatVND(selectedExpense.amount)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div style={{ padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>MÃ PHIẾU CHI</span>
                <strong>{selectedExpense.code}</strong>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>NGÀY CHI TIỀN</span>
                <strong>{selectedExpense.date}</strong>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>CƠ SỞ TÒA NHÀ</span>
                <strong>{selectedExpense.propertyName}</strong>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>DANH MỤC</span>
                <strong>{selectedExpense.category}</strong>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>NGƯỜI CHI / QUẢN LÝ</span>
                <strong>{selectedExpense.payer}</strong>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>TRẠNG THÁI</span>
                <span className="rf-badge rf-badge-active">Đã thanh toán</span>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px', fontSize: '13px' }}>
              <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>NỘI DUNG CHI TIẾT</span>
              <p style={{ margin: 0, color: '#111827', lineHeight: 1.5 }}>{selectedExpense.description}</p>
            </div>

            {selectedExpense.relatedMaintenanceId && (
              <div style={{ padding: '10px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '6px', fontSize: '13px', color: '#1E40AF' }}>
                Liên kết tới yêu cầu bảo trì: <strong>#{selectedExpense.relatedMaintenanceId}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => setSelectedExpense(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 4. Add Deposit Modal */}
      <Modal
        isOpen={showAddDepositModal}
        onClose={() => setShowAddDepositModal(false)}
        title="Ghi nhận phiếu thu tiền đặt cọc mới"
      >
        <form onSubmit={handleAddDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '420px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Hợp đồng / Phòng:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                placeholder="Số phòng (VD: P.102)"
                value={newDepositRoom}
                onChange={(e) => setNewDepositRoom(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                required
              />
              <input
                type="text"
                placeholder="Mã hợp đồng"
                value={newDepositContract}
                onChange={(e) => setNewDepositContract(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Họ và tên khách thuê:
            </label>
            <input
              type="text"
              placeholder="VD: Trần Văn Bình"
              value={newDepositTenant}
              onChange={(e) => setNewDepositTenant(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Số tiền cọc thu giữ (VNĐ):
            </label>
            <input
              type="text"
              value={newDepositAmount}
              onChange={(e) => setNewDepositAmount(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', fontWeight: 600 }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowAddDepositModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              <CheckCircle2 size={14} />
              <span>Lưu phiếu giữ cọc</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
