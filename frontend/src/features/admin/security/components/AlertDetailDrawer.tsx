import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Clock,
  User,
  Globe,
  FileText,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  PlayCircle,
} from 'lucide-react';
import { SecurityAlertItem } from '../types';

interface AlertDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alert: SecurityAlertItem | null;
  onStartInvestigate: (alertId: string) => Promise<void>;
  onResolve: (alertId: string, resolutionNote: string) => Promise<void>;
  onAddNote: (alertId: string, note: string) => Promise<void>;
}

export const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({
  isOpen,
  onClose,
  alert,
  onStartInvestigate,
  onResolve,
  onAddNote,
}) => {
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !alert) return null;

  const getSeverityBadge = (sev: SecurityAlertItem['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="rf-badge rf-badge-danger" style={{ backgroundColor: '#7F1D1D', color: '#FEE2E2', fontWeight: 700 }}>CRITICAL</span>;
      case 'HIGH':
        return <span className="rf-badge rf-badge-danger">HIGH</span>;
      case 'MEDIUM':
        return <span className="rf-badge rf-badge-warning">MEDIUM</span>;
      case 'LOW':
        return <span className="rf-badge rf-badge-neutral">LOW</span>;
      default:
        return <span className="rf-badge">{sev}</span>;
    }
  };

  const getStatusBadge = (st: SecurityAlertItem['status']) => {
    switch (st) {
      case 'OPEN':
        return <span className="rf-badge rf-badge-danger">Mới phát hiện</span>;
      case 'INVESTIGATING':
        return <span className="rf-badge rf-badge-warning">Đang điều tra</span>;
      case 'RESOLVED':
        return <span className="rf-badge rf-badge-active">Đã xử lý</span>;
      case 'DISMISSED':
        return <span className="rf-badge rf-badge-neutral">Bỏ qua</span>;
      default:
        return <span className="rf-badge">{st}</span>;
    }
  };

  const handleStartInvestigate = async () => {
    try {
      setIsSubmitting(true);
      await onStartInvestigate(alert.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setIsSubmitting(true);
      await onAddNote(alert.id, newNote.trim());
      setNewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmResolve = async () => {
    try {
      setIsSubmitting(true);
      await onResolve(alert.id, resolutionNote.trim());
      setShowResolveModal(false);
      setResolutionNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewRelatedEvents = () => {
    onClose();
    const query = alert.targetEmail || alert.ipAddress;
    navigate(`/platform/security/login-logs?search=${encodeURIComponent(query)}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '520px',
          maxWidth: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 61,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#00594C' }}>
                Mã: {alert.id}
              </span>
              {getSeverityBadge(alert.severity)}
              {getStatusBadge(alert.status)}
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {alert.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            fontSize: '13px',
          }}
        >
          {/* Quick Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              backgroundColor: '#F9FAFB',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Thời điểm phát hiện
              </span>
              <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                {alert.timestamp}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={12} /> Địa chỉ IP kích hoạt
              </span>
              <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                {alert.ipAddress}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} /> Tài khoản mục tiêu
              </span>
              <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                {alert.targetEmail || 'Không có mục tiêu cụ thể'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={12} /> Quy tắc phát hiện
              </span>
              <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px', wordBreak: 'break-all' }}>
                {alert.detectionRule || 'Tự động phân tích'}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Mô tả chi tiết sự cố
            </h4>
            <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E5E7EB', color: '#1F2937', lineHeight: '1.6' }}>
              {alert.description}
            </div>
          </div>

          {/* Assignment & Resolution metadata */}
          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              <strong>Người phụ trách:</strong> {alert.assignedTo || 'Chưa phân công'}
            </div>
            {alert.resolvedAt && (
              <div>
                <strong>Đã xử lý lúc:</strong> {alert.resolvedAt} bởi {alert.resolvedBy || 'Admin'}
              </div>
            )}
          </div>

          {/* Related Event Quick Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#E6F0EE', borderRadius: '6px', border: '1px solid #B2D8D2' }}>
            <span style={{ fontSize: '12px', color: '#00594C', fontWeight: 600 }}>
              Tra cứu các phiên đăng nhập từ IP / Email này
            </span>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={handleViewRelatedEvents}
              style={{ fontSize: '12px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <ExternalLink size={12} /> Xem sự kiện liên quan
            </button>
          </div>

          {/* Investigation Notes & Timeline */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} /> Nhật ký điều tra & Ghi chú nội bộ
            </h4>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#F9FAFB',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                minHeight: '80px',
                whiteSpace: 'pre-line',
                color: '#374151',
                fontSize: '12px',
                lineHeight: '1.5',
              }}
            >
              {alert.investigationNotes || 'Chưa có ghi chú nào được ghi nhận cho sự cố này.'}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Thêm ghi chú điều tra mới..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="rf-btn rf-btn-secondary"
                disabled={isSubmitting || !newNote.trim()}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Lưu ghi chú
              </button>
            </form>
          </div>
        </div>

        {/* Drawer Action Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          }}
        >
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={onClose}
          >
            Đóng
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {alert.status === 'OPEN' && (
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={handleStartInvestigate}
                disabled={isSubmitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <PlayCircle size={14} color="#D97706" />
                <span>Bắt đầu điều tra</span>
              </button>
            )}

            {alert.status !== 'RESOLVED' && (
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setShowResolveModal(true)}
                disabled={isSubmitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={14} />
                <span>Đánh dấu đã xử lý</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Confirmation Sub-Modal */}
      {showResolveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowResolveModal(false);
          }}
        >
          <div
            style={{
              width: '420px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 10px 0' }}>
              Xác nhận hoàn tất xử lý cảnh báo
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 12px 0' }}>
              Vui lòng nhập tóm tắt kết quả xử lý sự cố an ninh này để lưu vào nhật ký kiểm toán.
            </p>
            <textarea
              placeholder="Ví dụ: Đã khóa IP kẻ tấn công, reset mật khẩu tài khoản và bật bắt buộc 2FA..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                marginBottom: '16px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => setShowResolveModal(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={handleConfirmResolve}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang lưu...' : 'Xác nhận xử lý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
