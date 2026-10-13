import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Printer,
  Download,
} from 'lucide-react';
import { mockDeposits, mockContracts, formatVND, DepositItem } from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';

export const DepositDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { confirmAction } = useActionModal();

  const foundDeposit = mockDeposits.find((d) => d.id === id);
  const initialDeposit = foundDeposit || mockDeposits[0]!;
  const [deposit, setDeposit] = useState<DepositItem>(initialDeposit);

  const contract = mockContracts.find((c) => c.id === deposit.contractCode);

  const getStatusBadge = (status: DepositItem['refundStatus']) => {
    switch (status) {
      case 'holding':
        return <span className="rf-badge rf-badge-active">ĐANG GIỮ CỌC</span>;
      case 'settlement_pending':
        return <span className="rf-badge rf-badge-warning">CHỜ QUYẾT TOÁN</span>;
      case 'refunded':
        return <span className="rf-badge rf-badge-neutral">ĐÃ HOÀN TRẢ</span>;
      case 'deducted':
        return <span className="rf-badge rf-badge-danger">ĐÃ CẤN TRỪ</span>;
    }
  };

  const deductionUtilities = 250000;
  const deductionCleaning = 100000;
  const deductionDamages = 0;
  const totalDeductions = deductionUtilities + deductionCleaning + deductionDamages;
  const finalRefundAmount = deposit.refundAmount || deposit.amount - totalDeductions;

  const handleConfirmRefund = () => {
    confirmAction({
      title: `Quyết toán & Hoàn cọc phòng ${deposit.roomCode}`,
      description: `Xác nhận hoàn trả số tiền cọc thực nhận ${formatVND(finalRefundAmount)} (sau khi đã trừ ${formatVND(totalDeductions)} chi phí điện nước và vệ sinh) cho khách thuê ${deposit.tenantName}.`,
      confirmText: 'Xác nhận hoàn cọc',
      successTitle: 'Quyết toán cọc thành công!',
      successMessage: `Đã hoàn trả ${formatVND(finalRefundAmount)} cho khách thuê ${deposit.tenantName} (${deposit.roomCode}).`,
      simulateDelayMs: 900,
      onSuccess: () => {
        setDeposit({
          ...deposit,
          refundStatus: 'refunded',
          refundAmount: finalRefundAmount,
        });
      },
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => window.print()}
        >
          <Printer size={14} /> In biên bản quyết toán
        </button>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => {
            confirmAction({
              title: 'Xuất biên bản thanh lý cọc (PDF)',
              description: `Kết xuất tài liệu PDF biên bản hoàn cọc và đối chiếu công nợ của phòng ${deposit.roomCode}.`,
              confirmText: 'Tải PDF ngay',
              successTitle: 'Đã xuất biên bản thanh lý!',
              successMessage: `Tệp "BienBan_HoanCoc_${deposit.roomCode}.pdf" đã được tạo thành công.`,
              simulateDelayMs: 650,
            });
          }}
        >
          <Download size={14} /> Xuất PDF
        </button>
        {deposit.refundStatus !== 'refunded' && (
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={handleConfirmRefund}
          >
            <CheckCircle2 size={14} /> Xác nhận hoàn cọc
          </button>
        )}
      </div>

      {/* Main Document Card */}
      <div
        className="rf-card"
        style={{
          padding: '36px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {getStatusBadge(deposit.refundStatus)}
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Mã phiếu: #{deposit.id}</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
              Phiếu Quản lý Tiền cọc & Quyết toán — {deposit.roomCode}
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Khách thuê đại diện: <strong style={{ color: '#111827' }}>{deposit.tenantName}</strong> • Ngày thu cọc: <strong>{deposit.depositDate}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>HỢP ĐỒNG LIÊN QUAN</span>
            <div style={{ marginTop: '4px' }}>
              <Link
                to={`/contracts/${deposit.contractCode}`}
                style={{ fontSize: '16px', fontWeight: 700, color: '#00594C', textDecoration: 'none' }}
              >
                {deposit.contractCode} →
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ padding: '16px 20px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Tiền cọc ban đầu</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
              {formatVND(deposit.amount)}
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Đã thu đủ khi ký HĐ</div>
          </div>

          <div style={{ padding: '16px 20px', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
            <div style={{ fontSize: '12px', color: '#991B1B' }}>Tổng khấu trừ trả phòng</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#DC2626', marginTop: '6px' }}>
              -{formatVND(totalDeductions)}
            </div>
            <div style={{ fontSize: '11px', color: '#991B1B', marginTop: '4px' }}>Điện nước & vệ sinh</div>
          </div>

          <div style={{ padding: '16px 20px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '12px', color: '#166534' }}>Số tiền thực hoàn trả</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#14532D', marginTop: '6px' }}>
              {formatVND(finalRefundAmount)}
            </div>
            <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>
              {deposit.refundStatus === 'refunded' ? '✓ Đã chuyển trả khách' : 'Chờ chuyển khoản'}
            </div>
          </div>
        </div>

        {/* Itemized Settlement Breakdown Table */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
            Bảng kê chi tiết cấn trừ khi bàn giao phòng
          </h3>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Khoản mục đối soát</th>
                  <th>Căn cứ tính toán</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>1. Tiền điện nước chưa thanh toán</strong>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Chỉ số phát sinh từ kỳ chốt gần nhất đến khi dọn đi</div>
                  </td>
                  <td style={{ fontSize: '12px', color: '#4B5563' }}>Công tơ chốt ngày bàn giao</td>
                  <td>
                    <span className="rf-badge rf-badge-warning">Khấu trừ</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>
                    -{formatVND(deductionUtilities)}
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>2. Phí vệ sinh hoàn trả mặt bằng</strong>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Chi phí dọn dẹp phòng sau khi khách trả phòng</div>
                  </td>
                  <td style={{ fontSize: '12px', color: '#4B5563' }}>Theo quy chế hợp đồng</td>
                  <td>
                    <span className="rf-badge rf-badge-warning">Khấu trừ</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>
                    -{formatVND(deductionCleaning)}
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>3. Hư hao trang thiết bị / nội thất</strong>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Kiểm tra tài sản theo biên bản bàn giao đầu vào</div>
                  </td>
                  <td style={{ fontSize: '12px', color: '#4B5563' }}>Nghiệm thu đạt 100%</td>
                  <td>
                    <span className="rf-badge rf-badge-active">Không phát sinh</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#6B7280' }}>
                    0 đ
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#F9FAFB', fontWeight: 700 }}>
                  <td colSpan={3} style={{ textAlign: 'right', padding: '12px 16px' }}>
                    TỔNG TIỀN THỰC NHẬN HOÀN TRẢ KHÁCH:
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '16px', color: '#137333', padding: '12px 16px' }}>
                    {formatVND(finalRefundAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Related Information Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: '#111827' }}>
              Hồ sơ hợp đồng & Phòng
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#4B5563' }}>
              <div>• Phòng: <strong>{deposit.roomCode}</strong> (Tòa nhà Hưng Phát)</div>
              <div>• Hợp đồng: <strong>{deposit.contractCode}</strong></div>
              <div>• Tiền thuê tháng: <strong>{formatVND(contract?.monthlyRent || 4500000)}</strong></div>
              <div style={{ marginTop: '6px' }}>
                <Link to={`/contracts/${deposit.contractCode}`} style={{ color: '#00594C', fontWeight: 600, textDecoration: 'none' }}>
                  Xem hợp đồng thuê liên quan →
                </Link>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: '#111827' }}>
              Thông tin nhận tiền hoàn cọc của khách
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#4B5563' }}>
              <div>• Chủ tài khoản: <strong>{deposit.tenantName}</strong></div>
              <div>• Ngân hàng: <strong>Vietcombank (VCB)</strong></div>
              <div>• Số tài khoản: <strong>0071 0012 94821</strong></div>
              <div>• Trạng thái: {deposit.refundStatus === 'refunded' ? <strong style={{ color: '#137333' }}>Đã chuyển khoản thành công</strong> : <span style={{ color: '#D97706' }}>Chờ thực hiện chuyển khoản</span>}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
