import React from 'react';

interface Toast {
  id: string;
  status: 'success' | 'error';
  title: string;
  message: string;
}

interface ToastOverlayProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

export const ToastOverlay: React.FC<ToastOverlayProps> = ({
  toasts,
  onRemoveToast,
}) => {
  return (
    <div className="toast-overlay-container" data-testid="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-notification ${toast.status}`}
          data-testid={`toast-${toast.status}`}
        >
          <div className="toast-icon">{toast.status === 'success' ? '✅' : '⚠️'}</div>
          <div className="toast-body">
            <p className="toast-title">{toast.title}</p>
            <p className="toast-message">{toast.message}</p>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => onRemoveToast(toast.id)}
            data-testid={`toast-close-${toast.id}`}
          >
            ✕
          </button>
          <div className="toast-progress-bar">
            <div className="toast-progress-fill" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastOverlay;
