import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';

export type ActionStatus = 'idle' | 'loading' | 'success' | 'failed';

export interface ActionModalOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'warning';
  // If simulatedAsync is true, will show spinner for duration then resolve with success or failure
  simulateFailureChance?: number; // 0 = always succeed, 1 = always fail, 0.2 = 20% fail
  simulateDelayMs?: number; // default 800ms
  successTitle?: string;
  successMessage?: string;
  failedTitle?: string;
  failedMessage?: string;
  onSuccess?: () => void;
  onFailed?: () => void;
}

interface ActionModalContextType {
  confirmAction: (options: ActionModalOptions) => Promise<boolean>;
  showSuccessModal: (title: string, message: string, onOk?: () => void) => void;
  showFailedModal: (title: string, message: string, onRetry?: () => void) => void;
}

const ActionModalContext = createContext<ActionModalContextType | undefined>(undefined);

export const ActionModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ActionModalOptions | null>(null);
  const [status, setStatus] = useState<ActionStatus>('idle');
  const [resolvePromise, setResolvePromise] = useState<((val: boolean) => void) | null>(null);

  // Success / Failure details
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [onResultDone, setOnResultDone] = useState<(() => void) | null>(null);

  const confirmAction = useCallback((opts: ActionModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setStatus('idle');
      setResultTitle('');
      setResultMessage('');
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  }, []);

  const showSuccessModal = useCallback((title: string, message: string, onOk?: () => void) => {
    setOptions({
      title,
      description: message,
    });
    setResultTitle(title);
    setResultMessage(message);
    setStatus('success');
    setOnResultDone(() => onOk || null);
    setIsOpen(true);
  }, []);

  const showFailedModal = useCallback((title: string, message: string, onRetry?: () => void) => {
    setOptions({
      title,
      description: message,
    });
    setResultTitle(title);
    setResultMessage(message);
    setStatus('failed');
    setOnResultDone(() => onRetry || null);
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    if (status === 'loading') return; // Cannot close while executing
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    if (onResultDone) {
      onResultDone();
      setOnResultDone(null);
    }
    setStatus('idle');
  };

  const handleExecute = async () => {
    if (!options) return;
    setStatus('loading');

    const delay = options.simulateDelayMs ?? 800;
    const failChance = options.simulateFailureChance ?? 0;

    await new Promise((r) => setTimeout(r, delay));

    const isFailed = Math.random() < failChance;

    if (isFailed) {
      setStatus('failed');
      setResultTitle(options.failedTitle || 'Thao tác không thành công');
      setResultMessage(
        options.failedMessage ||
          'Đã có lỗi phát sinh trong quá trình xử lý yêu cầu. Vui lòng kiểm tra lại kết nối hoặc thử lại.'
      );
      if (options.onFailed) options.onFailed();
      if (resolvePromise) resolvePromise(false);
    } else {
      setStatus('success');
      setResultTitle(options.successTitle || 'Thực hiện thành công!');
      setResultMessage(
        options.successMessage || 'Yêu cầu của bạn đã được hệ thống xử lý và cập nhật thành công.'
      );
      if (options.onSuccess) options.onSuccess();
      if (resolvePromise) resolvePromise(true);
    }
  };

  return (
    <ActionModalContext.Provider value={{ confirmAction, showSuccessModal, showFailedModal }}>
      {children}

      {isOpen && options && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(17, 24, 39, 0.55)',
            backdropFilter: 'blur(3px)',
            animation: 'rfFadeIn 0.15s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'rfScaleUp 0.18s ease-out',
            }}
          >
            {/* Header / Banner by status */}
            {status === 'idle' && (
              <div
                style={{
                  padding: '24px 24px 16px 24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor:
                      options.confirmVariant === 'danger'
                        ? '#FEE2E2'
                        : options.confirmVariant === 'warning'
                        ? '#FEF3C7'
                        : '#E0F2FE',
                    color:
                      options.confirmVariant === 'danger'
                        ? '#DC2626'
                        : options.confirmVariant === 'warning'
                        ? '#D97706'
                        : '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {options.confirmVariant === 'danger' ? (
                    <AlertTriangle size={24} />
                  ) : options.confirmVariant === 'warning' ? (
                    <AlertCircle size={24} />
                  ) : (
                    <HelpCircle size={24} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    {options.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#4B5563',
                      margin: '6px 0 0 0',
                      lineHeight: 1.5,
                    }}
                  >
                    {options.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {status === 'loading' && (
              <div
                style={{
                  padding: '40px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#E6F4EA',
                    color: '#00594C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Loader2 size={32} className="rf-spin" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Đang xử lý yêu cầu...
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '6px 0 0 0' }}>
                    Hệ thống đang kiểm tra và lưu thay đổi, vui lòng đợi trong giây lát.
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div
                style={{
                  padding: '32px 24px 20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#166534', margin: 0 }}>
                    {resultTitle || 'Xác nhận thành công!'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#374151', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                    {resultMessage || 'Thao tác đã được hoàn tất thành công.'}
                  </p>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div
                style={{
                  padding: '32px 24px 20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                    {resultTitle || 'Thao tác thất bại!'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#4B5563', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                    {resultMessage || 'Có sự cố xảy ra trong quá trình xử lý.'}
                  </p>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div
              style={{
                padding: '16px 24px',
                backgroundColor: '#F9FAFB',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              {status === 'idle' && (
                <>
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    onClick={handleClose}
                    style={{ fontSize: '13px' }}
                  >
                    {options.cancelText || 'Hủy bỏ'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExecute}
                    className={`rf-btn ${
                      options.confirmVariant === 'danger'
                        ? 'rf-btn-danger'
                        : 'rf-btn-primary'
                    }`}
                    style={{
                      fontSize: '13px',
                      backgroundColor:
                        options.confirmVariant === 'danger'
                          ? '#DC2626'
                          : options.confirmVariant === 'warning'
                          ? '#D97706'
                          : '#00594C',
                      color: '#FFFFFF',
                      border: 'none',
                    }}
                  >
                    {options.confirmText || 'Xác nhận'}
                  </button>
                </>
              )}

              {(status === 'success' || status === 'failed') && (
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  onClick={handleClose}
                  style={{
                    fontSize: '13px',
                    width: '100%',
                    backgroundColor: status === 'success' ? '#00594C' : '#4B5563',
                  }}
                >
                  Đóng thông báo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ActionModalContext.Provider>
  );
};

export const useActionModal = (): ActionModalContextType => {
  const context = useContext(ActionModalContext);
  if (!context) {
    throw new Error('useActionModal must be used within an ActionModalProvider');
  }
  return context;
};
