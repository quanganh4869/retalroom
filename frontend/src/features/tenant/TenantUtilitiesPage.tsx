import React, { useState } from 'react';
import { Zap, Droplets, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { formatVND } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';
import { Modal } from '@/components/ui/Modal';

interface UtilityRecord {
  period: string;
  electricOld: number;
  electricNew: number;
  electricUsed: number;
  electricRate: number;
  waterOld: number;
  waterNew: number;
  waterUsed: number;
  waterRate: number;
  recordedDate: string;
  status: 'confirmed' | 'draft';
}

const mockTenantUtilities: UtilityRecord[] = [
  {
    period: 'Tháng 03/2024',
    electricOld: 1240,
    electricNew: 1330,
    electricUsed: 90,
    electricRate: 3800,
    waterOld: 42,
    waterNew: 48,
    waterUsed: 6,
    waterRate: 20000,
    recordedDate: '28/02/2024',
    status: 'confirmed',
  },
  {
    period: 'Tháng 02/2024',
    electricOld: 1155,
    electricNew: 1240,
    electricUsed: 85,
    electricRate: 3800,
    waterOld: 37,
    waterNew: 42,
    waterUsed: 5,
    waterRate: 20000,
    recordedDate: '29/01/2024',
    status: 'confirmed',
  },
  {
    period: 'Tháng 01/2024',
    electricOld: 1060,
    electricNew: 1155,
    electricUsed: 95,
    electricRate: 3800,
    waterOld: 31,
    waterNew: 37,
    waterUsed: 6,
    waterRate: 20000,
    recordedDate: '28/12/2023',
    status: 'confirmed',
  },
  {
    period: 'Tháng 12/2023',
    electricOld: 975,
    electricNew: 1060,
    electricUsed: 85,
    electricRate: 3800,
    waterOld: 26,
    waterNew: 31,
    waterUsed: 5,
    waterRate: 20000,
    recordedDate: '28/11/2023',
    status: 'confirmed',
  },
];

export const TenantUtilitiesPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [records] = useState<UtilityRecord[]>(mockTenantUtilities);
  const [selectedRecord, setSelectedRecord] = useState<UtilityRecord>(
    mockTenantUtilities[0]!
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'electric' | 'water'>('electric');
  const [claimedReading, setClaimedReading] = useState('');
  const [reportNote, setReportNote] = useState('');

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReportModal(false);
    toast.success(
      'Đã gửi báo cáo sai lệch chỉ số!',
      `Chủ nhà đã nhận được phản ánh chỉ số ${reportType === 'electric' ? 'Điện' : 'Nước'} kỳ ${selectedRecord.period}. Nhân viên sẽ đến kiểm tra công tơ.`
    );
    setClaimedReading('');
    setReportNote('');
  };

  const electricCost = selectedRecord.electricUsed * selectedRecord.electricRate;
  const waterCost = selectedRecord.waterUsed * selectedRecord.waterRate;
  const totalCost = electricCost + waterCost;

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Lịch sử chỉ số Điện & Nước
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Minh bạch từng kỳ công tơ điện nước phòng {user?.roomCode || 'P.101'} và báo cáo sai lệch trực tiếp tới chủ nhà.
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

      {/* Grid: Reading History Table on Left, Period Detail Breakdown on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Left Column: History Table */}
        <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Bảng tra cứu các kỳ chốt số
            </h3>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>
              Đơn giá niêm yết: Điện 3.800 đ/kWh • Nước 20.000 đ/m³
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
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const isSelected = r.period === selectedRecord.period;
                const cost = r.electricUsed * r.electricRate + r.waterUsed * r.waterRate;
                return (
                  <tr
                    key={r.period}
                    onClick={() => setSelectedRecord(r)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#F0FDF4' : 'transparent',
                    }}
                  >
                    <td>
                      <strong style={{ color: isSelected ? '#00594C' : '#111827' }}>
                        {r.period}
                      </strong>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Chốt ngày {r.recordedDate}</div>
                    </td>
                    <td>{r.electricOld} - {r.electricNew}</td>
                    <td>
                      <strong>{r.electricUsed} kWh</strong>
                    </td>
                    <td>{r.waterOld} - {r.waterNew}</td>
                    <td>
                      <strong>{r.waterUsed} m³</strong>
                    </td>
                    <td style={{ fontWeight: 600, color: '#00594C' }}>
                      {formatVND(cost)}
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
              {selectedRecord.period}
            </h3>
            <span style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <CheckCircle2 size={14} /> Chốt chỉ số hợp lệ ngày {selectedRecord.recordedDate}
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
              <div>• Chỉ số: {selectedRecord.electricOld} kWh $\rightarrow$ {selectedRecord.electricNew} kWh</div>
              <div>• Tiêu thụ: <strong>{selectedRecord.electricUsed} kWh</strong> x 3.800 đ/kWh</div>
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
              <div>• Chỉ số: {selectedRecord.waterOld} m³ $\rightarrow$ {selectedRecord.waterNew} m³</div>
              <div>• Tiêu thụ: <strong>{selectedRecord.waterUsed} m³</strong> x 20.000 đ/m³</div>
            </div>
          </div>

          {/* Total Cost */}
          <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Tổng tiền Điện & Nước:</span>
            <strong style={{ fontSize: '18px', color: '#00594C' }}>
              {formatVND(totalCost)}
            </strong>
          </div>

          <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.4 }}>
            💡 Số tiền này được tự động cộng vào hóa đơn tiền phòng kỳ {selectedRecord.period} gửi đến bạn vào ngày 01 hàng tháng.
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
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Kỳ phản ánh
            </label>
            <input
              type="text"
              value={selectedRecord.period}
              disabled
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Loại công tơ gặp sai lệch *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'electric' | 'water')}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#fff' }}
            >
              <option value="electric">Công tơ Điện (Ghi nhận: {selectedRecord.electricNew} kWh)</option>
              <option value="water">Đồng hồ Nước (Ghi nhận: {selectedRecord.waterNew} m³)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Chỉ số thực tế trên đồng hồ bạn ghi nhận *
            </label>
            <input
              type="number"
              placeholder="Nhập số thực tế hiển thị trên đồng hồ"
              value={claimedReading}
              onChange={(e) => setClaimedReading(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Ghi chú thêm & Đính kèm
            </label>
            <textarea
              rows={3}
              placeholder="Mô tả cụ thể (Ví dụ: Công tơ quay nhanh bất thường, chụp hình gửi qua Zalo...)"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="rf-btn rf-btn-secondary" onClick={() => setShowReportModal(false)}>
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
