import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastType } from '../components/common/Toast';

interface ToastContextType {
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={{
      showSuccess: toast.showSuccess,
      showError: toast.showError,
      showWarning: toast.showWarning,
      showInfo: toast.showInfo,
      removeToast: toast.removeToast,
      removeAllToasts: toast.removeAllToasts
    }}>
      {children}
    </ToastContext.Provider>
  );
};