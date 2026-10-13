import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Zap,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { formatVND, mockMeterReadings, MeterReadingItem } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { Modal } from '@/components/ui/Modal';

export const TenantUtilitiesPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const periodParam = searchParams.get('period') || 'all';

  const userRoomCode = user?.roomCode || 'P.101';
  const tenantReadings = useMemo(() => {
    return mockMeterReadings.filter((m) => m.roomCode === userRoomCode);
  }, [userRoomCode]);

  // Available periods for this tenant
  const availablePeriods = useMemo(() => {
    const map = new Map<string, string>();
    tenantReadings.forEach((r) => {
      const key = r.periodKey || (r.period?.includes('03/2024') ? '2024-03' : r.period?.includes('02/2024') ? '2024-02' : r.period?.includes('01/2024') ? '2024-01' : '2023-12');
      if (!map.has(key)) map.set(key, r.period || key);
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [tenantReadings]);

  const updateFilters = (updates: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const next = { ...current, ...updates };
    Object.keys(next).forEach((k) => {
      if (next[k] === 'all' || next[k] === '') delete next[k];
    });
    setSearchParams(next);
  };

  const filteredReadings = useMemo(() => {
    return tenantReadings.filter((r) => {
      if (periodParam !== 'all') {
        const key = r.periodKey || (r.period?.includes('03/2024') ? '2024-03' : r.period?.includes('02/2024') ? '2024-02' : r.period?.includes('01/2024') ? '2024-01' : '2023-12');
        if (key !== periodParam) return false;
      }
      return true;
    });
  }, [tenantReadings, periodParam]);

  const [selectedReading, setSelectedReading] = useState<MeterReadingItem>(
    filteredReadings[0] || tenantReadings[0] || mockMeterReadings[0]!
  );

  React.useEffect(() => {
    if (filteredReadings.length > 0) {
      if (!filteredReadings.some((r) => r.id === selectedReading.id)) {
        setSelectedReading(filteredReadings[0]!);
      }
    }
  }, [filteredReadings, selectedReading.id]);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'electric' | 'water'>('electric');
  const [claimedReading, setClaimedReading] = useState('');
  const [reportNote, setReportNote] = useState('');

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReportModal(false);
    toast.success(
      'Đã gửi báo cáo sai lệch chỉ số!',
      `Chủ nhà đã nhận được phản ánh chỉ số ${reportType === 'electric' ? 'Điện' : 'Nước'} kỳ ${selectedReading.period}. Nhân viên sẽ đến kiểm tra công tơ.`
    );
    setClaimedReading('');
    setReportNote('');
  };

  const electricUsed = Math.max(0, selectedReading.currElectric - selectedReading.prevElectric);
  const waterUsed = Math.max(0, selectedReading.currWater - selectedReading.prevWater);
  const electricCost = electricUsed * selectedReading.electricUnitPrice;
  const waterCost = waterUsed * selectedReading.waterUnitPrice;
  const totalCost = electricCost + waterCost;

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
              Lịch sử Điện & Nước
            </h2>
            <span className="rf-badge rf-badge-active">
              Phòng {userRoomCode}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Tra cứu toàn bộ lịch sử chỉ số công tơ điện và đồng hồ nước qua các tháng, đối soát minh bạch
          </p>
        </div>

        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => setShowReportModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <AlertTriangle size={15} color="#D97706" />
          <span>Báo chỉ số bất thường</span>
        </button>
      </div>

      {/* Period Selector Bar */}
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
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Chọn kỳ tra cứu:</span>
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
            <option value="all">Tất cả các tháng ({tenantReadings.length} kỳ)</option>
            {availablePeriods.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '12px', color: '#6B7280' }}>
          Đơn giá chuẩn: Điện 3.800 đ/kWh • Nước 20.000 đ/m³
        </span>
      </div>

      {/* Grid: Reading History Table on Left, Period Detail Breakdown on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Left Column: History Table */}
        <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Bảng tra cứu các kỳ chốt số
            </h3>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>
              Bấm vào từng kỳ để xem chi tiết
            </span>
          </div>

          <table className="rf-table">
            <thead>
              <tr>
                <th>Kỳ ghi nhận</th>
                <th>Điện (Cũ - Mới)</th>
                <th>Tiêu thụ Điện</th>
                <th>Nước (Cũ - Mới)</th>
                <th>Tiêu thụ Nước</th>
                <th>Tổng dịch vụ</th>
                <th>Trang riêng</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.map((r) => {
                const isSelected = r.id === selectedReading.id;
                const eUsed = Math.max(0, r.currElectric - r.prevElectric);
                const wUsed = Math.max(0, r.currWater - r.prevWater);
                const cost = eUsed * r.electricUnitPrice + wUsed * r.waterUnitPrice;

                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedReading(r)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#F0FDF4' : 'transparent',
                    }}
                  >
                    <td>
                      <strong style={{ color: isSelected ? '#00594C' : '#111827' }}>
                        {r.period}
                      </strong>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Chốt ngày {r.updatedAt}</div>
                    </td>
                    <td>{r.prevElectric} - {r.currElectric}</td>
                    <td>
                      <strong style={{ color: '#D97706' }}>{eUsed} kWh</strong>
                    </td>
                    <td>{r.prevWater} - {r.currWater}</td>
                    <td>
                      <strong style={{ color: '#2563EB' }}>{wUsed} m³</strong>
                    </td>
                    <td style={{ fontWeight: 600, color: '#00594C' }}>
                      {formatVND(cost)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="rf-btn rf-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tenant/utilities/${r.id}`);
                        }}
                      >
                        Chi tiết <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column: Detailed Breakdown for Selected Period */}
        <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>CHI TIẾT ĐIỆN NƯỚC</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>
              {selectedReading.period}
            </h3>
            <span style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <CheckCircle2 size={14} /> Chốt chỉ số hợp lệ ngày {selectedReading.updatedAt}
            </span>
          </div>

          {/* Electric Box */}
          <div style={{ padding: '14px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#D97706" />
                <strong style={{ fontSize: '14px', color: '#92400E' }}>Công tơ Điện</strong>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#B45309' }}>
                {formatVND(electricCost)}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#78350F', marginTop: '6px', lineHeight: 1.5 }}>
              <div>• Chỉ số: {selectedReading.prevElectric} kWh → {selectedReading.currElectric} kWh</div>
              <div>• Tiêu thụ: <strong>{electricUsed} kWh</strong> x {selectedReading.electricUnitPrice.toLocaleString('vi-VN')} đ/kWh</div>
            </div>
          </div>

          {/* Water Box */}
          <div style={{ padding: '14px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Droplets size={16} color="#2563EB" />
                <strong style={{ fontSize: '14px', color: '#1E40AF' }}>Đồng hồ Nước</strong>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8' }}>
                {formatVND(waterCost)}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#1E3A8A', marginTop: '6px', lineHeight: 1.5 }}>
              <div>• Chỉ số: {selectedReading.prevWater} m³ → {selectedReading.currWater} m³</div>
              <div>• Tiêu thụ: <strong>{waterUsed} m³</strong> x {selectedReading.waterUnitPrice.toLocaleString('vi-VN')} đ/m³</div>
            </div>
          </div>

          {/* Total Cost */}
          <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Tổng tiền Điện & Nước:</span>
            <strong style={{ fontSize: '18px', color: '#00594C' }}>
              {formatVND(totalCost)}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              style={{ flex: 1, fontSize: '12px' }}
              onClick={() => navigate(`/tenant/utilities/${selectedReading.id}`)}
            >
              <Eye size={13} /> Mở trang chi tiết kỳ này
            </button>
          </div>
        </div>
      </div>

      {/* Discrepancy Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Báo cáo sai lệch chỉ số Điện / Nước"
      >
        <form onSubmit={handleSendReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '420px' }}>
          <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5 }}>
            Nếu bạn nhận thấy số công tơ trên thông báo không trùng khớp với đồng hồ thực tế tại phòng, hãy gửi phản ánh để chủ nhà đối soát lại.
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Loại chỉ số cần kiểm tra lại:
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="reportType"
                  value="electric"
                  checked={reportType === 'electric'}
                  onChange={() => setReportType('electric')}
                />
                Công tơ Điện (Hiện tại ghi: {selectedReading.currElectric} kWh)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="reportType"
                  value="water"
                  checked={reportType === 'water'}
                  onChange={() => setReportType('water')}
                />
                Đồng hồ Nước (Hiện tại ghi: {selectedReading.currWater} m³)
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Chỉ số bạn nhìn thấy thực tế:
            </label>
            <input
              type="number"
              placeholder="VD: 1320"
              value={claimedReading}
              onChange={(e) => setClaimedReading(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Ghi chú thêm:
            </label>
            <textarea
              rows={3}
              placeholder="Ghi chú thêm về giờ kiểm tra hoặc đính kèm ảnh công tơ..."
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowReportModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Gửi phản ánh tới chủ nhà
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
