import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, style, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
        {label && (
          <label htmlFor={inputId} style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${error ? 'var(--danger)' : '#cbd5e1'}`,
            fontSize: '14px',
            outline: 'none',
            ...style,
          }}
          {...props}
        />
        {error && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</span>}
        {helperText && !error && (
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
