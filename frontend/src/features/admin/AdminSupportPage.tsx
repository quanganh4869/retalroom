import React, { useState } from 'react';
import {
  Search,
  Send,
  Lock,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformSupportTicket } from './types/platformAdmin';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminSupportPage: React.FC = () => {
  const { tickets, updateTicketStatus, replyToTicket } = usePlatformAdmin();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Currently opened ticket on right-hand detail pane
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requesterName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    replyToTicket(selectedTicket.id, replyMessage, isInternalNote, 'Trần Văn Bảo (Support Ops)');
    setReplyMessage('');
    toast.success(
      isInternalNote ? 'Đã thêm ghi chú nội bộ' : 'Đã gửi phản hồi hỗ trợ',
      `Cập nhật cho ticket ${selectedTicket.ticketNumber}`
    );
  };

  const getPriorityBadge = (p: PlatformSupportTicket['priority']) => {
    switch (p) {
      case 'URGENT':
        return <span className="rf-badge rf-badge-danger">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="rf-badge rf-badge-danger">Ưu tiên cao</span>;
      case 'MEDIUM':
        return <span className="rf-badge rf-badge-warning">Trung bình</span>;
      default:
        return <span className="rf-badge rf-badge-neutral">Bình thường</span>;
    }
  };

  const getStatusBadge = (s: PlatformSupportTicket['status']) => {
    switch (s) {
      case 'OPEN':
        return <span className="rf-badge rf-badge-danger">Mới mở</span>;
      case 'IN_PROGRESS':
        return <span className="rf-badge rf-badge-warning">Đang xử lý</span>;
      case 'RESOLVED':
        return <span className="rf-badge rf-badge-active">Đã giải quyết</span>;
      case 'CLOSED':
        return <span className="rf-badge rf-badge-neutral">Đã đóng</span>;
      default:
        return <span className="rf-badge">{s}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rf-badge rf-badge-danger">Customer Support Desk</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Tiếp nhận & xử lý sự cố người dùng</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>
            Trung tâm hỗ trợ CSKH nền tảng
          </h1>
        </div>
      </div>

      {/* Main Split Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        {/* Left Column: Ticket List */}
        <div className="rf-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search & Filters */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Tìm mã SUP, chủ đề, tổ chức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="OPEN">Chờ tiếp nhận (Open)</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="RESOLVED">Đã giải quyết</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              >
                <option value="ALL">Tất cả ưu tiên</option>
                <option value="URGENT">Khẩn cấp</option>
                <option value="HIGH">Cao</option>
                <option value="MEDIUM">Trung bình</option>
              </select>
            </div>
          </div>

          {/* Ticket Items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                    borderLeft: isSelected ? '4px solid #00594C' : '4px solid transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: '#00594C' }}>{t.ticketNumber}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {getPriorityBadge(t.priority)}
                      {getStatusBadge(t.status)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', marginTop: '4px', lineHeight: 1.3 }}>
                    {t.subject}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: '#6B7280' }}>
                    <span>{t.organizationName}</span>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ticket Conversation & Resolution Pane */}
        {selectedTicket ? (
          <div className="rf-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header info */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#00594C' }}>{selectedTicket.ticketNumber}</span>
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>
                    {selectedTicket.subject}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={() => {
                      updateTicketStatus(selectedTicket.id, selectedTicket.status === 'RESOLVED' ? 'IN_PROGRESS' : 'RESOLVED');
                      toast.info('Trạng thái ticket', 'Đã chuyển trạng thái ticket thành công');
                    }}
                  >
                    {selectedTicket.status === 'RESOLVED' ? 'Mở lại ticket' : 'Đánh dấu Đã xử lý'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#4B5563' }}>
                <div>
                  Người gửi: <strong>{selectedTicket.requesterName}</strong> ({selectedTicket.requesterEmail})
                </div>
                <div>
                  Tổ chức: <strong>{selectedTicket.organizationName}</strong>
                </div>
                <div>
                  Phân công: <strong>{selectedTicket.assignedTo || 'Chưa gán'}</strong>
                </div>
              </div>
            </div>

            {/* Message thread */}
            <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedTicket.messages.map((m) => {
                const isAgent = m.sender === 'AGENT';
                const isInternal = m.isInternalNote;

                return (
                  <div
                    key={m.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: isInternal ? '#FEF9C3' : isAgent ? '#E6F0EE' : '#F3F4F6',
                      border: isInternal ? '1px dashed #F59E0B' : '1px solid transparent',
                      alignSelf: isAgent ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: isInternal ? '#B45309' : isAgent ? '#00594C' : '#374151' }}>
                        {isInternal && <Lock size={12} />}
                        {m.senderName}
                      </div>
                      <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{m.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#1F2937', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendReply} style={{ padding: '14px 20px', borderTop: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4B5563', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                  />
                  <span>Chế độ ghi chú nội bộ (Khách không nhìn thấy)</span>
                </label>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Shift + Enter để xuống dòng</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <textarea
                  rows={2}
                  placeholder={isInternalNote ? 'Viết ghi chú phân tích sự cố nội bộ...' : 'Soạn phản hồi gửi cho khách hàng...'}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    fontSize: '13px',
                    resize: 'none',
                    outline: 'none',
                    backgroundColor: isInternalNote ? '#FFFDF0' : '#FFFFFF',
                  }}
                />
                <button
                  type="submit"
                  className="rf-btn rf-btn-primary"
                  style={{ alignSelf: 'flex-end', height: '38px' }}
                >
                  <Send size={14} /> Gửi
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rf-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            Chọn một yêu cầu hỗ trợ để bắt đầu xử lý.
          </div>
        )}
      </div>
    </div>
  );
};
