import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface BlockIpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { ipAddress: string; reason: string; durationHours: number; notes?: string }) => Promise<void>;
  initialIp?: string;
}

export const BlockIpModal: React.FC<BlockIpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialIp = '',
}) => {
  const [ipAddress, setIpAddress] = useState(initialIp);
  const [reason, setReason] = useState('');
  const [durationHours, setDurationHours] = useState<number>(24);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIpAddress(initialIp);
      setReason('');
      setDurationHours(24);
      setNotes('');
      setError(null);
    }
  }, [isOpen, initialIp]);

  const isValidIp = (ip: string) => {
    // Basic IPv4 or IPv6 regex
    const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6 = /^[0-9a-fA-F:]+$/;
    return ipv4.test(ip.trim()) || ipv6.test(ip.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = ipAddress.trim();

    if (!cleanIp) {
      setError('Vui lòng nhập địa chỉ IP.');
      return;
    }

    if (!isValidIp(cleanIp)) {
      setError('Định dạng địa chỉ IP không hợp lệ (IPv4 hoặc IPv6).');
      return;
    }

    // Protection rule: Never block localhost or admin current IP
    if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === '118.69.182.10') {
      setError(`Không thể chặn địa chỉ IP ${cleanIp} vì đây là IP đang truy cập của Quản trị viên.`);
      return;
    }

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do thực hiện chặn IP này.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        ipAddress: cleanIp,
        reason: reason.trim(),
        durationHours,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Có lỗi xảy ra khi chặn IP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm IP vào danh sách chặn truy cập"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FECACA' }}>
          <ShieldAlert size={20} color="#DC2626" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '12px', color: '#991B1B' }}>
            Hệ thống sẽ từ chối mọi yêu cầu đăng nhập và kết nối API từ địa chỉ IP này trong thời hạn được cấu hình.
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#FFF1F2', borderRadius: '6px', color: '#BE123C', fontSize: '12px' }}>
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
            Địa chỉ IP (IPv4 hoặc IPv6) <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: 45.154.255.82 hoặc 2001:db8::1"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
            Lý do hạn chế truy cập <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Brute-force mật khẩu quản trị, Spam webhook giả mạo..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
            Thời hạn chặn
          </label>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              fontSize: '13px',
            }}
          >
            <option value={1}>1 giờ</option>
            <option value={24}>24 giờ (1 ngày) — Khuyến nghị</option>
            <option value={168}>7 ngày</option>
            <option value={720}>30 ngày</option>
            <option value={0}>Vĩnh viễn (Chỉ gỡ bằng tay)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
            Ghi chú điều tra nội bộ (Tùy chọn)
          </label>
          <textarea
            placeholder="Thông tin thêm về ticket liên quan hoặc dải IP..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="rf-btn rf-btn-primary"
            disabled={isSubmitting}
            style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận chặn IP'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
