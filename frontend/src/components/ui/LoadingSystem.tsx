import React from 'react';
import { RentFlowLogo } from './RentFlowLogo';
import { Loader2 } from 'lucide-react';

// 1. Fullscreen Brand Loader
export interface BrandLoaderProps {
  message?: string;
  subMessage?: string;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({
  message = 'Đang chuẩn bị không gian làm việc...',
  subMessage = 'Đang đồng bộ dữ liệu quản lý bất động sản',
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#FBFBF9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'rfFadeIn 0.25s cubic-bezier(0, 0, 0.2, 1) forwards',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <RentFlowLogo size={52} animated withText={false} />

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#111827',
              letterSpacing: '-0.2px',
            }}
          >
            {message}
          </div>
          {subMessage && (
            <div
              style={{
                fontSize: '12px',
                color: '#6B7280',
                marginTop: '4px',
              }}
            >
              {subMessage}
            </div>
          )}
        </div>

        {/* Precision Progress Bar */}
        <div
          style={{
            width: '180px',
            height: '3px',
            backgroundColor: '#E5E7EB',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '8px',
          }}
        >
          <div
            style={{
              width: '40%',
              height: '100%',
              backgroundColor: '#00594C',
              borderRadius: '2px',
              animation: 'rfShimmer 1.4s infinite ease-in-out',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// 2. Button Loader with Spinner
export interface ButtonSpinnerProps {
  size?: number;
  color?: string;
}

export const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({
  size = 14,
  color = 'currentColor',
}) => {
  return (
    <Loader2
      size={size}
      color={color}
      style={{
        animation: 'rfSpin 0.75s infinite linear',
        flexShrink: 0,
      }}
    />
  );
};

// 3. Inline Loader
export interface InlineLoaderProps {
  text?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({ text = 'Đang tải...' }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#6B7280',
        padding: '8px 0',
      }}
      role="status"
    >
      <ButtonSpinner size={14} color="#00594C" />
      <span>{text}</span>
    </div>
  );
};

// 4. Loading Overlay (Modal / Card / Table blocking task)
export interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Đang xử lý dữ liệu...',
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        borderRadius: 'inherit',
        animation: 'rfFadeIn 0.15s ease-out forwards',
      }}
      role="status"
      aria-busy="true"
    >
      <ButtonSpinner size={24} color="#00594C" />
      <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginTop: '8px' }}>
        {message}
      </span>
    </div>
  );
};

// 5. Semantic Skeletons (Table, Card, Text)
export const SkeletonText: React.FC<{ width?: string; height?: string }> = ({
  width = '100%',
  height = '14px',
}) => {
  return (
    <div
      className="rf-skeleton"
      style={{ width, height, borderRadius: '4px' }}
      aria-hidden="true"
    />
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      aria-busy="true"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          padding: '12px 16px',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#FAFAFA',
          gap: '12px',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonText key={i} height="12px" width="60%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            padding: '16px',
            borderBottom: r < rows - 1 ? '1px solid #F3F4F6' : 'none',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <SkeletonText key={c} height="14px" width={c === 0 ? '75%' : '50%'} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonDashboard: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} aria-busy="true">
      {/* Metric Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkeletonText width="50%" height="12px" />
            <SkeletonText width="70%" height="28px" />
            <SkeletonText width="40%" height="11px" />
          </div>
        ))}
      </div>
      {/* Content Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        <SkeletonTable rows={4} columns={4} />
        <div className="rf-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SkeletonText width="60%" height="16px" />
          <SkeletonText width="100%" height="80px" />
          <SkeletonText width="100%" height="80px" />
        </div>
      </div>
    </div>
  );
};
