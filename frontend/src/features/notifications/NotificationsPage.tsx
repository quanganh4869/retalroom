import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Wrench,
  FileText,
} from 'lucide-react';
import { mockNotifications, NotificationItem } from '@/lib/mockData';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.category === activeTab;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (cat: NotificationItem['category']) => {
    switch (cat) {
      case 'payment':
        return <CreditCard size={16} color="#137333" />;
      case 'maintenance':
        return <Wrench size={16} color="#B06000" />;
      case 'contract':
        return <FileText size={16} color="#1A73E8" />;
      case 'system':
        return <CheckCircle2 size={16} color="#00594C" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Trung tâm thông báo
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Cập nhật tức thời về biến động thanh toán, yêu cầu bảo trì và hạn hợp đồng
          </p>
        </div>
        <button className="rf-btn rf-btn-secondary" onClick={markAllRead}>
          <CheckCircle2 size={14} />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
      </div>

      {/* Main 2-Column: Notification List & Settings (Screen 26.png) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Left Column: Notification Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#FFFFFF',
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              gap: '6px',
            }}
          >
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'unread', label: 'Chưa đọc' },
              { id: 'payment', label: 'Thanh toán' },
              { id: 'maintenance', label: 'Bảo trì' },
              { id: 'contract', label: 'Hợp đồng' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  backgroundColor: activeTab === tab.id ? '#00594C' : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : '#4B5563',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="rf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '16px 20px',
                    borderBottom: '1px solid #F3F4F6',
                    backgroundColor: item.read ? '#FFFFFF' : '#F9FBFB',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(item.category)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: item.read ? 500 : 700, color: '#111827' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.createdAt}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Settings side pane */}
        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
            Kênh nhận thông báo
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#00594C' }} />
              <span>Zalo ZNS khi có thanh toán</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#00594C' }} />
              <span>SMS nhắc nợ tự động (trước 2 ngày)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#00594C' }} />
              <span>Email báo cáo doanh thu tuần</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#00594C' }} />
              <span>Thông báo đẩy trong ứng dụng</span>
            </label>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
            <button className="rf-btn rf-btn-secondary" style={{ width: '100%', fontSize: '12px' }}>
              Cấu hình mẫu tin nhắn Zalo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
