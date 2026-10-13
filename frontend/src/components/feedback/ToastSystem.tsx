import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = (title: string, message?: string) => addToast({ type: 'success', title, message });
  const error = (title: string, message?: string) => addToast({ type: 'error', title, message, duration: 6000 });
  const warning = (title: string, message?: string) => addToast({ type: 'warning', title, message, duration: 5000 });
  const info = (title: string, message?: string) => addToast({ type: 'info', title, message });

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#137333" />;
      case 'error':
        return <AlertCircle size={18} color="#C5221F" />;
      case 'warning':
        return <AlertTriangle size={18} color="#B06000" />;
      case 'info':
        return <Info size={18} color="#00594C" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { borderLeft: '4px solid #137333', bg: '#FFFFFF' };
      case 'error':
        return { borderLeft: '4px solid #C5221F', bg: '#FFFBFB' };
      case 'warning':
        return { borderLeft: '4px solid #B06000', bg: '#FFFDF9' };
      case 'info':
        return { borderLeft: '4px solid #00594C', bg: '#FFFFFF' };
    }
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}

      {/* Fixed Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 99999,
          maxWidth: '380px',
          width: '100%',
          pointerEvents: 'none',
        }}
        aria-live="polite"
      >
        {toasts.map((t) => {
          const style = getStyles(t.type);
          return (
            <div
              key={t.id}
              role="status"
              style={{
                backgroundColor: style.bg,
                borderLeft: style.borderLeft,
                borderTop: '1px solid #E5E7EB',
                borderRight: '1px solid #E5E7EB',
                borderBottom: '1px solid #E5E7EB',
                borderRadius: '6px',
                padding: '12px 14px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                pointerEvents: 'auto',
                animation: 'rfSlideUp 0.2s cubic-bezier(0, 0, 0.2, 1) forwards',
              }}
            >
              <div style={{ marginTop: '1px', flexShrink: 0 }}>{getIcon(t.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
                  {t.title}
                </div>
                {t.message && (
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', lineHeight: 1.4 }}>
                    {t.message}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Đóng thông báo"
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
