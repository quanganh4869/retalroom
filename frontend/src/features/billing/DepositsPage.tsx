import React, { useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { mockDeposits, formatVND, DepositItem } from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';

export const DepositsPage: React.FC = () => {
  const { confirmAction } = useActionModal();
  const [deposits, setDeposits] = useState<DepositItem[]>(mockDeposits);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositItem | null>(mockDeposits[4] ?? null);

  const getStatusBadge = (status: DepositItem['refundStatus']) => {
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

  const handleConfirmRefund = () => {
    if (!selectedDeposit) return;
    const finalAmount = selectedDeposit.refundAmount || selectedDeposit.amount - 350000;
    confirmAction({
      title: 'Quyết toán & Hoàn tiền cọc',
      description: `Xác nhận hoàn trả số tiền cọc thực nhận ${formatVND(finalAmount)} (sau khi đã trừ các chi phí điện nước và vệ sinh) cho khách thuê ${selectedDeposit.tenantName} (${selectedDeposit.roomCode}).`,
      confirmText: 'Xác nhận hoàn cọc',
      successTitle: 'Quyết toán cọc thành công!',
      successMessage: `Đã hoàn trả ${formatVND(finalAmount)} và cập nhật hồ sơ bàn giao phòng ${selectedDeposit.roomCode}.`,
      simulateDelayMs: 900,
      onSuccess: () => {
        setDeposits((prev) =>
          prev.map((d) => (d.id === selectedDeposit.id ? { ...d, refundStatus: 'refunded', refundAmount: finalAmount } : d))
        );
        setSelectedDeposit((prev) => prev ? { ...prev, refundStatus: 'refunded', refundAmount: finalAmount } : null);
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý Tiền đặt cọc & Quyết toán
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Theo dõi khoản cọc đang giữ, lập phiếu cấn trừ hư hỏng và hoàn cọc khi khách trả phòng
          </p>
        </div>
        <button className="rf-btn rf-btn-primary">
          <Plus size={15} />
          <span>Thu tiền cọc mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="rf-card">
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng tiền cọc đang nắm giữ</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            {formatVND(27900000)}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>4 hợp đồng đang thuê</div>
        </div>

        <div className="rf-card">
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tiền cọc đang chờ quyết toán</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#B06000', marginTop: '6px' }}>
            {formatVND(4200000)}
          </div>
          <div style={{ fontSize: '11px', color: '#B06000', marginTop: '4px' }}>1 phòng vừa trả phòng</div>
        </div>

        <div className="rf-card">
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đã hoàn trả trong năm</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {formatVND(16500000)}
          </div>
          <div style={{ fontSize: '11px', color: '#137333', marginTop: '4px' }}>Không có khiếu nại</div>
        </div>
      </div>

      {/* Main Grid: Deposits table & Settlement Drawer (Screen 13.png) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px' }}>
        {/* Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Mã HĐ / Phòng</th>
                  <th>Khách thuê</th>
                  <th>Ngày thu cọc</th>
                  <th>Số tiền cọc</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDeposit(d)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedDeposit?.id === d.id ? '#F0FDF4' : undefined,
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: '#00594C' }}>{d.roomCode}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{d.contractCode}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{d.tenantName}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#6B7280' }}>{d.depositDate}</td>
                    <td style={{ fontWeight: 700, color: '#111827' }}>{formatVND(d.amount)}</td>
                    <td>{getStatusBadge(d.refundStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Settlement Calculation Drawer (Phiếu quyết toán cọc) */}
        {selectedDeposit && (
          <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>PHIẾU QUYẾT TOÁN CỌC</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>
                  {selectedDeposit.roomCode} - {selectedDeposit.tenantName}
                </h3>
              </div>
              {getStatusBadge(selectedDeposit.refundStatus)}
            </div>

            <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '6px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Mã hợp đồng:</span>
                <span style={{ fontWeight: 600 }}>{selectedDeposit.contractCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Tiền cọc ban đầu:</span>
                <strong style={{ color: '#111827' }}>{formatVND(selectedDeposit.amount)}</strong>
              </div>
            </div>

            {/* Deductions table */}
            <div style={{ fontSize: '12px' }}>
              <div style={{ fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                Các khoản cấn trừ khi trả phòng:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#4B5563' }}>Tiền điện nước chưa thanh toán:</span>
                  <span style={{ color: '#C5221F', fontWeight: 500 }}>- 250.000 đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#4B5563' }}>Phí vệ sinh hoàn trả phòng:</span>
                  <span style={{ color: '#C5221F', fontWeight: 500 }}>- 100.000 đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                  <span style={{ color: '#4B5563' }}>Hư hao trang thiết bị:</span>
                  <span style={{ color: '#6B7280' }}>0 đ</span>
                </div>
              </div>

              {/* Net refund amount */}
              <div style={{ borderTop: '2px solid #E5E7EB', marginTop: '12px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                  <span>Số tiền thực tế hoàn trả:</span>
                  <span style={{ color: '#137333', fontSize: '16px' }}>
                    {formatVND(selectedDeposit.refundAmount || selectedDeposit.amount - 350000)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={handleConfirmRefund}
              >
                <CheckCircle2 size={14} />
                Xác nhận hoàn cọc cho người thuê
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ width: '100%', fontSize: '12px' }}
                onClick={() => {
                  confirmAction({
                    title: 'Xuất biên bản thanh lý cọc',
                    description: `Kết xuất tài liệu PDF biên bản hoàn cọc và đối chiếu công nợ của phòng ${selectedDeposit.roomCode}.`,
                    confirmText: 'Tải PDF ngay',
                    successTitle: 'Đã xuất biên bản thanh lý!',
                    successMessage: `Tệp "BienBan_HoanCoc_${selectedDeposit.roomCode}.pdf" đã được tạo thành công.`,
                    simulateDelayMs: 650,
                  });
                }}
              >
                Xuất biên bản thanh lý cọc (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
