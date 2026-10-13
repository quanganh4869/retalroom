import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  Download,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockPayments, mockInvoices, formatVND } from '@/lib/mockData';

export const TenantPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const userRoomCode = user?.roomCode || 'P.101';
  const periodParam = searchParams.get('period') || 'all';

  // Tenant authorized payments
  const tenantPayments = useMemo(() => {
    return mockPayments.filter((p) => p.roomCode === userRoomCode);
  }, [userRoomCode]);

  const availablePeriods = useMemo(() => {
    const set = new Set<string>();
    tenantPayments.forEach((p) => {
      if (p.period) set.add(p.period);
    });
    return Array.from(set);
  }, [tenantPayments]);

  const filteredPayments = useMemo(() => {
    return tenantPayments.filter((p) => {
      if (periodParam !== 'all' && p.period && p.period !== periodParam) {
        return false;
      }
      return true;
    });
  }, [tenantPayments, periodParam]);

  const totalPaid = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div
        className="rf-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Lịch sử Thanh toán & Giao dịch
            </h2>
            <span className="rf-badge rf-badge-active">
              Phòng {userRoomCode}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Toàn bộ các giao dịch chuyển khoản VietQR, tiền mặt đã được đối soát thành công
          </p>
        </div>

        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => window.print()}
        >
          <Download size={15} />
          <span>In lịch sử giao dịch</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#00594C" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Kỳ thanh toán:</span>
          <select
            value={periodParam}
            onChange={(e) => {
              if (e.target.value === 'all') {
                searchParams.delete('period');
                setSearchParams(searchParams);
              } else {
                setSearchParams({ period: e.target.value });
              }
            }}
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
            <option value="all">Tất cả các tháng ({tenantPayments.length} giao dịch)</option>
            {availablePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '13px', color: '#15803D', fontWeight: 600 }}>
          Tổng tiền đã nộp: {formatVND(totalPaid)}
        </span>
      </div>

      {/* Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="rf-table">
          <thead>
            <tr>
              <th>Mã giao dịch</th>
              <th>Thời gian nộp</th>
              <th>Hóa đơn thanh toán</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Người xác nhận</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => {
              const matchedInv = mockInvoices.find((i) => i.code === p.invoiceCode);
              return (
                <tr key={p.id}>
                  <td>
                    <strong style={{ color: '#00594C' }}>{p.code}</strong>
                  </td>
                  <td style={{ fontSize: '12px', color: '#6B7280' }}>{p.date}</td>
                  <td>
                    {matchedInv ? (
                      <Link
                        to={`/tenant/invoices/${matchedInv.id}`}
                        style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {p.invoiceCode} ({p.period}) →
                      </Link>
                    ) : (
                      <span>{p.invoiceCode}</span>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: '#15803D', fontSize: '14px' }}>
                      +{formatVND(p.amount)}
                    </strong>
                  </td>
                  <td>
                    <span className="rf-badge rf-badge-active">{p.method}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#4B5563' }}>{p.recordedBy}</td>
                  <td style={{ fontSize: '12px', color: '#6B7280' }}>{p.note || 'Thanh toán tiền phòng'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
