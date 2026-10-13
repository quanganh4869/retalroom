import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Filter,
  Search,
} from 'lucide-react';
import { mockProperties, formatVND, ExpenseItem, mockExpenses } from '@/lib/mockData';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const ExpensesPage: React.FC = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const periodParam = searchParams.get('period') || 'all';
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('q') || '';

  const [expenses, setExpenses] = useState<ExpenseItem[]>(mockExpenses);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('1');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseItem['category']>('Sửa chữa điện nước');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Available unique periods
  const availablePeriods = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      // date formatted DD/MM/YYYY -> "MM/YYYY"
      const parts = e.date.split('/');
      if (parts.length >= 3) {
        set.add(`Tháng ${parts[1]}/${parts[2]}`);
      }
    });
    return Array.from(set);
  }, [expenses]);

  const updateFilters = (updates: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const next = { ...current, ...updates };
    Object.keys(next).forEach((k) => {
      if (next[k] === 'all' || next[k] === '') delete next[k];
    });
    setSearchParams(next);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (periodParam !== 'all') {
        const parts = e.date.split('/');
        const pLabel = `Tháng ${parts[1]}/${parts[2]}`;
        if (pLabel !== periodParam) return false;
      }
      if (categoryParam !== 'all' && e.category !== categoryParam) {
        return false;
      }
      if (searchParam) {
        const q = searchParam.toLowerCase();
        const matchDesc = e.description.toLowerCase().includes(q);
        const matchCode = e.code.toLowerCase().includes(q);
        if (!matchDesc && !matchCode) return false;
      }
      return true;
    });
  }, [expenses, periodParam, categoryParam, searchParam]);

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
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
      description: description.trim() || 'Chi phí vận hành',
      amount: cleanAmount,
      status: 'paid',
      payer: 'Nguyễn An (Chủ nhà)',
    };

    setExpenses([newExp, ...expenses]);
    setShowAddModal(false);
    setDescription('');
    setAmount('');
    toast.success('Đã ghi nhận chi phí!', `Đã lưu phiếu chi ${formatVND(cleanAmount)} vào sổ chi phí.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý Chi phí & Chi tiêu Vận hành
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Theo dõi dòng tiền chi ra cho sửa chữa, dịch vụ, vệ sinh và bảo dưỡng theo từng tháng
          </p>
        </div>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={15} />
          <span>Ghi nhận chi phí mới</span>
        </button>
      </div>

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
              <option value="all">Tất cả các tháng ({expenses.length} khoản chi)</option>
              {availablePeriods.map((p) => (
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
              value={categoryParam}
              onChange={(e) => updateFilters({ category: e.target.value })}
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
            {periodParam === 'all' ? 'Toàn bộ thời gian' : periodParam}
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

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowAddModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Lưu phiếu chi
            </button>
          </div>
        </form>
      </Modal>

      {/* Expense Detail Modal */}
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
    </div>
  );
};
