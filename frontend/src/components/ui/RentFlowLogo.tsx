import React from 'react';

interface RentFlowLogoProps {
  size?: number;
  animated?: boolean;
  withText?: boolean;
  textColor?: string;
  className?: string;
}

export const RentFlowLogo: React.FC<RentFlowLogoProps> = ({
  size = 32,
  animated = false,
  withText = true,
  textColor = '#111827',
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size > 32 ? '12px' : '9px',
        userSelect: 'none',
      }}
    >
      {/* Precision Brand Icon SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
          flexShrink: 0,
        }}
      >
        <rect
          width="40"
          height="40"
          rx="10"
          fill="#00594C"
          style={animated ? { animation: 'rfPulseSoft 3s infinite ease-in-out' } : undefined}
        />
        {/* Modern Geometric R Emblem representing Building Columns & Lease Agreement Flow */}
        <path
          d="M13 10H22.5C25.5376 10 28 12.4624 28 15.5C28 18.5376 25.5376 21 22.5 21H18V30H13V10Z"
          fill="white"
        />
        <path
          d="M21 21L28 30H22.2L16.5 22.5"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Subtle Brand Accent Dot representing Room / Key Asset */}
        <circle cx="28.5" cy="11.5" r="2.5" fill="#34D399" />
      </svg>

      {withText && (
        <span
          style={{
            fontWeight: 700,
            fontSize: size >= 36 ? '20px' : '16px',
            color: textColor,
            letterSpacing: '-0.4px',
            lineHeight: 1,
          }}
        >
          RentFlow
        </span>
      )}
    </div>
  );
};
