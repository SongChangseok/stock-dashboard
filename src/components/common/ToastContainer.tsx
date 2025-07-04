import React from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .toast-slide-in {
            animation: slideInRight 0.3s ease-out;
          }
        `}
      </style>
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-slide-in"
          >
            <Toast
              {...toast}
              onClose={onRemoveToast}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastContainer;