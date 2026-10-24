import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { BlockedIPItem } from '../types';

interface UnblockIpModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: BlockedIPItem | null;
  onConfirm: (blockId: string, reason: string) => Promise<void>;
}

export const UnblockIpModal: React.FC<UnblockIpModalProps> = ({
  isOpen,
  onClose,
  target,
  onConfirm,
}) => {
  const [unblockReason, setUnblockReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setUnblockReason('');
      setError(null);
    }
  }, [isOpen]);

  if (!target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unblockReason.trim()) {
      setError('Vui lòng nhập lý do gỡ chặn IP này.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(target.id, unblockReason.trim());
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Có lỗi xảy ra khi gỡ chặn IP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận gỡ chặn IP"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
        <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <CheckCircle2 size={18} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#166534' }}>
              Bạn đang chuẩn bị mở lại quyền truy cập cho địa chỉ:
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
              {target.ipAddress}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#4B5563', backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '6px' }}>
          <div><strong>Nguồn chặn:</strong> {target.blockSource === 'AUTOMATIC' ? 'Tự động (WAF Rule)' : 'Thủ công (Quản trị viên)'}</div>
          <div><strong>Lý do chặn ban đầu:</strong> {target.reason}</div>
          <div><strong>Thời điểm chặn:</strong> {target.blockedAt}</div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#FFF1F2', borderRadius: '6px', color: '#BE123C', fontSize: '12px' }}>
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
            Lý do gỡ bỏ chặn <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Khách hàng xác minh chính chủ, Đã đổi mật khẩu an toàn..."
            value={unblockReason}
            onChange={(e) => setUnblockReason(e.target.value)}
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
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
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận gỡ chặn'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
