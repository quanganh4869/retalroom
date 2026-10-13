import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { mockMeterReadings, formatVND, MeterReadingItem } from '@/lib/mockData';
import { ButtonSpinner } from '@/components/ui/LoadingSystem';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';
import { useActionModal } from '@/components/ui/ActionModal';

export const MeterReadingsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { confirmAction } = useActionModal();

  const [readings, setReadings] = useState<MeterReadingItem[]>(mockMeterReadings);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Utility Rates Settings Modal
  const [showRateModal, setShowRateModal] = useState<boolean>(false);
  const [globalElectricRate, setGlobalElectricRate] = useState<number>(3800);
  const [globalWaterRate, setGlobalWaterRate] = useState<number>(20000);

  const handleReadingChange = (
    id: string,
    field: 'currElectric' | 'currWater',
    value: number
  ) => {
    setReadings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleApplyGlobalRates = (e: React.FormEvent) => {
    e.preventDefault();
    setReadings((prev) =>
      prev.map((item) => ({
        ...item,
        electricUnitPrice: globalElectricRate,
        waterUnitPrice: globalWaterRate,
      }))
    );
    setShowRateModal(false);
    toast.success(
      'Đã cập nhật giá điện nước!',
      `Áp dụng: Điện ${globalElectricRate.toLocaleString('vi-VN')} đ/kWh • Nước ${globalWaterRate.toLocaleString('vi-VN')} đ/m³ cho tất cả phòng.`
    );
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Đã lưu chỉ số điện nước', 'Dữ liệu chỉ số 5 phòng đã được cập nhật.');
    }, 400);
  };

  const handleFinalizeAndInvoice = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmFinalize = () => {
    setShowConfirmModal(false);
    toast.success('Đã chốt kỳ điện nước!', 'Hệ thống đã tự động tính tiền và phát hành hóa đơn.');
    navigate('/invoices');
  };

  // Recalculate dynamic totals
  const totalElectricKwh = readings.reduce(
    (sum, r) => sum + Math.max(0, r.currElectric - r.prevElectric),
    0
  );
  const totalWaterM3 = readings.reduce(
    (sum, r) => sum + Math.max(0, r.currWater - r.prevWater),
    0
  );
  const totalUtilityCost = readings.reduce(
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
            Ghi chỉ số Điện & Nước
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Kỳ ghi: Tháng 03/2024 • Ngày chốt số: 01/03/2024 • Đơn giá hiện tại: Điện {globalElectricRate.toLocaleString('vi-VN')}đ/kWh, Nước {globalWaterRate.toLocaleString('vi-VN')}đ/m³
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => setShowRateModal(true)}
          >
            <Settings size={14} />
            <span>Cài đặt giá Điện / Nước</span>
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => {
              confirmAction({
                title: 'Tải biểu mẫu nhập liệu Excel',
                description: 'Tải file mẫu Excel chuẩn "Mau_Nhap_Chi_So_Dien_Nuoc_RentFlow.xlsx" để nhập số công tơ điện nước ngoại tuyến.',
                confirmText: 'Tải xuống',
                successTitle: 'Đã tải mẫu Excel!',
                successMessage: 'Biểu mẫu đã được lưu về máy tính. Bạn có thể mở bằng Microsoft Excel hoặc Google Sheets.',
                simulateDelayMs: 600,
              });
            }}
          >
            <span>Tải mẫu Excel</span>
          </button>
          <button
            type="button"
            className="rf-btn rf-btn-primary"
            onClick={() => {
              confirmAction({
                title: 'Lưu toàn bộ chỉ số điện nước',
                description: 'Cập nhật chỉ số công tơ mới cho tất cả các phòng trong danh sách. Dữ liệu này sẽ làm căn cứ tính tiền hóa đơn.',
                confirmText: 'Lưu chỉ số',
                successTitle: 'Lưu chỉ số thành công!',
                successMessage: 'Dữ liệu chỉ số điện nước của tất cả các phòng đã được lưu an toàn.',
                simulateDelayMs: 700,
                onSuccess: handleSaveAll,
              });
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <ButtonSpinner />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Lưu tất cả chỉ số</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warning Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#FEF7E0',
          border: '1px solid #FEE2B3',
          borderRadius: '8px',
          padding: '12px 18px',
        }}
      >
        <AlertTriangle size={18} color="#B06000" />
        <div style={{ fontSize: '13px', color: '#B06000', flex: 1 }}>
          <strong>Lưu ý kiểm tra chỉ số bất thường:</strong> Hệ thống tự động phát hiện nếu số mới tăng &gt; 50% hoặc nhỏ hơn số cũ để tránh sai sót trước khi lập hóa đơn.
        </div>
      </div>

      {/* Table with Inline Editing Inputs */}
      <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="rf-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Số phòng</th>
              <th style={{ width: '160px' }}>Người thuê</th>
              <th style={{ textAlign: 'center', backgroundColor: '#FEF3C7', color: '#92400E' }}>
                Điện cũ (kWh)
              </th>
              <th style={{ textAlign: 'center', backgroundColor: '#FEF3C7', color: '#92400E' }}>
                Điện mới (kWh)
              </th>
              <th style={{ textAlign: 'center', backgroundColor: '#FEF3C7', color: '#92400E' }}>
                Tiêu thụ Điện
              </th>
              <th style={{ textAlign: 'center', backgroundColor: '#E0F2FE', color: '#075985' }}>
                Nước cũ (m³)
              </th>
              <th style={{ textAlign: 'center', backgroundColor: '#E0F2FE', color: '#075985' }}>
                Nước mới (m³)
              </th>
              <th style={{ textAlign: 'center', backgroundColor: '#E0F2FE', color: '#075985' }}>
                Tiêu thụ Nước
              </th>
              <th style={{ textAlign: 'right' }}>Thành tiền ước tính</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r) => {
              const diffElectric = Math.max(0, r.currElectric - r.prevElectric);
              const diffWater = Math.max(0, r.currWater - r.prevWater);
              const estimatedCost =
                diffElectric * r.electricUnitPrice + diffWater * r.waterUnitPrice;

              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#00594C' }}>{r.roomCode}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.tenantName}</div>
                  </td>
                  {/* Electric prev */}
                  <td style={{ textAlign: 'center', color: '#6B7280', fontWeight: 500 }}>
                    {r.prevElectric}
                  </td>
                  {/* Electric curr input */}
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="number"
                      value={r.currElectric}
                      onChange={(e) =>
                        handleReadingChange(r.id, 'currElectric', Number(e.target.value))
                      }
                      style={{
                        width: '80px',
                        padding: '4px 6px',
                        textAlign: 'center',
                        borderRadius: '4px',
                        border: '1px solid #D1D5DB',
                        fontWeight: 600,
                        fontSize: '13px',
                      }}
                    />
                  </td>
                  {/* Electric diff */}
                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#D97706' }}>
                    +{diffElectric} kWh
                  </td>

                  {/* Water prev */}
                  <td style={{ textAlign: 'center', color: '#6B7280', fontWeight: 500 }}>
                    {r.prevWater}
                  </td>
                  {/* Water curr input */}
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="number"
                      value={r.currWater}
                      onChange={(e) =>
                        handleReadingChange(r.id, 'currWater', Number(e.target.value))
                      }
                      style={{
                        width: '70px',
                        padding: '4px 6px',
                        textAlign: 'center',
                        borderRadius: '4px',
                        border: '1px solid #D1D5DB',
                        fontWeight: 600,
                        fontSize: '13px',
                      }}
                    />
                  </td>
                  {/* Water diff */}
                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#0284C7' }}>
                    +{diffWater} m³
                  </td>

                  {/* Total */}
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                    {formatVND(estimatedCost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sticky Bottom Summary Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '32px', fontSize: '13px' }}>
          <div>
            <span style={{ color: '#6B7280' }}>Tổng tiêu thụ điện kỳ này:</span>
            <div style={{ fontWeight: 700, color: '#D97706', fontSize: '16px' }}>
              {totalElectricKwh.toLocaleString('vi-VN')} kWh
            </div>
          </div>
          <div>
            <span style={{ color: '#6B7280' }}>Tổng tiêu thụ nước:</span>
            <div style={{ fontWeight: 700, color: '#0284C7', fontSize: '16px' }}>
              {totalWaterM3.toLocaleString('vi-VN')} m³
            </div>
          </div>
          <div>
            <span style={{ color: '#6B7280' }}>Tổng tiền dịch vụ điện nước:</span>
            <div style={{ fontWeight: 700, color: '#00594C', fontSize: '16px' }}>
              {formatVND(totalUtilityCost)}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={handleFinalizeAndInvoice}
        >
          <CheckCircle2 size={16} />
          <span>Chốt số & Lập hóa đơn tự động</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Utility Rate Settings Modal */}
      <Modal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        title="Cài đặt đơn giá Điện & Nước"
        description="Thay đổi đơn giá dịch vụ điện và nước áp dụng cho tất cả các phòng hoặc kỳ tính tiền này."
      >
        <form onSubmit={handleApplyGlobalRates} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              ⚡ Giá điện (VNĐ / kWh)
            </label>
            <input
              type="number"
              value={globalElectricRate}
              onChange={(e) => setGlobalElectricRate(Number(e.target.value))}
              min={0}
              step={100}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
              }}
              required
            />
            <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
              Mức hiện tại: {globalElectricRate.toLocaleString('vi-VN')} đ/kWh
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              💧 Giá nước (VNĐ / m³)
            </label>
            <input
              type="number"
              value={globalWaterRate}
              onChange={(e) => setGlobalWaterRate(Number(e.target.value))}
              min={0}
              step={500}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
              }}
              required
            />
            <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
              Mức hiện tại: {globalWaterRate.toLocaleString('vi-VN')} đ/m³
            </span>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: '#F0FDF4',
              borderRadius: '6px',
              border: '1px solid #BBF7D0',
              fontSize: '12px',
              color: '#166534',
              lineHeight: 1.5,
            }}
          >
            💡 Đơn giá mới sẽ được cập nhật ngay lập tức vào bảng tính tiền của tất cả các phòng trong đợt ghi số này.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setShowRateModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Lưu & Áp dụng cho tất cả các phòng
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Xác nhận chốt chỉ số và phát hành hóa đơn?"
        description="Hệ thống sẽ khóa chỉ số tháng 03/2024 và tự động tính vào hóa đơn của từng phòng."
        footer={
          <>
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
              Xác nhận & Chuyển sang Hóa đơn
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div>• Tổng số phòng chốt số: <strong>{readings.length} phòng</strong></div>
          <div>• Tổng tiền dịch vụ điện nước: <strong style={{ color: '#00594C' }}>{formatVND(totalUtilityCost)}</strong></div>
          <p style={{ color: '#6B7280', margin: '4px 0 0 0' }}>Sau khi chốt, bạn có thể gửi thông báo tiền phòng hàng loạt qua Zalo ZNS cho khách thuê.</p>
        </div>
      </Modal>
    </div>
  );
};
