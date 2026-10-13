import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Calendar,
  Building2,
  Search,
} from 'lucide-react';
import { mockMeterReadings, mockProperties, formatVND, MeterReadingItem } from '@/lib/mockData';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const MeterReadingsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const periodParam = searchParams.get('period') || '2024-03';
  const propertyParam = searchParams.get('propertyId') || 'all';
  const searchParam = searchParams.get('q') || '';

  const [allReadings, setAllReadings] = useState<MeterReadingItem[]>(mockMeterReadings);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Utility Rates Settings Modal
  const [showRateModal, setShowRateModal] = useState<boolean>(false);
  const [globalElectricRate, setGlobalElectricRate] = useState<number>(3800);
  const [globalWaterRate, setGlobalWaterRate] = useState<number>(20000);

  // Available unique periods
  const availablePeriods = useMemo(() => {
    const map = new Map<string, string>();
    mockMeterReadings.forEach((r) => {
      const key = r.periodKey || (r.period?.includes('03/2024') ? '2024-03' : r.period?.includes('02/2024') ? '2024-02' : r.period?.includes('01/2024') ? '2024-01' : '2023-12');
      if (!map.has(key)) {
        map.set(key, r.period || key);
      }
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => b.key.localeCompare(a.key));
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

  // Filtered readings for active period & property
  const filteredReadings = useMemo(() => {
    return allReadings.filter((r) => {
      if (periodParam !== 'all') {
        const key = r.periodKey || (r.period?.includes('03/2024') ? '2024-03' : r.period?.includes('02/2024') ? '2024-02' : r.period?.includes('01/2024') ? '2024-01' : '2023-12');
        if (key !== periodParam) return false;
      }
      if (propertyParam !== 'all' && r.propertyId && r.propertyId !== propertyParam) {
        return false;
      }
      if (searchParam) {
        const q = searchParam.toLowerCase();
        const matchRoom = r.roomCode.toLowerCase().includes(q);
        const matchTenant = r.tenantName.toLowerCase().includes(q);
        if (!matchRoom && !matchTenant) return false;
      }
      return true;
    });
  }, [allReadings, periodParam, propertyParam, searchParam]);

  const handleReadingChange = (
    id: string,
    field: 'currElectric' | 'currWater',
    value: number
  ) => {
    setAllReadings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleApplyGlobalRates = (e: React.FormEvent) => {
    e.preventDefault();
    setAllReadings((prev) =>
      prev.map((item) => ({
        ...item,
        electricUnitPrice: globalElectricRate,
        waterUnitPrice: globalWaterRate,
      }))
    );
    setShowRateModal(false);
    toast.success(
      'Đã cập nhật giá điện nước!',
      `Áp dụng: Điện ${globalElectricRate.toLocaleString('vi-VN')} đ/kWh • Nước ${globalWaterRate.toLocaleString('vi-VN')} đ/m³.`
    );
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Đã lưu chỉ số điện nước', `Dữ liệu kỳ ${periodParam} đã được lưu an toàn.`);
    }, 400);
  };

  const handleConfirmFinalize = () => {
    setShowConfirmModal(false);
    toast.success('Đã chốt kỳ điện nước!', `Kỳ ${periodParam} đã chốt. Hệ thống đã tính tiền và tạo hóa đơn.`);
    navigate(`/invoices?period=${periodParam}`);
  };

  // Recalculate dynamic totals
  const totalElectricKwh = filteredReadings.reduce(
    (sum, r) => sum + Math.max(0, r.currElectric - r.prevElectric),
    0
  );
  const totalWaterM3 = filteredReadings.reduce(
    (sum, r) => sum + Math.max(0, r.currWater - r.prevWater),
    0
  );
  const totalUtilityCost = filteredReadings.reduce(
    (sum, r) =>
      sum +
      Math.max(0, r.currElectric - r.prevElectric) * r.electricUnitPrice +
      Math.max(0, r.currWater - r.prevWater) * r.waterUnitPrice,
    0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Lịch sử & Ghi chỉ số Điện & Nước
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Quản lý chỉ số công tơ điện và đồng hồ nước qua các tháng, chống ghi đè lịch sử cũ
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => setShowRateModal(true)}
          >
            <Settings size={15} />
            <span>Cài đặt đơn giá</span>
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            <Save size={15} />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu chỉ số kỳ này'}</span>
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => setShowConfirmModal(true)}
          >
            <CheckCircle2 size={15} />
            <span>Chốt số & Phát hành hóa đơn</span>
          </button>
        </div>
      </div>

      {/* Period Selection & Filter Bar */}
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
          {/* Period selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#00594C" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Chọn kỳ ghi:</span>
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
              <option value="all">Tất cả các kỳ (Lịch sử tổng hợp)</option>
              {availablePeriods.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Property selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="#6B7280" />
            <span style={{ fontSize: '13px', color: '#374151' }}>Tòa nhà:</span>
            <select
              value={propertyParam}
              onChange={(e) => updateFilters({ propertyId: e.target.value })}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="all">Tất cả cơ sở ({mockProperties.length})</option>
              {mockProperties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '240px' }}>
          <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo phòng, tên khách..."
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng điện tiêu thụ</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#D97706', marginTop: '6px' }}>
            {totalElectricKwh.toLocaleString('vi-VN')} kWh
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Đơn giá: {globalElectricRate.toLocaleString('vi-VN')} đ/kWh
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng nước tiêu thụ</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563EB', marginTop: '6px' }}>
            {totalWaterM3.toLocaleString('vi-VN')} m³
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Đơn giá: {globalWaterRate.toLocaleString('vi-VN')} đ/m³
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tổng tiền dịch vụ tính toán</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00594C', marginTop: '6px' }}>
            {formatVND(totalUtilityCost)}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            {filteredReadings.length} phòng trong kỳ
          </div>
        </div>

        <div className="rf-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Tiến độ chốt số</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#137333', marginTop: '6px' }}>
            {filteredReadings.length}/{filteredReadings.length} phòng
          </div>
          <div style={{ fontSize: '11px', color: '#137333', marginTop: '4px' }}>
            ✓ Đầy đủ số liệu công tơ
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredReadings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            <AlertTriangle size={36} color="#D97706" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#374151' }}>
              Không có chỉ số điện nước trong kỳ này
            </h4>
            <p style={{ fontSize: '13px', margin: '6px 0 16px 0' }}>
              Chưa có số liệu ghi chép cho bộ lọc đang chọn.
            </p>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setSearchParams({ period: '2024-03' })}
            >
              Xem kỳ Tháng 03/2024
            </button>
          </div>
        ) : (
          <table className="rf-table">
            <thead>
              <tr>
                <th>Phòng / Khách thuê</th>
                <th>Kỳ chốt số</th>
                <th>Điện cũ (kWh)</th>
                <th>Điện mới (kWh)</th>
                <th>Tiêu thụ Điện</th>
                <th>Nước cũ (m³)</th>
                <th>Nước mới (m³)</th>
                <th>Tiêu thụ Nước</th>
                <th>Thành tiền</th>
                <th>Hóa đơn liên quan</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.map((r) => {
                const usedElectric = Math.max(0, r.currElectric - r.prevElectric);
                const usedWater = Math.max(0, r.currWater - r.prevWater);
                const roomCost = usedElectric * r.electricUnitPrice + usedWater * r.waterUnitPrice;
                const isInvalidReading = r.currElectric < r.prevElectric || r.currWater < r.prevWater;

                return (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/landlord/utilities/readings/${r.id}`)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    title={`Bấm để xem chi tiết chỉ số phòng ${r.roomCode} kỳ ${r.period}`}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: '#00594C' }}>{r.roomCode} →</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{r.tenantName}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                        {r.period || 'Tháng 03/2024'}
                      </span>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{r.updatedAt}</div>
                    </td>
                    <td style={{ color: '#6B7280' }}>{r.prevElectric}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        value={r.currElectric}
                        onChange={(e) =>
                          handleReadingChange(r.id, 'currElectric', parseInt(e.target.value, 10) || 0)
                        }
                        style={{
                          width: '80px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: isInvalidReading ? '1px solid #DC2626' : '1px solid #D1D5DB',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: '#D97706' }}>{usedElectric} kWh</strong>
                    </td>
                    <td style={{ color: '#6B7280' }}>{r.prevWater}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        value={r.currWater}
                        onChange={(e) =>
                          handleReadingChange(r.id, 'currWater', parseInt(e.target.value, 10) || 0)
                        }
                        style={{
                          width: '70px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: isInvalidReading ? '1px solid #DC2626' : '1px solid #D1D5DB',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: '#2563EB' }}>{usedWater} m³</strong>
                    </td>
                    <td style={{ fontWeight: 700, color: '#00594C' }}>
                      {formatVND(roomCost)}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {r.invoiceCode ? (
                        <Link
                          to={`/invoices`}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#2563EB',
                            textDecoration: 'none',
                          }}
                        >
                          {r.invoiceCode} →
                        </Link>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Chưa xuất HĐ</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Xác nhận chốt chỉ số & Tạo hóa đơn"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
            Bạn đang chuẩn bị chốt số điện nước kỳ <strong>{availablePeriods.find((p) => p.key === periodParam)?.label || periodParam}</strong> cho{' '}
            <strong>{filteredReadings.length} phòng</strong>. Tổng tiền điện nước tính toán là{' '}
            <strong>{formatVND(totalUtilityCost)}</strong>.
          </p>
          <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '6px', border: '1px solid #FDE68A', fontSize: '12px', color: '#92400E' }}>
            ⚠️ Sau khi phát hành, hóa đơn sẽ được gửi đến cổng cư dân của khách thuê. Dữ liệu chỉ số các tháng trước sẽ được lưu trữ nguyên vẹn trong lịch sử.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rf-btn rf-btn-primary"
              onClick={handleConfirmFinalize}
            >
              Xác nhận chốt & Xem hóa đơn
            </button>
          </div>
        </div>
      </Modal>

      {/* Rate Settings Modal */}
      <Modal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        title="Cài đặt đơn giá Điện & Nước"
      >
        <form onSubmit={handleApplyGlobalRates} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Đơn giá Điện (đ / kWh):
            </label>
            <input
              type="number"
              value={globalElectricRate}
              onChange={(e) => setGlobalElectricRate(parseInt(e.target.value, 10) || 0)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Đơn giá Nước (đ / m³):
            </label>
            <input
              type="number"
              value={globalWaterRate}
              onChange={(e) => setGlobalWaterRate(parseInt(e.target.value, 10) || 0)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowRateModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
