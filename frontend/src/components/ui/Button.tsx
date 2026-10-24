import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all 0.15s ease',
    border: '1px solid transparent',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '4px 10px', fontSize: '13px' },
    md: { padding: '8px 16px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '16px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--primary, #00594C)',
      color: '#ffffff',
      borderColor: 'var(--primary, #00594C)',
    },
    secondary: {
      backgroundColor: '#f1f5f9',
      color: 'var(--text-primary, #111827)',
      borderColor: '#cbd5e1',
    },
    danger: {
      backgroundColor: 'var(--danger, #DC2626)',
      color: '#ffffff',
      borderColor: 'var(--danger, #DC2626)',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: 'var(--primary, #00594C)',
      color: 'var(--primary, #00594C)',
    },
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...style }}
      {...props}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
};
