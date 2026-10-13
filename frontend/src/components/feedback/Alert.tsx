import React from 'react';

interface AlertProps {
  type?: 'info' | 'error' | 'success' | 'warning';
  title?: string;
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, message }) => {
  const bgColors: Record<string, string> = {
    info: 'var(--primary-light)',
    error: 'var(--danger-light)',
    success: '#f0fdf4',
    warning: '#fffbeb',
  };

  const textColors: Record<string, string> = {
    info: 'var(--primary)',
    error: 'var(--danger)',
    success: 'var(--success)',
    warning: 'var(--warning)',
  };

  return (
    <div
      role="alert"
      style={{
        padding: '12px 16px',
        borderRadius: '6px',
        backgroundColor: bgColors[type],
        color: textColors[type],
        border: `1px solid ${textColors[type]}40`,
        marginBottom: '16px',
      }}
    >
      {title && <div style={{ fontWeight: 600, marginBottom: '2px' }}>{title}</div>}
      <div style={{ fontSize: '14px' }}>{message}</div>
    </div>
  );
};
