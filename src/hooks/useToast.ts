import { useState, useCallback } from 'react';
import { ToastType, ToastProps } from '../components/common/Toast';

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  type: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Date.now().toString();
    const duration = options.duration || 5000;

    const toast: ToastProps = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration,
      onClose: removeToast
    };

    setToasts(prev => [...prev, toast]);

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 편의 메서드들
  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};