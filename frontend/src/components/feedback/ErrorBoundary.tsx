import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in RentFlow UI:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            className="rf-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              textAlign: 'center',
              padding: '36px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={28} color="#DC2626" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>
              {this.props.fallbackTitle || 'Đã xảy ra sự cố hiển thị'}
            </h3>

            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              Một lỗi giao diện bất ngờ đã xuất hiện. Bạn có thể tải lại trang hoặc quay về trang chủ để tiếp tục làm việc.
            </p>

            {this.state.error && (
              <div
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#991B1B',
                  textAlign: 'left',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={this.handleReset}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} /> Tải lại trang
              </button>
              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => {
                  window.location.href = '/properties';
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Home size={14} /> Về danh sách cơ sở
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
