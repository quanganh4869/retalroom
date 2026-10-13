import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Minimize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const RentFlowChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý ảo AI của RentFlow. Tôi có thể hỗ trợ bạn tìm hiểu tính năng quản lý phòng, hóa đơn điện nước hoặc tư vấn bảng giá!',
      timestamp: 'Vừa xong',
      suggestions: [
        'Cách tính tiền điện nước tự động?',
        'Khách thuê có cần tải app không?',
        'Dùng thử miễn phí 14 ngày thế nào?',
        'Hỗ trợ quản lý bao nhiêu phòng?',
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const getBotReply = (userQuery: string): { text: string; suggestions?: string[] } => {
    const q = userQuery.toLowerCase();
    if (q.includes('điện') || q.includes('nước') || q.includes('chỉ số')) {
      return {
        text: 'RentFlow hỗ trợ bảng chốt số điện nước tập trung trên điện thoại hoặc máy tính. Hệ thống tự động lấy số cũ trừ số mới, nhân biểu giá và xuất hóa đơn PDF kèm mã VietQR trong 30 giây!',
        suggestions: ['Cách gửi hóa đơn qua Zalo?', 'Khách thanh toán thế nào?'],
      };
    }
    if (q.includes('app') || q.includes('tải') || q.includes('khách thuê')) {
      return {
        text: 'Khách thuê không bắt buộc phải tải app nặng máy. RentFlow cung cấp Cổng Cư Dân Web-App trực quan, khách chỉ cần mở link trên điện thoại là có thể xem hóa đơn và gửi báo hỏng ngay.',
        suggestions: ['Quy trình báo hỏng thiết bị?', 'Hợp đồng thuê phòng?'],
      };
    }
    if (q.includes('dùng thử') || q.includes('miễn phí') || q.includes('14 ngày') || q.includes('giá')) {
      return {
        text: 'Bạn được trải nghiệm hoàn toàn miễn phí 14 ngày không giới hạn số lượng phòng hoặc tòa nhà. Không cần nhập thẻ tín dụng, đăng ký tài khoản là có thể thiết lập ngay!',
        suggestions: ['Bắt đầu đăng ký tài khoản', 'Tôi cần hỗ trợ kỹ thuật'],
      };
    }
    if (q.includes('phòng') || q.includes('quy mô') || q.includes('tòa')) {
      return {
        text: 'RentFlow linh hoạt cho mọi quy mô: Từ chủ nhà cho thuê 5-15 phòng trọ đơn lẻ, đến chuỗi căn hộ dịch vụ và tòa nhà co-living hàng trăm phòng.',
        suggestions: ['Cách quản lý tiền cọc?', 'Xuất báo cáo doanh thu?'],
      };
    }
    if (q.includes('cọc') || q.includes('hợp đồng') || q.includes('trả phòng')) {
      return {
        text: 'Mỗi hợp đồng có sổ theo dõi tiền cọc riêng biệt. Khi khách trả phòng, hệ thống tự động lập phiếu quyết toán cấn trừ tiền điện nước và hư hao tài sản trước khi hoàn cọc.',
        suggestions: ['Cách tính tiền điện nước tự động?', 'Dùng thử miễn phí 14 ngày thế nào?'],
      };
    }
    return {
      text: 'Cảm ơn câu hỏi của bạn! Bạn có thể xem nhanh các chức năng chính trên trang hoặc để lại câu hỏi cụ thể, trợ lý RentFlow sẽ hướng dẫn bạn từng bước.',
      suggestions: [
        'Cách tính tiền điện nước tự động?',
        'Khách thuê có cần tải app không?',
        'Dùng thử miễn phí 14 ngày thế nào?',
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = getBotReply(query);
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: reply.suggestions,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Mở khung chat hỗ trợ"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#00594C',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0, 89, 76, 0.35), 0 2px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), background-color 0.2s ease',
            position: 'relative',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageSquare size={26} />
          {/* Active Status Badge */}
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '2px solid #FFFFFF',
            }}
          />
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div
          style={{
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'rfFadeUp 0.25s cubic-bezier(0.2, 0, 0, 1) forwards',
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#00594C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} color="#34D399" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>RentFlow AI</span>
                  <Sparkles size={13} color="#34D399" />
                </div>
                <div style={{ fontSize: '11px', color: '#A7F3D0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34D399' }} />
                  Đang hoạt động trực tuyến
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '4px', opacity: 0.85 }}
                title="Thu nhỏ"
              >
                <Minimize2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '4px', opacity: 0.85 }}
                title="Đóng chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#F9FAFB',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: msg.sender === 'user' ? '#00594C' : '#FFFFFF',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#1F2937',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    border: msg.sender === 'user' ? 'none' : '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
                <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '3px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>

                {/* Suggestions Pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(sug)}
                        style={{
                          fontSize: '11px',
                          padding: '5px 10px',
                          borderRadius: '12px',
                          backgroundColor: '#E6F0EE',
                          color: '#00594C',
                          border: '1px solid rgba(0, 89, 76, 0.15)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 500,
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D1E6E2')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E6F0EE')}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', width: 'fit-content' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00594C', animation: 'rfPulse 1s infinite' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00594C', animation: 'rfPulse 1s infinite 0.2s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00594C', animation: 'rfPulse 1s infinite 0.4s' }} />
                <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '4px' }}>AI đang soạn...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 14px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid #D1D5DB',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#F9FAFB',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#00594C')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: inputValue.trim() ? '#00594C' : '#E5E7EB',
                color: inputValue.trim() ? '#FFFFFF' : '#9CA3AF',
                border: 'none',
                cursor: inputValue.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background-color 0.15s ease',
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
