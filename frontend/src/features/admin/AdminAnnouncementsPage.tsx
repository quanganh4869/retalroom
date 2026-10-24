import React, { useState } from 'react';
import {
  Plus,
  Trash2,
} from 'lucide-react';
import { usePlatformAdmin } from './PlatformAdminContext';
import { PlatformAnnouncement } from './types/platformAdmin';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/feedback/ToastSystem';

export const AdminAnnouncementsPage: React.FC = () => {
  const { announcements, createAnnouncement, deleteAnnouncement } = usePlatformAdmin();
  const toast = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<PlatformAnnouncement['targetAudience']>('ALL');
  const [priority, setPriority] = useState<PlatformAnnouncement['priority']>('INFO');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createAnnouncement({
      title,
      content,
      targetAudience,
      priority,
      status: 'PUBLISHED',
      createdBy: 'admin@rentflow.vn',
    });

    setCreateModalOpen(false);
    setTitle('');
    setContent('');
    toast.success('Đã phát thông báo', 'Thông báo đã được hiển thị trên bảng tin của người dùng.');
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
    toast.info('Đã thu hồi thông báo', 'Thông báo đã bị gỡ bỏ khỏi toàn bộ hệ thống.');
  };

  const getPriorityBadge = (p: PlatformAnnouncement['priority']) => {
    switch (p) {
      case 'MAINTENANCE':
        return <span className="rf-badge rf-badge-warning">Bảo trì hệ thống</span>;
      case 'CRITICAL':
        return <span className="rf-badge rf-badge-danger">Khẩn cấp</span>;
      case 'WARNING':
        return <span className="rf-badge rf-badge-warning">Cảnh báo</span>;
      default:
        return <span className="rf-badge rf-badge-active">Tin tức mới</span>;
    }
  };

  const getAudienceLabel = (a: PlatformAnnouncement['targetAudience']) => {
    switch (a) {
      case 'ALL':
        return 'Toàn bộ người dùng (Chủ nhà + Cư dân)';
      case 'LANDLORDS':
        return 'Chỉ Chủ nhà (Landlords)';
      case 'TENANTS':
        return 'Chỉ Khách thuê (Tenants)';
      case 'GROWTH_AND_ABOVE':
        return 'Chủ nhà gói Growth PRO & Enterprise';
      default:
        return a;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Quản lý thông báo toàn nền tảng RentFlow
          </h1>
        </div>
        <button
          type="button"
          className="rf-btn rf-btn-primary"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus size={14} /> Phát thông báo mới
        </button>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {announcements.map((anc) => (
          <div key={anc.id} className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getPriorityBadge(anc.priority)}
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{anc.title}</h3>
              </div>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                style={{ fontSize: '11px', padding: '4px 8px', color: '#DC2626' }}
                onClick={() => handleDelete(anc.id)}
              >
                <Trash2 size={12} /> Thu hồi
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {anc.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '10px', fontSize: '12px', color: '#6B7280' }}>
              <div>
                Đối tượng tiếp nhận: <strong>{getAudienceLabel(anc.targetAudience)}</strong>
              </div>
              <div>
                Đăng bởi: <strong>{anc.createdBy}</strong> lúc {anc.publishedAt}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Soạn thảo thông báo phát toàn hệ thống"
        maxWidth="560px"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Tiêu đề thông báo *
            </label>
            <input
              type="text"
              placeholder="VD: Lịch bảo trì cụm máy chủ cơ sở dữ liệu định kỳ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Mức độ thông báo
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PlatformAnnouncement['priority'])}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}
              >
                <option value="INFO">Tin tức / Tính năng mới (Info)</option>
                <option value="MAINTENANCE">Lịch bảo trì máy chủ (Maintenance)</option>
                <option value="WARNING">Cảnh báo (Warning)</option>
                <option value="CRITICAL">Khẩn cấp (Critical)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Đối tượng hiển thị
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as PlatformAnnouncement['targetAudience'])}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}
              >
                <option value="ALL">Toàn bộ người dùng</option>
                <option value="LANDLORDS">Chỉ các Chủ nhà</option>
                <option value="TENANTS">Chỉ Khách thuê phòng</option>
                <option value="GROWTH_AND_ABOVE">Chủ nhà Growth PRO & Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Nội dung thông điệp *
            </label>
            <textarea
              rows={4}
              placeholder="Nhập chi tiết thông điệp gửi tới người dùng..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="rf-btn rf-btn-primary">
              Phát thông báo ngay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
