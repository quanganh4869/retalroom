import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformTransaction } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminTransactionsPage: React.FC = () => {
  const { transactions } = usePlatformAdmin();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState<PlatformTransaction | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.gatewayRef.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || tx.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalSuccessfulRevenue = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amountVnd, 0);

  const handleExport = () => {
    toast.success('Xuất file thành công', `Đã xuất ${filteredTransactions.length} giao dịch đối soát sang file Excel.`);
  };

  const getStatusBadge = (status: PlatformTransaction['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="rf-badge rf-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={11} /> Thành công
          </span>
        );
      case 'PENDING':
        return (
          <span className="rf-badge rf-badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={11} /> Đang đối soát
          </span>
        );
      case 'FAILED':
        return (
          <span className="rf-badge rf-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={11} /> Thất bại
          </span>
        );
      default:
        return <span className="rf-badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-danger">THƯƠNG MẠI & TÀI CHÍNH SAAS</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Phân biệt riêng với Tiền phòng của Chủ nhà</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 2px 0' }}>
            Giao dịch thanh toán nền tảng (Platform Transactions)
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Quản lý dòng tiền thanh toán gói thuê bao phần mềm SaaS RentFlow, đối soát mã IPN ngân hàng và cổng thanh toán VNPay/MoMo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="rf-btn rf-btn-secondary" onClick={handleExport}>
            <Download size={13} /> Xuất Báo cáo Thuế
          </button>
        </div>
      </div>

      {/* KPI Revenue Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Doanh thu gói thực thu</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#00594C', marginTop: '6px' }}>
            {totalSuccessfulRevenue.toLocaleString('vi-VN')} đ
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>Khớp đối soát 100%</span>
        </div>

        <div className="rf-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Cổng thanh toán VNPay</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '6px' }}>
            2 giao dịch
          </div>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Tỷ trọng 67%</span>
        </div>

        <div className="rf-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Chuyển khoản trực tiếp</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '6px' }}>
            5,990,000 đ
          </div>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Gói Enterprise năm</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rf-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo mã giao dịch (vd: TXN-SaaS...), tên tổ chức hoặc mã cổng..."
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
            <option value="ALL">Mọi trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="PENDING">Chờ đối soát</option>
            <option value="FAILED">Thất bại</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">Mọi phương thức</option>
            <option value="VNPAY">VNPay QR</option>
            <option value="BANK_TRANSFER">Chuyển khoản</option>
            <option value="MOMO">Ví MoMo</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="rf-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Mã giao dịch</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Tổ chức khách hàng</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Gói thuê bao</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Số tiền (VND)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Phương thức & Gateway Ref</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4B5563', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#00594C' }}>
                    {tx.code}
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>{tx.createdAt}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{tx.organizationName}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {tx.organizationId}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#374151' }}>
                    {tx.planName}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#111827' }}>
                    {tx.amountVnd.toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="rf-badge" style={{ fontSize: '11px' }}>{tx.paymentMethod}</span>
                    <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace', marginTop: '2px' }}>
                      Ref: {tx.gatewayRef}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{getStatusBadge(tx.status)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="rf-btn rf-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => setSelectedTx(tx)}
                    >
                      <Eye size={12} /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Chi tiết giao dịch SaaS: ${selectedTx.code}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Tổ chức:</span>
                <div style={{ fontWeight: 600 }}>{selectedTx.organizationName}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Gói dịch vụ:</span>
                <div style={{ fontWeight: 600 }}>{selectedTx.planName}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Số tiền thanh toán:</span>
                <div style={{ fontWeight: 700, color: '#00594C', fontSize: '15px' }}>
                  {selectedTx.amountVnd.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Trạng thái:</span>
                <div style={{ marginTop: '2px' }}>{getStatusBadge(selectedTx.status)}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Mã tham chiếu Gateway:</span>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedTx.gatewayRef}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Thời điểm tạo:</span>
                <div>{selectedTx.createdAt}</div>
              </div>
            </div>

            {selectedTx.notes && (
              <div style={{ padding: '10px 12px', backgroundColor: '#EFF6FF', borderRadius: '6px', color: '#1E40AF', fontSize: '12px' }}>
                <strong>Ghi chú giao dịch:</strong> {selectedTx.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setSelectedTx(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
